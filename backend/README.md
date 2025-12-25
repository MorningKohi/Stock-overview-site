# Stock Overview Backend API

Backend API for the Stock Overview Site using Express.js and Alpha Vantage API.

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Get your Alpha Vantage API key:**
   - Go to https://www.alphavantage.co/support/#api-key
   - Sign up for a free API key
   - Copy your API key

3. **Configure environment variables:**
   - Open the `.env` file
   - Replace `your_api_key_here` with your actual Alpha Vantage API key
   ```
   ALPHA_VANTAGE_API_KEY=your_actual_api_key
   ```

4. **Start the server:**
   ```bash
   # Production mode
   npm start

   # Development mode (with auto-restart)
   npm run dev
   ```

The server will run on `http://localhost:3001`

## API Endpoints

### TradingView UDF Endpoints

The backend includes TradingView Universal Data Feed (UDF) endpoints for charting integration. See [UDF-INTEGRATION.md](UDF-INTEGRATION.md) for detailed documentation.

**Base URL:** `/udf`

- `GET /udf/config` - Datafeed configuration
- `GET /udf/symbols` - Symbol information
- `GET /udf/search` - Symbol search
- `GET /udf/history` - Historical OHLCV bar data
- `GET /udf/time` - Server time

### Stock API Endpoints

### 1. Get Stock Quote
Get the current quote for a stock symbol.

**Endpoint:** `GET /api/stocks/quote/:symbol`

**Example:**
```bash
curl http://localhost:3001/api/stocks/quote/AAPL
```

**Response:**
```json
{
  "symbol": "AAPL",
  "price": 189.25,
  "change": 2.15,
  "changePercent": "1.15%",
  "volume": 52847392,
  "latestTradingDay": "2024-01-15",
  "previousClose": 187.10,
  "open": 188.50,
  "high": 190.20,
  "low": 187.80
}
```

### 2. Get Intraday Data
Get intraday time series data for charts.

**Endpoint:** `GET /api/stocks/intraday/:symbol?interval=5min`

**Parameters:**
- `interval` (optional): `1min`, `5min`, `15min`, `30min`, `60min` (default: `5min`)

**Example:**
```bash
curl http://localhost:3001/api/stocks/intraday/AAPL?interval=5min
```

### 3. Get Daily Historical Data
Get daily historical data for charts.

**Endpoint:** `GET /api/stocks/daily/:symbol?outputsize=compact`

**Parameters:**
- `outputsize` (optional): `compact` (100 data points) or `full` (20+ years) (default: `compact`)

**Example:**
```bash
curl http://localhost:3001/api/stocks/daily/AAPL?outputsize=compact
```

### 4. Search Stocks
Search for stock symbols by keywords.

**Endpoint:** `GET /api/stocks/search?keywords=apple`

**Example:**
```bash
curl http://localhost:3001/api/stocks/search?keywords=tesla
```

## Project Structure

```
backend/
├── src/
│   ├── server.js              # Main server file
│   ├── routes/
│   │   └── stockRoutes.js     # Stock API routes
│   ├── services/
│   │   └── stockService.js    # Alpha Vantage integration
│   └── middleware/
│       └── errorHandler.js    # Error handling middleware
├── .env                       # Environment variables (not in git)
├── .env.example              # Environment variables template
├── .gitignore                # Git ignore file
├── package.json              # Project dependencies
└── README.md                 # This file
```

## API Rate Limits

The free Alpha Vantage API tier has the following limits:
- 25 requests per day
- 5 API requests per minute

For production use, consider upgrading to a paid plan or implementing caching.

## Next Steps

To add more features:
1. **Database Integration**: Add MongoDB or PostgreSQL to store favorite stocks
2. **Caching**: Implement Redis to cache API responses and reduce API calls
3. **User Authentication**: Add JWT authentication for user-specific favorites
4. **WebSockets**: Add real-time stock updates using Socket.io
5. **More Endpoints**: Add company overview, news, technical indicators, etc.

## Troubleshooting

**Error: API rate limit reached**
- You've exceeded the free tier limits
- Wait for the limit to reset or upgrade your API plan

**Error: Invalid API key**
- Make sure you've set your API key correctly in the `.env` file
- Verify your API key is active at https://www.alphavantage.co/

**Error: No data found**
- Check that the stock symbol is valid
- Some symbols may not be available in Alpha Vantage
