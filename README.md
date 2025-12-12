# Stock Overview Site

A Node.js Express backend API that fetches stock data from Alpha Vantage API and provides both REST endpoints and TradingView UDF (Universal Data Feed) compatibility.

## Features

- 📊 REST API endpoints for stock quotes and chart data
- 📈 TradingView UDF datafeed integration
- 🚀 Response caching to avoid API rate limits
- 🔒 Environment variable configuration for API keys
- 🌐 CORS enabled for frontend integration (Builder.IO compatible)
- ⚡ Fast and efficient with Node.js and Express

## Prerequisites

- Node.js (v14 or higher)
- Alpha Vantage API key (get free at https://www.alphavantage.co/support/#api-key)

## Installation

1. Clone the repository:
```bash
git clone https://github.com/MorningKohi/Stock-overview-site.git
cd Stock-overview-site
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment variables:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Alpha Vantage API key:
```
ALPHA_VANTAGE_API_KEY=your_actual_api_key_here
PORT=3000
```

## Running the Server

Start the server:
```bash
npm start
```

Or for development:
```bash
npm run dev
```

The server will start on `http://localhost:3000` (or the port specified in `.env`).

## API Endpoints

### REST Endpoints

#### Get Stock Quote
```
GET /api/stock/:symbol
```
Fetches current quote data for a stock symbol.

Example:
```bash
curl http://localhost:3000/api/stock/AAPL
```

#### Get Chart Data
```
GET /api/chart/:symbol?interval=daily&outputsize=compact
```
Fetches historical time series data for charting.

Query parameters:
- `interval`: `intraday`, `daily`, `weekly`, or `monthly` (default: `daily`)
- `outputsize`: `compact` (last 100 data points) or `full` (default: `compact`)

Example:
```bash
curl "http://localhost:3000/api/chart/AAPL?interval=daily&outputsize=compact"
```

### TradingView UDF Endpoints

The API implements the TradingView Universal Data Feed (UDF) specification for seamless integration with TradingView charts.

#### Configuration
```
GET /udf/config
```
Returns the datafeed configuration.

#### Symbol Search
```
GET /udf/search?query=keyword&limit=10
```
Search for stock symbols.

#### Symbol Info
```
GET /udf/symbols?symbol=AAPL
```
Get detailed information about a symbol.

#### Historical Data
```
GET /udf/history?symbol=AAPL&resolution=D&from=timestamp&to=timestamp
```
Get historical OHLCV data.

Parameters:
- `symbol`: Stock symbol
- `resolution`: `1`, `5`, `15`, `30`, `60`, `240`, `D`, `W`, `M`
- `from`: Unix timestamp (seconds)
- `to`: Unix timestamp (seconds)

#### Server Time
```
GET /udf/time
```
Returns current server time as Unix timestamp.

### Utility Endpoints

#### Health Check
```
GET /health
```
Returns server status and cache statistics.

#### Root
```
GET /
```
Returns API documentation and available endpoints.

## Caching

The API implements response caching with a 5-minute TTL (Time To Live) to prevent hitting Alpha Vantage API rate limits. Cache statistics are available via the `/health` endpoint.

## CORS Configuration

CORS is enabled by default for all origins. To restrict to specific origins, set the `CORS_ORIGIN` environment variable:

```
CORS_ORIGIN=https://your-frontend-domain.com
```

## Architecture

- **Express.js**: Web framework
- **Axios**: HTTP client for API requests
- **node-cache**: In-memory caching
- **dotenv**: Environment variable management
- **cors**: CORS middleware

## Error Handling

The API includes comprehensive error handling:
- API key validation
- Rate limit detection
- Invalid symbol handling
- Network error handling

All errors return appropriate HTTP status codes and JSON error messages.

## Development

The codebase follows Node.js best practices:
- Environment-based configuration
- Proper error handling
- Request/response logging
- Clean code structure

## License

ISC
