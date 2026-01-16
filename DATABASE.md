# Database Implementation

## Overview
The application now uses **SQLite database** for persistent storage instead of in-memory storage.

## What Changed

### Before (In-Memory Storage)
- ❌ Data lost on server restart
- ❌ No persistence
- ❌ Limited scalability

### After (SQLite Database)
- ✅ **Persistent storage** - Data survives server restarts
- ✅ **Automatic backups** - Database file can be backed up
- ✅ **Production ready** - Suitable for small to medium applications
- ✅ **Easy migration** - Can upgrade to PostgreSQL later if needed

## Database Location

The SQLite database file is created at:
```
backend/web_analysis.db
```

## Database Schema

### `analyses` Table
| Column | Type | Description |
|--------|------|-------------|
| analysis_id | String (PK) | Unique UUID for each analysis |
| user_email | String (Indexed) | User's email address |
| urls | JSON | List of analyzed URLs |
| created_at | DateTime | Timestamp of creation |
| status | String | processing/completed/failed |
| scraped_data | JSON | Scraped website data |
| knowledge_graph | JSON | Generated knowledge graph |
| topical_maps | JSON | Topical map analysis |
| comparison | JSON | Comparison results (if 2+ URLs) |
| error | Text | Error message (if failed) |

## How It Works

1. **On Server Start**: Database tables are automatically created
2. **On Analysis**: New record inserted with status='processing'
3. **During Processing**: Background task updates the record
4. **On Completion**: Status updated to 'completed' with results
5. **On Error**: Status updated to 'failed' with error message

## Features

### Automatic Initialization
- Tables created automatically on first run
- No manual setup required

### Session Management
- Proper database session handling
- Automatic cleanup after requests

### Data Persistence
- All analysis history saved permanently
- Survives server restarts
- Can be backed up easily

## Backup & Restore

### Backup
```bash
# Copy the database file
cp backend/web_analysis.db backend/web_analysis_backup.db
```

### Restore
```bash
# Restore from backup
cp backend/web_analysis_backup.db backend/web_analysis.db
```

## Migration to PostgreSQL (Future)

To migrate to PostgreSQL later:

1. Update `.env`:
```env
DATABASE_URL=postgresql://user:password@localhost/dbname
```

2. Install PostgreSQL driver:
```bash
pip install psycopg2-binary
```

3. Restart server - tables will be created automatically!

## Troubleshooting

### Database Locked Error
If you see "database is locked":
- Close any other connections to the database
- Restart the server

### Reset Database
To start fresh:
```bash
rm backend/web_analysis.db
# Restart server - new database will be created
```

## Technical Details

- **ORM**: SQLAlchemy 2.0
- **Database**: SQLite (file-based)
- **Connection Pool**: Managed by SQLAlchemy
- **Thread Safety**: Enabled with check_same_thread=False
