"""User management utilities"""
from sqlalchemy.orm import Session
from database import User
from datetime import datetime
from typing import Optional


def get_or_create_user(db: Session, email: str, name: str = None, picture: str = None) -> User:
    """Get existing user or create new one"""
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        # Update last login and user info
        user.last_login = datetime.utcnow()
        if name:
            user.name = name
        if picture:
            user.picture = picture
        db.commit()
        db.refresh(user)
    else:
        # Create new user
        user = User(
            email=email,
            name=name,
            picture=picture,
            created_at=datetime.utcnow(),
            last_login=datetime.utcnow()
        )
        db.add(user)
        db.commit()
        db.refresh(user)
    
    return user


def update_gsc_token(db: Session, email: str, gsc_token: str) -> User:
    """Update user's GSC token"""
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise ValueError(f"User {email} not found")
    
    user.gsc_token = gsc_token
    user.gsc_connected_at = datetime.utcnow()
    db.commit()
    db.refresh(user)
    
    return user


def clear_gsc_token(db: Session, email: str) -> User:
    """Clear user's GSC token"""
    user = db.query(User).filter(User.email == email).first()
    
    if not user:
        raise ValueError(f"User {email} not found")
    
    user.gsc_token = None
    user.gsc_connected_at = None
    db.commit()
    db.refresh(user)
    
    return user


def get_user_gsc_token(db: Session, email: str) -> Optional[str]:
    """Get user's GSC token if exists"""
    user = db.query(User).filter(User.email == email).first()
    
    if user:
        return user.gsc_token
    
    return None
