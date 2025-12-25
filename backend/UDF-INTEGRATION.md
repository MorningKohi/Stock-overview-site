# TradingView UDF Integration Guide

Your backend now includes TradingView Universal Data Feed (UDF) endpoints for charting integration.

## UDF Endpoints

Base URL: `http://localhost:3001/udf`

### 1. Configuration Endpoint
**GET** `/udf/config`

Returns datafeed configuration including supported resolutions and exchanges.

```bash
curl http://localhost:3001/udf/config
```

**Response:**
```json
{
  "supported_resolutions": ["1", "5", "15", "30", "60", "D", "W", "M"],
  "supports_group_request": false,
  "supports_marks": false,
  "supports_search": true,
  "supports_timescale_marks": false,
  "exchanges": [...],
  "symbols_types": [...]
}
```

### 2. Symbol Info Endpoint
**GET** `/udf/symbols?symbol=AAPL`

Get detailed information about a specific symbol.

```bash
curl "http://localhost:3001/udf/symbols?symbol=AAPL"
```

**Response:**
```json
{
  "name": "AAPL",
  "ticker": "AAPL",
  "description": "AAPL",
  "type": "stock",
  "session": "0930-1600",
  "exchange": "NYSE",
  "timezone": "America/New_York",
  "has_intraday": true,
  "has_daily": true,
  "supported_resolutions": ["1", "5", "15", "30", "60", "D", "W", "M"],
  "currency_code": "USD"
}
```

### 3. Symbol Search Endpoint
**GET** `/udf/search?query=tesla&limit=10`

Search for stock symbols by keywords.

```bash
curl "http://localhost:3001/udf/search?query=tesla&limit=5"
```

**Response:**
```json
[
  {
    "symbol": "TSLA",
    "full_name": "TSLA",
    "description": "Tesla Inc",
    "exchange": "United States",
    "ticker": "TSLA",
    "type": "equity"
  }
]
```

### 4. History Endpoint (OHLCV Bars)
**GET** `/udf/history?symbol=AAPL&resolution=D&from=1734480000&to=1735171200`

Get historical OHLCV (Open, High, Low, Close, Volume) bar data.

**Parameters:**
- `symbol` (required): Stock ticker symbol
- `resolution` (required): Time resolution - `1`, `5`, `15`, `30`, `60` (minutes), `D` (day), `W` (week), `M` (month)
- `from` (required): Unix timestamp (seconds) - start time
- `to` (required): Unix timestamp (seconds) - end time

```bash
# Get daily bars for last 7 days
curl "http://localhost:3001/udf/history?symbol=AAPL&resolution=D&from=1734480000&to=1735171200"
```

**Response:**
```json
{
  "s": "ok",
  "t": [1734480000, 1734566400, 1734652800],
  "o": [272.34, 270.84, 272.86],
  "h": [275.43, 272.50, 273.88],
  "l": [272.19, 269.56, 270.50],
  "c": [273.81, 272.36, 270.97],
  "v": [17267162, 29641999, 31538294]
}
```

Where:
- `s`: Status (`ok`, `no_data`, or `error`)
- `t`: Array of timestamps (Unix time in seconds)
- `o`: Array of opening prices
- `h`: Array of high prices
- `l`: Array of low prices
- `c`: Array of closing prices
- `v`: Array of volumes

### 5. Server Time Endpoint
**GET** `/udf/time`

Returns current server time as Unix timestamp.

```bash
curl http://localhost:3001/udf/time
```

## Resolution Mapping

TradingView resolutions are mapped to Alpha Vantage intervals:

| TradingView | Alpha Vantage | Description |
|-------------|---------------|-------------|
| `1`         | `1min`        | 1 minute    |
| `5`         | `5min`        | 5 minutes   |
| `15`        | `15min`       | 15 minutes  |
| `30`        | `30min`       | 30 minutes  |
| `60`        | `60min`       | 1 hour      |
| `D`         | `daily`       | 1 day       |
| `W`         | `weekly`      | 1 week      |
| `M`         | `monthly`     | 1 month     |

## Integration with TradingView

To use these endpoints with TradingView charts, create a custom datafeed:

```javascript
const Datafeed = {
  onReady: (callback) => {
    fetch('http://localhost:3001/udf/config')
      .then(response => response.json())
      .then(data => {
        callback(data);
      });
  },

  searchSymbols: (userInput, exchange, symbolType, onResultReadyCallback) => {
    fetch(`http://localhost:3001/udf/search?query=${userInput}`)
      .then(response => response.json())
      .then(data => {
        onResultReadyCallback(data);
      });
  },

  resolveSymbol: (symbolName, onSymbolResolvedCallback, onResolveErrorCallback) => {
    fetch(`http://localhost:3001/udf/symbols?symbol=${symbolName}`)
      .then(response => response.json())
      .then(data => {
        onSymbolResolvedCallback(data);
      })
      .catch(err => {
        onResolveErrorCallback('Symbol not found');
      });
  },

  getBars: (symbolInfo, resolution, periodParams, onHistoryCallback, onErrorCallback) => {
    const { from, to } = periodParams;
    fetch(`http://localhost:3001/udf/history?symbol=${symbolInfo.ticker}&resolution=${resolution}&from=${from}&to=${to}`)
      .then(response => response.json())
      .then(data => {
        if (data.s === 'ok') {
          const bars = data.t.map((time, index) => ({
            time: time * 1000, // Convert to milliseconds
            open: data.o[index],
            high: data.h[index],
            low: data.l[index],
            close: data.c[index],
            volume: data.v[index]
          }));
          onHistoryCallback(bars, { noData: false });
        } else {
          onHistoryCallback([], { noData: true });
        }
      })
      .catch(err => {
        onErrorCallback(err);
      });
  }
};

// Initialize TradingView widget
const widget = new TradingView.widget({
  container: 'tv_chart_container',
  datafeed: Datafeed,
  symbol: 'AAPL',
  interval: 'D',
  // ... other options
});
```

## Alpha Vantage API Limits

Remember the free tier limitations:
- **5 API requests per minute**
- **25 API requests per day**

For production use:
1. Implement caching (Redis recommended)
2. Upgrade to Alpha Vantage premium plan
3. Consider using a different data provider for real-time data

## Error Handling

All UDF endpoints return proper error responses:

```json
{
  "s": "error",
  "errmsg": "Error message description"
}
```

Common errors:
- `"Symbol not found"` - Invalid stock symbol
- `"API rate limit reached"` - Too many API calls
- `"Missing required parameters"` - Missing query parameters

## Testing

Test the complete flow:

```bash
# 1. Get configuration
curl http://localhost:3001/udf/config

# 2. Search for a symbol
curl "http://localhost:3001/udf/search?query=apple"

# 3. Get symbol info
curl "http://localhost:3001/udf/symbols?symbol=AAPL"

# 4. Get historical data (adjust timestamps as needed)
curl "http://localhost:3001/udf/history?symbol=AAPL&resolution=D&from=1700000000&to=1735171200"
```

## Next Steps

1. **Add Caching**: Implement Redis to cache API responses and reduce API calls
2. **WebSockets**: Add real-time streaming data updates
3. **More Data**: Add company info, news, earnings, dividends endpoints
4. **Authentication**: Protect endpoints with API keys or JWT tokens
5. **Frontend**: Build a React/Vue frontend with TradingView charts
