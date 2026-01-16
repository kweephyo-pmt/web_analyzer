# Quick Start Guide

## 🚀 Get Started in 5 Minutes

### Prerequisites
- Python 3.9+ installed
- Node.js 18+ installed
- Google account (for OAuth)

### Step 1: Run Setup Script

```bash
cd "/Users/phyominthein/Desktop/TBS Marketing/web"
./setup.sh
```

This will:
- Create Python virtual environment
- Install all backend dependencies
- Install all frontend dependencies
- Create `.env` files from templates

### Step 2: Configure Google OAuth

#### Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project (or select existing)
3. Enable **Google+ API**
4. Go to **APIs & Services** → **Credentials**
5. Click **Create Credentials** → **OAuth client ID**
6. Choose **Web application**
7. Configure:
   - **Authorized JavaScript origins**: `http://localhost:5173`
   - **Authorized redirect URIs**: `http://localhost:5173/auth/callback`
8. Click **Create** and copy:
   - Client ID
   - Client Secret

#### Add Credentials to .env Files

**Backend** (`backend/.env`):
```env
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-client-secret
```

**Frontend** (`frontend/.env`):
```env
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
```

### Step 3: Start Backend

```bash
cd backend
source venv/bin/activate  # Activate virtual environment
python main.py
```

Backend will start on `http://localhost:8000`

### Step 4: Start Frontend (New Terminal)

```bash
cd frontend
npm run dev
```

Frontend will start on `http://localhost:5173`

### Step 5: Use the Application

1. Open browser: `http://localhost:5173`
2. Click **Sign in with Google**
3. Enter 2-5 URLs to analyze (e.g., competitor websites)
4. Click **🚀 Analyze Websites**
5. View results in tabs:
   - **🕸️ Knowledge Graph**: Interactive entity visualization
   - **📊 Topical Map**: Business insights and analysis
   - **⚖️ Comparison**: Side-by-side comparison (2+ URLs)

## 🧪 Test with Sample URLs

Try analyzing these logistics/delivery companies:
- https://www.lalamove.com
- https://www.grab.com
- https://www.uber.com
- https://www.doordash.com
- https://www.instacart.com

## 📝 Features Overview

### Knowledge Graph
- Visualizes relationships between entities
- Color-coded by type (services, audiences, technologies, locations)
- Interactive zoom and pan
- Click nodes for details

### Topical Map
- **Central Entity**: Main business focus
- **Search Intent**: Primary user intent
- **Business Description**: 150-250 word overview
- **Target Audience**: Segmented audience analysis
- **Source Context**: Business model and conversion methods

### Comparison
- **Business Models**: Compare strategic approaches
- **Services**: Common vs unique offerings
- **Audiences**: Target market overlap
- **Technologies**: Tech stack comparison
- **Geography**: Market coverage
- **Similarity Matrix**: Content similarity scores

## 🔧 Troubleshooting

### Backend won't start
- Check Python version: `python3 --version` (need 3.9+)
- Activate virtual environment: `source backend/venv/bin/activate`
- Install dependencies: `pip install -r backend/requirements.txt`
- Check `.env` file exists in `backend/`

### Frontend won't start
- Check Node version: `node --version` (need 18+)
- Install dependencies: `npm install` in `frontend/`
- Check `.env` file exists in `frontend/`

### Google Login fails
- Verify Client ID in `frontend/.env`
- Check authorized origins in Google Console
- Clear browser cache and cookies
- Check browser console for errors

### Analysis fails
- Check backend is running (`http://localhost:8000/health`)
- Verify URLs are valid (start with http:// or https://)
- Check backend logs for errors
- Ensure URLs are accessible (not behind auth)

## 📚 Documentation

- **Full README**: [README.md](file:///Users/phyominthein/Desktop/TBS%20Marketing/web/README.md)
- **Implementation Walkthrough**: Check artifacts directory
- **API Documentation**: Visit `http://localhost:8000/docs` (after starting backend)

## 🎯 Next Steps

1. **Database Integration**: Replace in-memory storage with PostgreSQL/MongoDB
2. **Export Features**: Add PDF/CSV export for results
3. **Advanced NLP**: Integrate spaCy for better entity extraction
4. **Caching**: Add Redis for faster repeat analyses
5. **Deployment**: Deploy to cloud (AWS/GCP/Azure)

## 💡 Tips

- **Save Analysis**: Results are stored in memory while backend runs
- **Multiple Analyses**: Click "New Analysis" to start over
- **URL Limits**: Maximum 5 URLs per analysis
- **Graph Navigation**: Use mouse wheel to zoom, click-drag to pan
- **Mobile**: Fully responsive design works on mobile devices

---

**Need Help?** Check the full [README.md](file:///Users/phyominthein/Desktop/TBS%20Marketing/web/README.md) or open an issue on GitHub.
