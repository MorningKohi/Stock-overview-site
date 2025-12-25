# API Endpoints Summary

## Server Information
- **Base URL**: `http://localhost:3001`
- **Status**: Running
- **API Key**: Configured ✓

## Available Endpoints

### 🔹 Root
```
GET /
```
Returns API information and available endpoint groups.

---

### 📊 TradingView UDF Endpoints

#### GET /udf/config
**Purpose**: Get datafeed configuration
**Parameters**: None
**Response**: Supported resolutions, exchanges, symbol types

**Example**:
```bash
curl http://localhost:3001/udf/config
```

#### GET /udf/symbols
**Purpose**: Get symbol information
**Parameters**: `symbol` (required)
**Response**: Symbol details, trading session, timezone, etc.

**Example**:
```bash
curl "http://localhost:3001/udf/symbols?symbol=AAPL"
```

#### GET /udf/search
**Purpose**: Search for stock symbols
**Parameters**:
- `query` (required) - Search keywords
- `limit` (optional) - Max results (default: 10)

**Example**:
```bash
curl "http://localhost:3001/udf/search?query=tesla&limit=5"
```

#### GET /udf/history
**Purpose**: Get historical OHLCV bar data
**Parameters**:
- `symbol` (required) - Stock ticker
- `resolution` (required) - Time resolution (1, 5, 15, 30, 60, D, W, M)
- `from` (required) - Start timestamp (Unix seconds)
- `to` (required) - End timestamp (Unix seconds)

**Response Format**:
```json
{
  "s": "ok",
  "t": [timestamps],
  "o": [open prices],
  "h": [high prices],
  "l": [low prices],
  "c": [close prices],
  "v": [volumes]
}
```

**Example**:
```bash
curl "http://localhost:3001/udf/history?symbol=AAPL&resolution=D&from=1734480000&to=1735171200"
```

#### GET /udf/time
**Purpose**: Get current server time
**Parameters**: None
**Response**: Unix timestamp in seconds

**Example**:
```bash
curl http://localhost:3001/udf/time
```

---

### 📈 Stock API Endpoints

#### GET /api/stocks/quote/:symbol
**Purpose**: Get current stock quote
**Parameters**: `symbol` (URL parameter)

**Example**:
```bash
curl http://localhost:3001/api/stocks/quote/AAPL
```

**Response**:
```json
{
  "symbol": "AAPL",
  "price": 273.81,
  "change": 1.45,
  "changePercent": "0.5324%",
  "volume": 17267162,
  "latestTradingDay": "2025-12-24",
  "previousClose": 272.36,
  "open": 272.34,
  "high": 275.43,
  "low": 272.195
}
```

#### GET /api/stocks/intraday/:symbol
**Purpose**: Get intraday time series data
**Parameters**:
- `symbol` (URL parameter)
- `interval` (query, optional) - 1min, 5min, 15min, 30min, 60min (default: 5min)

**Example**:
```bash
curl "http://localhost:3001/api/stocks/intraday/AAPL?interval=5min"
```

#### GET /api/stocks/daily/:symbol
**Purpose**: Get daily historical data
**Parameters**:
- `symbol` (URL parameter)
- `outputsize` (query, optional) - compact (100 days) or full (20+ years) (default: compact)

**Example**:
```bash
curl "http://localhost:3001/api/stocks/daily/AAPL?outputsize=compact"
```

#### GET /api/stocks/search
**Purpose**: Search for stock symbols
**Parameters**: `keywords` (required)

**Example**:
```bash
curl "http://localhost:3001/api/stocks/search?keywords=microsoft"
```

---

## Quick Test Commands

### Test All UDF Endpoints
```bash
# Configuration
curl http://localhost:3001/udf/config

# Symbol info
curl "http://localhost:3001/udf/symbols?symbol=AAPL"

# Search
curl "http://localhost:3001/udf/search?query=apple"

# Server time
curl http://localhost:3001/udf/time

# Historical data (adjust timestamps)
curl "http://localhost:3001/udf/history?symbol=AAPL&resolution=D&from=1700000000&to=1735171200"
```

### Test All Stock Endpoints
```bash
# Quote
curl http://localhost:3001/api/stocks/quote/TSLA

# Intraday
curl "http://localhost:3001/api/stocks/intraday/GOOGL?interval=5min"

# Daily
curl "http://localhost:3001/api/stocks/daily/MSFT?outputsize=compact"

# Search
curl "http://localhost:3001/api/stocks/search?keywords=amazon"
```

## Response Codes

- **200** - Success
- **400** - Bad Request (missing parameters)
- **500** - Server Error (API errors, rate limits, etc.)

## Error Format

All errors follow this format:
```json
{
  "error": {
    "message": "Error description",
    "status": 500,
    "timestamp": "2025-12-25T02:00:00.000Z",
    "path": "/api/stocks/quote/INVALID"
  }
}
```

UDF endpoints use:
```json
{
  "s": "error",
  "errmsg": "Error description"
}
```

## Rate Limits

**Alpha Vantage Free Tier**:
- 5 API requests per minute
- 25 API requests per day

When limit is reached, you'll get:
```
"API rate limit reached. Please try again later."
```

## Notes

- All timestamps are in Unix format (seconds since epoch)
- Stock symbols should be uppercase (AAPL, TSLA, etc.)
- The server automatically handles CORS for frontend integration
- UDF endpoints are designed for TradingView integration
- Stock API endpoints provide more detailed raw data
