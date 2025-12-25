# Stock Overview Site - Quick Start Guide

Complete guide to get your stock overview site running with Builder.io.

## Prerequisites

- Node.js installed (v14 or higher)
- npm installed
- Alpha Vantage API key (already configured: ✓)
- Builder.io account (you'll create this)

## Backend Setup (Already Done ✓)

Your backend is already configured! It's running at `http://localhost:3001` with:
- ✅ Express server
- ✅ Alpha Vantage integration
- ✅ Stock API endpoints
- ✅ TradingView UDF endpoints

## Frontend Setup

### 1. Get Builder.io API Key

1. Go to https://builder.io
2. Click **"Sign up"** (it's free)
3. Create an account with your email
4. Choose **"Create a new organization"**
5. After logging in, click your profile → **"Account"**
6. Go to **"Space Settings"**
7. Copy your **Public API Key**

### 2. Configure Frontend

```bash
cd frontend
```

Edit the `.env` file:
```env
REACT_APP_BUILDER_API_KEY=paste_your_builder_io_key_here
REACT_APP_API_URL=http://localhost:3001
```

### 3. Start Frontend

```bash
npm start
```

The app will open at http://localhost:3000

## Testing Your Setup

### 1. Test the Demo Page

Visit: http://localhost:3000/demo

You should see:
- Stock search bar
- Apple (AAPL) stock quote with live data

Try searching for "Tesla" or "Microsoft" and click a result.

### 2. Create Your First Builder.io Page

1. Go to https://builder.io and log in
2. Click **"Models"** in the left sidebar
3. Click **"Page"**
4. Click **"+ New Entry"**
5. Set these values:
   - **Name**: Home
   - **URL Path**: /
6. Click **"Create"**

### 3. Add Stock Components

In the Builder.io visual editor:

1. Find **"Insert"** tab on the left
2. Scroll down to **"Custom Components"**
3. You should see:
   - **StockQuote**
   - **StockSearch**

Drag them onto your page!

#### Example Layout:

1. Add a **Section** (from Insert → Layout)
2. Add a **Text** element - type "My Stock Portfolio"
3. Add **StockQuote** component:
   - Set symbol: `AAPL`
4. Add another **StockQuote**:
   - Set symbol: `TSLA`
5. Add **StockSearch** component at the bottom

### 4. Publish Your Page

1. Click **"Publish"** button (top right)
2. Visit http://localhost:3000
3. You should see your Builder.io page!

## Project Structure

```
Stock-overview-site/
├── backend/                    # Express API server
│   ├── src/
│   │   ├── routes/            # API routes
│   │   ├── services/          # Business logic
│   │   └── middleware/        # Error handling
│   ├── .env                   # Backend config (✓ configured)
│   └── package.json
│
├── frontend/                  # React app
│   ├── src/
│   │   ├── components/        # Stock components
│   │   ├── services/          # API client
│   │   ├── App.js            # Main app + Builder.io
│   │   └── index.js
│   ├── .env                   # Frontend config (needs your Builder.io key)
│   └── package.json
│
└── QUICK-START.md            # This file
```

## Running Both Servers

### Option 1: Two Terminals

**Terminal 1 - Backend:**
```bash
cd backend
npm start
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

### Option 2: One Command (Future)

You can add concurrently to run both:
```bash
npm install -g concurrently
# Then create a script in root package.json
```

## Available Features

### Custom Components in Builder.io

#### StockQuote
Shows live stock data with:
- Current price
- Price change (positive/negative)
- Open, High, Low, Volume
- Previous close
- Last trading day

**Props:**
- `symbol`: Stock ticker (AAPL, TSLA, GOOGL, MSFT, etc.)
- `showChart`: Future feature for charts

#### StockSearch
Search for any stock by company name:
- Real-time search
- Shows symbol, name, type, region
- Click to select

### Backend API Endpoints

Stock API (`/api/stocks`):
- `GET /quote/:symbol` - Current quote
- `GET /intraday/:symbol` - Intraday data
- `GET /daily/:symbol` - Historical data
- `GET /search?keywords=query` - Search stocks

TradingView UDF (`/udf`):
- `GET /config` - Chart configuration
- `GET /symbols` - Symbol info
- `GET /search` - Search symbols
- `GET /history` - OHLCV bar data
- `GET /time` - Server time

## Common Issues & Solutions

### Frontend won't start

**Error: "Cannot find module '@builder.io/react'"**
```bash
cd frontend
npm install
```

### Backend API errors

**Error: "No response from server"**
- Make sure backend is running: `cd backend && npm start`
- Check it's on port 3001: http://localhost:3001

**Error: "API rate limit reached"**
- Alpha Vantage free tier: 5 calls/min, 25 calls/day
- Wait a bit or upgrade your API plan

### Builder.io components not showing

1. Check your API key in `frontend/.env`
2. Restart the frontend server
3. Clear browser cache
4. Check browser console for errors

### CORS errors

Make sure backend `.env` has:
```env
FRONTEND_URL=http://localhost:3000
```

## Next Steps

### 1. Design Your Page

Use Builder.io to create beautiful pages:
- Add Hero sections
- Create stock watchlists
- Add images and branding
- Style your components
- Add multiple pages

### 2. Add More Features

Ideas for expansion:
- **Watchlist**: Save favorite stocks
- **Charts**: Integrate TradingView charts
- **Alerts**: Price change notifications
- **News**: Stock-related news
- **Portfolio**: Track your investments

### 3. Deploy

When ready to go live:
- **Frontend**: Deploy to Vercel or Netlify
- **Backend**: Deploy to Heroku or Railway
- **Database**: Add PostgreSQL for user data
- **Authentication**: Add user login

## Resources

- **Builder.io Docs**: https://www.builder.io/c/docs/developers
- **Builder.io Forum**: https://forum.builder.io/
- **Alpha Vantage Docs**: https://www.alphavantage.co/documentation/
- **React Docs**: https://react.dev

## Getting Help

- Check `frontend/BUILDER-SETUP.md` for detailed Builder.io instructions
- Check `backend/README.md` for API documentation
- Check `backend/UDF-INTEGRATION.md` for TradingView integration

## Success Checklist

- [ ] Backend running on port 3001
- [ ] Frontend running on port 3000
- [ ] Builder.io account created
- [ ] Builder.io API key added to `.env`
- [ ] Demo page loads at `/demo`
- [ ] Stock search works
- [ ] Stock quote shows live data
- [ ] Builder.io page created
- [ ] Custom components visible in Builder.io
- [ ] Published page loads at `/`

You're all set! 🚀
