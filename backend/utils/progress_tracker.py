"""
Progress tracking for analysis tasks
Stores progress updates in memory for real-time streaming to clients
"""
from typing import Dict, Optional
from datetime import datetime
import asyncio

class ProgressTracker:
    def __init__(self):
        self._progress: Dict[str, dict] = {}
        self._lock = asyncio.Lock()
    
    async def create(self, analysis_id: str, total_steps: int):
        """Initialize progress tracking for an analysis"""
        async with self._lock:
            self._progress[analysis_id] = {
                'current_step': 0,
                'total_steps': total_steps,
                'status': 'starting',
                'message': 'Initializing analysis...',
                'percentage': 0,
                'started_at': datetime.utcnow().isoformat(),
                'updated_at': datetime.utcnow().isoformat()
            }
    
    async def update(self, analysis_id: str, step: int, status: str, message: str):
        """Update progress for an analysis"""
        async with self._lock:
            if analysis_id not in self._progress:
                return
            
            progress = self._progress[analysis_id]
            progress['current_step'] = step
            progress['status'] = status
            progress['message'] = message
            progress['percentage'] = int((step / progress['total_steps']) * 100)
            progress['updated_at'] = datetime.utcnow().isoformat()
    
    async def complete(self, analysis_id: str, message: str = 'Analysis complete!'):
        """Mark analysis as complete"""
        async with self._lock:
            if analysis_id not in self._progress:
                return
            
            progress = self._progress[analysis_id]
            progress['current_step'] = progress['total_steps']
            progress['status'] = 'complete'
            progress['message'] = message
            progress['percentage'] = 100
            progress['updated_at'] = datetime.utcnow().isoformat()
    
    async def fail(self, analysis_id: str, error: str):
        """Mark analysis as failed"""
        async with self._lock:
            if analysis_id not in self._progress:
                return
            
            progress = self._progress[analysis_id]
            progress['status'] = 'failed'
            progress['message'] = f'Error: {error}'
            progress['updated_at'] = datetime.utcnow().isoformat()
    
    async def get(self, analysis_id: str) -> Optional[dict]:
        """Get current progress for an analysis"""
        async with self._lock:
            return self._progress.get(analysis_id)
    
    async def cleanup(self, analysis_id: str):
        """Remove progress tracking (call after client disconnects)"""
        async with self._lock:
            if analysis_id in self._progress:
                del self._progress[analysis_id]

# Global progress tracker instance
progress_tracker = ProgressTracker()
