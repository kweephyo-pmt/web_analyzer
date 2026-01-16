import uuid
from datetime import datetime
from typing import Dict, List, Optional
from sqlalchemy.orm import Session
from database import Analysis, get_db


class DatabaseStore:
    """Database-backed storage for analysis results"""
    
    def create_analysis(self, db: Session, user_email: str, urls: List[str]) -> str:
        """Create a new analysis entry"""
        analysis_id = str(uuid.uuid4())
        
        analysis = Analysis(
            analysis_id=analysis_id,
            user_email=user_email,
            urls=urls,
            created_at=datetime.utcnow(),
            status='processing'
        )
        
        db.add(analysis)
        db.commit()
        db.refresh(analysis)
        
        return analysis_id
    
    def update_analysis(self, db: Session, analysis_id: str, data: Dict):
        """Update analysis with results"""
        analysis = db.query(Analysis).filter(Analysis.analysis_id == analysis_id).first()
        
        if analysis:
            # Update fields
            for key, value in data.items():
                if hasattr(analysis, key):
                    setattr(analysis, key, value)
            
            # Set status to completed unless explicitly set to failed
            if 'status' not in data:
                analysis.status = 'completed'
            
            db.commit()
            db.refresh(analysis)
    
    def get_analysis(self, db: Session, analysis_id: str) -> Optional[Dict]:
        """Get analysis by ID"""
        analysis = db.query(Analysis).filter(Analysis.analysis_id == analysis_id).first()
        
        if not analysis:
            return None
        
        return {
            'analysis_id': analysis.analysis_id,
            'user_email': analysis.user_email,
            'urls': analysis.urls,
            'created_at': analysis.created_at,
            'status': analysis.status,
            'scraped_data': analysis.scraped_data,
            'knowledge_graph': analysis.knowledge_graph,
            'topical_maps': analysis.topical_maps,
            'comparison': analysis.comparison,
            'error': analysis.error
        }
    
    def get_user_analyses(self, db: Session, user_email: str) -> List[Dict]:
        """Get all analyses for a user"""
        analyses = db.query(Analysis).filter(
            Analysis.user_email == user_email
        ).order_by(Analysis.created_at.desc()).all()
        
        return [
            {
                'analysis_id': a.analysis_id,
                'user_email': a.user_email,
                'urls': a.urls,
                'created_at': a.created_at,
                'status': a.status,
                'scraped_data': a.scraped_data,
                'knowledge_graph': a.knowledge_graph,
                'topical_maps': a.topical_maps,
                'comparison': a.comparison,
                'error': a.error
            }
            for a in analyses
        ]
    
    def delete_analysis(self, db: Session, analysis_id: str):
        """Delete an analysis"""
        analysis = db.query(Analysis).filter(Analysis.analysis_id == analysis_id).first()
        
        if analysis:
            db.delete(analysis)
            db.commit()


# Singleton instance
database_store = DatabaseStore()
