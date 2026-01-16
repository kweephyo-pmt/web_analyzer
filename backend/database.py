from sqlalchemy import create_engine, Column, String, DateTime, Text, JSON
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os

# Database setup
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./web_analysis.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False} if "sqlite" in DATABASE_URL else {})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()


class Analysis(Base):
    """Database model for analysis results"""
    __tablename__ = "analyses"
    
    analysis_id = Column(String, primary_key=True, index=True)
    user_email = Column(String, index=True, nullable=False)
    urls = Column(JSON, nullable=False)  # List of URLs
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    status = Column(String, default="processing", nullable=False)
    
    # Analysis results stored as JSON
    scraped_data = Column(JSON, nullable=True)
    knowledge_graph = Column(JSON, nullable=True)
    topical_maps = Column(JSON, nullable=True)
    comparison = Column(JSON, nullable=True)
    error = Column(Text, nullable=True)


# Create tables
def init_db():
    """Initialize database tables"""
    Base.metadata.create_all(bind=engine)


# Dependency to get DB session
def get_db():
    """Get database session"""
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
