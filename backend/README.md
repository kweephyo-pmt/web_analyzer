# Web Analysis Platform - Backend

Modern FastAPI backend for AI-powered website analysis with knowledge graphs, topical mapping, and competitive comparison.

## Features

- 🔐 **Google OAuth 2.0 Authentication**
- 🕷️ **Async Web Scraping** with BeautifulSoup4
- 🕸️ **Knowledge Graph Generation** using NetworkX
- 📊 **Topical Map Analysis** with semantic understanding
- ⚖️ **Website Comparison** with similarity scoring
- 🚀 **Background Task Processing** for efficient analysis
- 📝 **Comprehensive API Documentation** with Swagger UI

## Tech Stack

- **FastAPI** - Modern, fast web framework
- **Pydantic** - Data validation and settings
- **httpx** - Async HTTP client
- **BeautifulSoup4** - HTML parsing
- **NetworkX** - Graph analysis
- **Google Auth** - OAuth 2.0 authentication
- **python-jose** - JWT token handling

## Quick Start

### 1. Create Virtual Environment

```bash
python -m venv venv
source venv/bin/activate  # On Mac/Linux
# or
venv\Scripts\activate  # On Windows
```

### 2. Install Dependencies

```bash
pip install -r requirements.txt
```

### 3. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
SECRET_KEY=your-super-secret-jwt-key
```

### 4. Run the Server

```bash
python main.py
```

Or with uvicorn directly:

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:
- **API**: http://localhost:8000
- **Swagger Docs**: http://localhost:8000/docs
- **ReDoc**: http://localhost:8000/redoc

## Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Navigate to "APIs & Services" > "Credentials"
4. Click "Create Credentials" > "OAuth client ID"
5. Choose "Web application"
6. Add authorized JavaScript origins:
   - `http://localhost:5173`
7. Add authorized redirect URIs:
   - `http://localhost:5173`
8. Copy Client ID and Client Secret to `.env`

## API Endpoints

### Authentication

- `POST /auth/google/login` - Login with Google OAuth token
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user info

### Analysis

- `POST /api/analyze` - Submit URLs for analysis (1-5 URLs)
- `GET /api/results/{analysis_id}` - Get analysis summary
- `GET /api/knowledge-graph/{analysis_id}` - Get knowledge graph data
- `GET /api/topical-map/{analysis_id}` - Get topical maps
- `GET /api/compare/{analysis_id}` - Get comparison (requires 2+ URLs)
- `GET /api/history` - Get user's analysis history

### System

- `GET /` - API info
- `GET /health` - Health check

## Project Structure

```
backend/
├── api/
│   ├── __init__.py
│   └── routes.py          # API endpoints
├── auth/
│   ├── __init__.py
│   └── auth.py            # OAuth & JWT handling
├── models/
│   ├── __init__.py
│   └── schemas.py         # Pydantic models
├── services/
│   ├── __init__.py
│   ├── scraper.py         # Web scraping
│   ├── knowledge_graph.py # Graph generation
│   ├── topical_map.py     # Topical analysis
│   └── comparator.py      # Website comparison
├── utils/
│   ├── __init__.py
│   └── storage.py         # In-memory storage
├── config.py              # Configuration
├── main.py                # FastAPI app
├── requirements.txt       # Dependencies
└── .env.example          # Environment template
```

## Development

### Run with Auto-reload

```bash
python main.py
```

### View API Documentation

Open http://localhost:8000/docs for interactive Swagger UI

### Testing Endpoints

Use the Swagger UI or curl:

```bash
# Health check
curl http://localhost:8000/health

# Login (requires Google token)
curl -X POST http://localhost:8000/auth/google/login \
  -H "Content-Type: application/json" \
  -d '{"token": "your-google-token"}'

# Analyze URLs (requires JWT token)
curl -X POST http://localhost:8000/api/analyze \
  -H "Authorization: Bearer your-jwt-token" \
  -H "Content-Type: application/json" \
  -d '{"urls": ["https://example.com"]}'
```

## Features Explained

### Web Scraping
- Async concurrent scraping for multiple URLs
- Extracts metadata, headings, content, links, and images
- Handles timeouts and errors gracefully
- User-agent spoofing for better compatibility

### Knowledge Graph
- Automatic entity extraction (domains, services, technologies, audiences)
- Relationship mapping between entities
- Color-coded nodes by entity type
- Interactive graph visualization support

### Topical Map
- Business description generation (150-250 words)
- Search intent analysis (Informational, Transactional, etc.)
- Target audience identification
- Business model classification (B2B, B2C, SaaS, etc.)
- Conversion method detection
- Key topic extraction from headings

### Comparison
- Business model comparison
- Service overlap detection
- Unique feature identification
- Technology stack analysis
- Geographic coverage mapping
- Similarity matrix calculation

## Storage

Currently uses in-memory storage for development. For production, consider:
- PostgreSQL with SQLAlchemy
- MongoDB for document storage
- Redis for caching

## Security

- JWT tokens with expiration
- Google OAuth 2.0 verification
- CORS configuration
- User-specific data access control
- Bearer token authentication

## Performance

- Async/await for concurrent operations
- Background task processing
- Efficient HTML parsing with lxml
- Request timeout handling
- Result caching in memory

## License

MIT
