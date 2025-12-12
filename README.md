# Stock Overview Site

A Node.js Express backend for stock data visualization that fetches OHLCV (Open, High, Low, Close, Volume) data from the Alpha Vantage API and implements the TradingView UDF (Universal Data Feed) protocol.

## Features

- **Alpha Vantage Integration**: Fetches real-time and historical stock data
- **TradingView UDF Protocol**: Full implementation of TradingView's Universal Data Feed protocol
- **Response Caching**: Intelligent caching to manage API rate limits
- **REST API**: Simple REST endpoints for stock quotes and historical data
- **CORS Enabled**: Ready for frontend integration

## Prerequisites

- Node.js (v14 or higher)
- Alpha Vantage API Key (free at [https://www.alphavantage.co/support/#api-key](https://www.alphavantage.co/support/#api-key))

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

3. Create a `.env` file from the example:
```bash
cp .env.example .env
```

4. Edit `.env` and add your Alpha Vantage API key:
```
ALPHA_VANTAGE_API_KEY=your_actual_api_key_here
PORT=3000
```

## Usage

Start the server:
```bash
npm start
```

The server will start on `http://localhost:3000` (or the port specified in your .env file).

## API Endpoints

### TradingView UDF Protocol Endpoints

These endpoints implement the TradingView Universal Data Feed protocol for charting libraries:

- **GET `/config`** - Returns datafeed configuration
- **GET `/time`** - Returns current server time
- **GET `/symbols?symbol=AAPL`** - Returns symbol information
- **GET `/search?query=AAPL&limit=10`** - Searches for symbols
- **GET `/history?symbol=AAPL&from=1609459200&to=1640995200&resolution=D`** - Returns historical OHLCV data

### REST API Endpoints

Simple REST endpoints for easy integration:

- **GET `/api/quote/:symbol`** - Get latest quote for a symbol
  ```
  Example: /api/quote/AAPL
  ```

- **GET `/api/history/:symbol?interval=daily&outputsize=compact`** - Get historical data
  ```
  Example: /api/history/AAPL?interval=daily&outputsize=full
  Intervals: intraday, daily, weekly, monthly
  Outputsize: compact (100 data points) or full (all available)
  ```

### Utility Endpoints

- **GET `/`** - API documentation and available endpoints
- **GET `/health`** - Health check with cache statistics

## Caching

The API implements intelligent caching to manage Alpha Vantage's rate limits:
- Default cache TTL: 5 minutes
- Automatic cache invalidation
- Cache statistics available at `/health` endpoint

## Example Responses

### Quote Response (`/api/quote/AAPL`)
```json
{
  "symbol": "AAPL",
  "price": 182.52,
  "change": 1.25,
  "changePercent": "0.69%",
  "high": 183.20,
  "low": 181.00,
  "open": 181.50,
  "previousClose": 181.27,
  "volume": 52164000,
  "latestTradingDay": "2024-01-15"
}
```

### History Response (`/history?symbol=AAPL&resolution=D`)
```json
{
  "s": "ok",
  "t": [1609459200, 1609545600, 1609632000],
  "o": [133.52, 136.60, 138.65],
  "h": [136.70, 139.68, 141.40],
  "l": [133.06, 136.17, 138.30],
  "c": [136.69, 139.07, 139.52],
  "v": [143301900, 157611700, 118387900]
}
```

## Rate Limits

Alpha Vantage free tier limits:
- 5 API requests per minute
- 100 API requests per day

The caching system helps manage these limits by storing responses for 5 minutes.

## Integration with TradingView

This backend can be used with TradingView's Charting Library. Configure the datafeed URL in your TradingView setup:

```javascript
const widget = new TradingView.widget({
  datafeed: new Datafeeds.UDFCompatibleDatafeed("http://localhost:3000"),
  // ... other options
});
```

## Development

The project uses standard Node.js practices:
- Express.js for the web framework
- Axios for HTTP requests
- node-cache for in-memory caching
- dotenv for environment configuration

## License

ISC
