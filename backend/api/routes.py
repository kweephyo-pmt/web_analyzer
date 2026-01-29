from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks, Request
from fastapi.responses import StreamingResponse
from typing import List
from sqlalchemy.orm import Session
from models.schemas import (
    URLAnalysisRequest, AnalysisResponse, TokenResponse,
    UserInfo, KnowledgeGraphData, TopicalMapData, ComparisonData,
    FullAnalysisResult
)
from auth.auth import verify_google_token, create_access_token, get_current_user
from services import scraper, kg_generator, topical_generator, comparator
from utils.storage import database_store
from utils.progress_tracker import progress_tracker
from database import get_db
from datetime import datetime
import asyncio
import json

router = APIRouter()


# ============= Authentication Routes =============

@router.post("/auth/google/login", response_model=TokenResponse)
async def google_login(request: dict, db: Session = Depends(get_db)):
    """Login with Google OAuth token"""
    from utils.user_manager import get_or_create_user
    
    token = request.get('token')
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token is required"
        )
    
    # Verify Google token
    user_info = await verify_google_token(token)
    
    # Create or update user in database
    db_user = get_or_create_user(
        db,
        email=user_info.email,
        name=user_info.name,
        picture=user_info.picture
    )
    
    # Create JWT access token
    access_token = create_access_token(
        data={
            "sub": user_info.email,
            "name": user_info.name,
            "picture": user_info.picture,
            "gsc_connected": db_user.gsc_token is not None
        }
    )
    
    return TokenResponse(
        access_token=access_token,
        user=user_info
    )


@router.post("/auth/logout")
async def logout(current_user: UserInfo = Depends(get_current_user)):
    """Logout user"""
    return {"message": "Successfully logged out"}


@router.get("/auth/me", response_model=UserInfo)
async def get_me(current_user: UserInfo = Depends(get_current_user)):
    """Get current user info"""
    return current_user


# ============= Google Search Console Routes =============

@router.post("/auth/gsc/connect")
async def connect_gsc(
    request: dict, 
    current_user: UserInfo = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Connect Google Search Console with OAuth token that has webmasters scope
    This endpoint stores the GSC access token in the database
    """
    from services.gsc_service import GSCService
    from utils.user_manager import update_gsc_token
    
    gsc_token = request.get('gsc_token')
    if not gsc_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="GSC token is required"
        )
    
    # Verify the token works by trying to fetch properties
    try:
        service = GSCService(gsc_token)
        properties = await service.get_properties()
        
        # Store the token in database
        update_gsc_token(db, current_user.email, gsc_token)
        
        return {
            "message": "Successfully connected to Google Search Console",
            "properties_count": len(properties),
            "connected": True
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Failed to connect to Google Search Console: {str(e)}"
        )


@router.get("/auth/gsc/properties")
async def get_gsc_properties(
    current_user: UserInfo = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get list of Search Console properties accessible by the user
    Uses the stored GSC token from database
    """
    from services.gsc_service import get_user_properties
    from utils.user_manager import get_user_gsc_token
    
    # Get token from database
    gsc_token = get_user_gsc_token(db, current_user.email)
    
    if not gsc_token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="GSC not connected. Please connect your Google Search Console account first."
        )
    
    try:
        properties = await get_user_properties(gsc_token)
        return {"properties": properties}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch properties: {str(e)}"
        )


@router.post("/auth/gsc/disconnect")
async def disconnect_gsc(
    current_user: UserInfo = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Disconnect Google Search Console"""
    from utils.user_manager import clear_gsc_token
    
    try:
        clear_gsc_token(db, current_user.email)
        return {"message": "Successfully disconnected from Google Search Console"}
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to disconnect: {str(e)}"
        )


@router.get("/auth/gsc/pages/{property_url:path}")
async def get_gsc_pages(
    property_url: str,
    days: int = 90,
    current_user: UserInfo = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all pages from a GSC property with their ranking queries
    Used for cluster analysis and page selection
    """
    from services.gsc_service import GSCService
    from utils.user_manager import get_user_gsc_token
    from urllib.parse import unquote
    
    # Decode the URL-encoded property URL
    property_url = unquote(property_url)
    
    # Get token from database
    gsc_token = get_user_gsc_token(db, current_user.email)
    
    if not gsc_token:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="GSC not connected. Please connect your Google Search Console account first."
        )
    
    try:
        service = GSCService(gsc_token)
        pages = await service.get_pages_with_queries(property_url, days)
        return {
            "property_url": property_url,
            "pages": pages,
            "total_pages": len(pages)
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch pages: {str(e)}"
        )


# ============= Analysis Routes =============

@router.get("/api/progress/{analysis_id}")
async def stream_progress(
    analysis_id: str,
    request: Request,
    token: str,
    db: Session = Depends(get_db)
):
    """Stream real-time progress updates using Server-Sent Events (SSE)"""
    # Verify token (EventSource doesn't support custom headers)
    from auth.auth import verify_token
    try:
        payload = verify_token(token)
        user_email = payload.get("sub")
        if not user_email:
            raise HTTPException(status_code=401, detail="Invalid token")
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid or expired token")

    
    async def event_generator():
        """Generate SSE events with progress updates"""
        try:
            # Send initial connection message
            yield f"data: {json.dumps({'status': 'connected', 'message': 'Progress stream connected'})}\n\n"
            
            last_update = None
            while True:
                # Check if client disconnected
                if await request.is_disconnected():
                    print(f"[{analysis_id}] Client disconnected from progress stream")
                    break
                
                # Get current progress
                progress = await progress_tracker.get(analysis_id)
                
                if progress:
                    # Only send update if progress changed
                    if progress != last_update:
                        yield f"data: {json.dumps(progress)}\n\n"
                        last_update = progress.copy()
                    
                    # If complete or failed, send final message and close
                    if progress['status'] in ['complete', 'failed']:
                        await asyncio.sleep(0.5)  # Give client time to process
                        break
                else:
                    # No progress data yet, send waiting message
                    yield f"data: {json.dumps({'status': 'waiting', 'message': 'Waiting for analysis to start...'})}\n\n"
                
                # Wait before next check (adjust polling interval as needed)
                await asyncio.sleep(0.5)
                
        except asyncio.CancelledError:
            print(f"[{analysis_id}] Progress stream cancelled")
        except Exception as e:
            print(f"[{analysis_id}] Error in progress stream: {str(e)}")
            yield f"data: {json.dumps({'status': 'error', 'message': str(e)})}\n\n"
        finally:
            # Cleanup progress data after stream ends
            await asyncio.sleep(5)  # Keep data for a bit in case of reconnection
            await progress_tracker.cleanup(analysis_id)
    
    return StreamingResponse(
        event_generator(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no"  # Disable nginx buffering
        }
    )


async def process_analysis(analysis_id: str, urls: List[str]):
    """Background task to process analysis with AI"""
    from database import SessionLocal
    db = SessionLocal()
    
    try:
        # Initialize progress tracking (5 main steps)
        await progress_tracker.create(analysis_id, total_steps=5)
        
        print(f"[{analysis_id}] Starting analysis for {len(urls)} URLs...")
        await progress_tracker.update(analysis_id, 1, 'scraping', f'Scraping {len(urls)} website(s)...')
        
        # Scrape URLs
        print(f"[{analysis_id}] Scraping URLs...")
        scraped_data = await scraper.scrape_multiple(urls)
        
        # Generate knowledge graph with AI
        await progress_tracker.update(analysis_id, 2, 'knowledge_graph', 'Generating knowledge graph with AI...')
        print(f"[{analysis_id}] Generating knowledge graph with AI...")
        knowledge_graph = await kg_generator.generate_graph(scraped_data)
        
        # Generate topical maps with AI
        await progress_tracker.update(analysis_id, 3, 'topical_map', 'Creating topical maps and content strategy...')
        print(f"[{analysis_id}] Generating topical maps with AI...")
        topical_maps = await topical_generator.generate_multiple(scraped_data)
        
        # Generate comparison with AI (if multiple URLs)
        comparison = None
        if len(urls) >= 2:
            await progress_tracker.update(analysis_id, 4, 'comparison', 'Comparing websites...')
            print(f"[{analysis_id}] Generating comparison with AI...")
            comparison = await comparator.compare_websites(scraped_data, topical_maps)
        else:
            # Skip comparison step if single URL
            await progress_tracker.update(analysis_id, 4, 'comparison', 'Skipping comparison (single URL)...')
        
        # Update storage - convert Pydantic models to dicts
        await progress_tracker.update(analysis_id, 5, 'finalizing', 'Saving results...')
        print(f"[{analysis_id}] Analysis complete! Storing results...")
        
        # Convert Pydantic models to dictionaries for JSON serialization
        def serialize_data(data):
            """Convert Pydantic models to dictionaries"""
            if hasattr(data, 'model_dump'):
                return data.model_dump()
            elif isinstance(data, list):
                return [serialize_data(item) for item in data]
            elif isinstance(data, dict):
                return {k: serialize_data(v) for k, v in data.items()}
            return data
        
        database_store.update_analysis(db, analysis_id, {
            'scraped_data': serialize_data(scraped_data),
            'knowledge_graph': serialize_data(knowledge_graph),
            'topical_maps': serialize_data(topical_maps),
            'comparison': serialize_data(comparison) if comparison else None,
        })
        
        # Mark as complete
        await progress_tracker.complete(analysis_id, 'Analysis complete! Redirecting to results...')
        print(f"[{analysis_id}] ✅ Successfully completed!")
        
    except Exception as e:
        print(f"[{analysis_id}] ❌ Error processing analysis: {str(e)}")
        import traceback
        traceback.print_exc()
        
        # Update progress tracker with error
        await progress_tracker.fail(analysis_id, str(e))
        
        try:
            db.rollback()  # Rollback failed transaction
            database_store.update_analysis(db, analysis_id, {
                'status': 'failed',
                'error': str(e)
            })
        except Exception as db_error:
            print(f"[{analysis_id}] Failed to update error status: {str(db_error)}")
    finally:
        db.close()


@router.post("/api/analyze", response_model=AnalysisResponse)
async def analyze_urls(
    request: URLAnalysisRequest,
    background_tasks: BackgroundTasks,
    current_user: UserInfo = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Submit URLs for analysis"""
    # Create analysis entry
    analysis_id = database_store.create_analysis(db, current_user.email, request.urls)
    
    # Process in background
    background_tasks.add_task(process_analysis, analysis_id, request.urls)
    
    return AnalysisResponse(
        analysis_id=analysis_id,
        status="processing",
        message=f"Analysis started for {len(request.urls)} URL(s)"
    )


@router.get("/api/results/{analysis_id}")
async def get_results(
    analysis_id: str,
    current_user: UserInfo = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get complete analysis results"""
    analysis = database_store.get_analysis(db, analysis_id)
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    if analysis['user_email'] != current_user.email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    if analysis['status'] == 'processing':
        return {
            "analysis_id": analysis_id,
            "status": "processing",
            "message": "Analysis in progress"
        }
    
    return {
        "analysis_id": analysis['analysis_id'],
        "urls": analysis['urls'],
        "created_at": analysis['created_at'],
        "status": analysis['status']
    }


@router.get("/api/knowledge-graph/{analysis_id}", response_model=dict)
async def get_knowledge_graph(
    analysis_id: str,
    current_user: UserInfo = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get knowledge graph for analysis"""
    analysis = database_store.get_analysis(db, analysis_id)
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    if analysis['user_email'] != current_user.email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Return processing status if not ready
    if analysis['status'] == 'processing':
        return {
            "status": "processing",
            "message": "Knowledge graph is being generated..."
        }
    
    if analysis['status'] == 'failed':
        return {
            "status": "failed",
            "error": analysis.get('error', 'Unknown error')
        }
    
    if not analysis.get('knowledge_graph'):
        return {
            "status": "processing",
            "message": "Knowledge graph not yet available"
        }
    
    return {"knowledge_graph": analysis['knowledge_graph']}


@router.get("/api/topical-map/{analysis_id}", response_model=dict)
async def get_topical_map(
    analysis_id: str,
    current_user: UserInfo = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get topical maps for analysis"""
    analysis = database_store.get_analysis(db, analysis_id)
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    if analysis['user_email'] != current_user.email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Return processing status if not ready
    if analysis['status'] == 'processing':
        return {
            "status": "processing",
            "message": "Topical maps are being generated..."
        }
    
    if analysis['status'] == 'failed':
        return {
            "status": "failed",
            "error": analysis.get('error', 'Unknown error')
        }
    
    if not analysis.get('topical_maps'):
        return {
            "status": "processing",
            "message": "Topical maps not yet available"
        }
    
    return {"topical_maps": analysis['topical_maps']}


@router.get("/api/compare/{analysis_id}", response_model=dict)
async def get_comparison(
    analysis_id: str,
    current_user: UserInfo = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get comparison data for analysis"""
    analysis = database_store.get_analysis(db, analysis_id)
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    if analysis['user_email'] != current_user.email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Return processing status if not ready
    if analysis['status'] == 'processing':
        return {
            "status": "processing",
            "message": "Comparison is being generated..."
        }
    
    if analysis['status'] == 'failed':
        return {
            "status": "failed",
            "error": analysis.get('error', 'Unknown error')
        }
    
    comparison = analysis.get('comparison')
    if not comparison:
        # Check if this was a single URL analysis
        if len(analysis.get('urls', [])) < 2:
            return {
                "status": "not_applicable",
                "message": "Comparison requires 2 or more URLs"
            }
        return {
            "status": "processing",
            "message": "Comparison not yet available"
        }
    
    return {"comparison": comparison}


@router.get("/api/history")
async def get_history(
    current_user: UserInfo = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get user's analysis history"""
    analyses = database_store.get_user_analyses(db, current_user.email)
    
    # Return summary info only
    return {
        "analyses": [
            {
                "analysis_id": a['analysis_id'],
                "urls": a['urls'],
                "created_at": a['created_at'],
                "status": a['status']
            }
            for a in analyses
        ]
    }


@router.delete("/api/analysis/{analysis_id}")
async def delete_analysis(
    analysis_id: str,
    current_user: UserInfo = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete an analysis"""
    analysis = database_store.get_analysis(db, analysis_id)
    
    if not analysis:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Analysis not found"
        )
    
    if analysis['user_email'] != current_user.email:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Delete the analysis
    database_store.delete_analysis(db, analysis_id)
    
    return {"message": "Analysis deleted successfully"}
