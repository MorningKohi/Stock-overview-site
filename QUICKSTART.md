# Quick Start Guide

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API key:**
   ```bash
   cp .env.example .env
   # Edit .env and add your Alpha Vantage API key
   ```

3. **Start the server:**
   ```bash
   npm start
   ```

## Example API Calls

### Get Stock Quote
```bash
curl http://localhost:3000/api/stock/AAPL
```

### Get Daily Chart Data
```bash
curl "http://localhost:3000/api/chart/AAPL?interval=daily&outputsize=compact"
```

### Get Intraday Chart Data
```bash
curl "http://localhost:3000/api/chart/AAPL?interval=5min&outputsize=compact"
```

### Search Symbols
```bash
curl "http://localhost:3000/udf/search?query=Apple&limit=5"
```

### Get Historical Data (TradingView Format)
```bash
# Get daily data for last 30 days
FROM=$(date -d "30 days ago" +%s)
TO=$(date +%s)
curl "http://localhost:3000/udf/history?symbol=AAPL&resolution=D&from=$FROM&to=$TO"
```

## Integration with Builder.IO

The API has CORS enabled by default for all origins. To restrict to your Builder.IO frontend:

1. Add to `.env`:
   ```
   CORS_ORIGIN=https://your-builder-io-site.com
   ```

2. In your frontend JavaScript:
   ```javascript
   // Fetch stock data
   const response = await fetch('http://your-api-url.com/api/stock/AAPL');
   const data = await response.json();
   console.log(data);
   ```

## TradingView Integration

To integrate with TradingView charts, use the UDF datafeed URL:

```javascript
const datafeedUrl = 'http://your-api-url.com/udf';

const widget = new TradingView.widget({
  datafeed: new Datafeeds.UDFCompatibleDatafeed(datafeedUrl),
  // ... other options
});
```

## Rate Limiting

The API automatically caches responses for 5 minutes to avoid hitting Alpha Vantage rate limits (5 requests per minute for free tier).

## Troubleshooting

- **"API key not configured" error**: Make sure you've created a `.env` file with a valid `ALPHA_VANTAGE_API_KEY`
- **"Rate limit exceeded" error**: Wait a few minutes or upgrade your Alpha Vantage API plan
- **CORS errors**: Check your `CORS_ORIGIN` setting in `.env`
