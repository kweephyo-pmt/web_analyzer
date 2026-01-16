from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks
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
from database import get_db
from datetime import datetime

router = APIRouter()


# ============= Authentication Routes =============

@router.post("/auth/google/login", response_model=TokenResponse)
async def google_login(request: dict):
    """Login with Google OAuth token"""
    token = request.get('token')
    if not token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token is required"
        )
    
    # Verify Google token
    user_info = await verify_google_token(token)
    
    # Create JWT access token
    access_token = create_access_token(
        data={
            "sub": user_info.email,
            "name": user_info.name,
            "picture": user_info.picture
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


# ============= Analysis Routes =============

async def process_analysis(analysis_id: str, urls: List[str]):
    """Background task to process analysis with AI"""
    from database import SessionLocal
    db = SessionLocal()
    
    try:
        print(f"[{analysis_id}] Starting analysis for {len(urls)} URLs...")
        
        # Scrape URLs
        print(f"[{analysis_id}] Scraping URLs...")
        scraped_data = await scraper.scrape_multiple(urls)
        
        # Generate knowledge graph with AI
        print(f"[{analysis_id}] Generating knowledge graph with AI...")
        knowledge_graph = await kg_generator.generate_graph(scraped_data)
        
        # Generate topical maps with AI
        print(f"[{analysis_id}] Generating topical maps with AI...")
        topical_maps = await topical_generator.generate_multiple(scraped_data)
        
        # Generate comparison with AI (if multiple URLs)
        comparison = None
        if len(urls) >= 2:
            print(f"[{analysis_id}] Generating comparison with AI...")
            comparison = await comparator.compare_websites(scraped_data, topical_maps)
        
        # Update storage - convert Pydantic models to dicts
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
        print(f"[{analysis_id}] ✅ Successfully completed!")
        
    except Exception as e:
        print(f"[{analysis_id}] ❌ Error processing analysis: {str(e)}")
        import traceback
        traceback.print_exc()
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
