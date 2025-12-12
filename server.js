require('dotenv').config();
const express = require('express');
const cors = require('cors');
const NodeCache = require('node-cache');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3000;
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Validate required environment variables
if (!ALPHA_VANTAGE_API_KEY) {
  console.error('ERROR: ALPHA_VANTAGE_API_KEY environment variable is not set');
  console.error('Please create a .env file with your Alpha Vantage API key');
  console.error('Example: ALPHA_VANTAGE_API_KEY=your_api_key_here');
  process.exit(1);
}

// Initialize cache with 5 minutes TTL
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Middleware
app.use(cors());
app.use(express.json());

// Helper function to fetch data from Alpha Vantage with caching
async function fetchAlphaVantageData(symbol, functionType = 'TIME_SERIES_DAILY', outputsize = 'compact') {
  const cacheKey = `${functionType}_${symbol}_${outputsize}`;
  
  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`Cache hit for ${cacheKey}`);
    return cachedData;
  }

  // Fetch from API
  try {
    const url = `https://www.alphavantage.co/query`;
    const params = {
      function: functionType,
      symbol: symbol,
      apikey: ALPHA_VANTAGE_API_KEY,
      outputsize: outputsize
    };

    if (functionType === 'TIME_SERIES_INTRADAY') {
      params.interval = '5min';
    }

    const response = await axios.get(url, { params });
    
    // Check for API errors
    if (response.data['Error Message']) {
      throw new Error(response.data['Error Message']);
    }
    
    if (response.data['Note']) {
      throw new Error('API rate limit reached. Please try again later.');
    }

    // Cache the response
    cache.set(cacheKey, response.data);
    console.log(`Cache miss for ${cacheKey}, fetched from API`);
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching data for ${symbol}:`, error.message);
    throw error;
  }
}

// Helper function to parse Alpha Vantage time series data
function parseTimeSeriesData(data, seriesKey) {
  const timeSeries = data[seriesKey];
  if (!timeSeries) {
    return [];
  }

  return Object.entries(timeSeries).map(([timestamp, values]) => ({
    time: new Date(timestamp).getTime() / 1000, // Convert to Unix timestamp
    open: parseFloat(values['1. open']),
    high: parseFloat(values['2. high']),
    low: parseFloat(values['3. low']),
    close: parseFloat(values['4. close']),
    volume: parseInt(values['5. volume'])
  })).sort((a, b) => a.time - b.time);
}

// TradingView UDF Datafeed Protocol Endpoints

// Config endpoint - returns configuration of the datafeed
app.get('/config', (req, res) => {
  res.json({
    supported_resolutions: ['1', '5', '15', '30', '60', 'D', 'W', 'M'],
    supports_group_request: false,
    supports_marks: false,
    supports_search: true,
    supports_timescale_marks: false
  });
});

// Time endpoint - returns server time
app.get('/time', (req, res) => {
  res.send(Math.floor(Date.now() / 1000).toString());
});

// Symbols endpoint - returns symbol info
app.get('/symbols', async (req, res) => {
  const symbol = req.query.symbol;
  
  if (!symbol) {
    return res.status(400).json({ error: 'Symbol parameter is required' });
  }

  try {
    // Fetch latest data to verify symbol exists
    const data = await fetchAlphaVantageData(symbol, 'GLOBAL_QUOTE');
    const quote = data['Global Quote'];
    
    if (!quote || !quote['01. symbol']) {
      return res.status(404).json({ error: 'Symbol not found' });
    }

    res.json({
      name: symbol.toUpperCase(),
      ticker: symbol.toUpperCase(),
      description: symbol.toUpperCase(),
      type: 'stock',
      session: '0930-1600',
      exchange: quote['01. symbol'] ? 'US' : '',
      listed_exchange: '',
      timezone: 'America/New_York',
      minmov: 1,
      pricescale: 100,
      has_intraday: true,
      has_daily: true,
      has_weekly_and_monthly: true,
      supported_resolutions: ['1', '5', '15', '30', '60', 'D', 'W', 'M'],
      data_status: 'streaming'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Search endpoint - searches for symbols
app.get('/search', (req, res) => {
  const query = req.query.query || '';
  const limit = parseInt(req.query.limit) || 10;

  // For demo purposes, return some popular stock symbols
  // In production, this would search a database or use Alpha Vantage search endpoint
  const popularStocks = [
    { symbol: 'AAPL', full_name: 'Apple Inc.', description: 'AAPL', exchange: 'NASDAQ', type: 'stock' },
    { symbol: 'GOOGL', full_name: 'Alphabet Inc.', description: 'GOOGL', exchange: 'NASDAQ', type: 'stock' },
    { symbol: 'MSFT', full_name: 'Microsoft Corporation', description: 'MSFT', exchange: 'NASDAQ', type: 'stock' },
    { symbol: 'AMZN', full_name: 'Amazon.com Inc.', description: 'AMZN', exchange: 'NASDAQ', type: 'stock' },
    { symbol: 'TSLA', full_name: 'Tesla Inc.', description: 'TSLA', exchange: 'NASDAQ', type: 'stock' },
    { symbol: 'META', full_name: 'Meta Platforms Inc.', description: 'META', exchange: 'NASDAQ', type: 'stock' },
    { symbol: 'NVDA', full_name: 'NVIDIA Corporation', description: 'NVDA', exchange: 'NASDAQ', type: 'stock' },
    { symbol: 'JPM', full_name: 'JPMorgan Chase & Co.', description: 'JPM', exchange: 'NYSE', type: 'stock' },
    { symbol: 'V', full_name: 'Visa Inc.', description: 'V', exchange: 'NYSE', type: 'stock' },
    { symbol: 'WMT', full_name: 'Walmart Inc.', description: 'WMT', exchange: 'NYSE', type: 'stock' }
  ];

  const filtered = popularStocks
    .filter(stock => 
      stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
      stock.full_name.toLowerCase().includes(query.toLowerCase())
    )
    .slice(0, limit);

  res.json(filtered);
});

// History endpoint - returns historical OHLCV data
app.get('/history', async (req, res) => {
  const { symbol, from, to, resolution } = req.query;

  if (!symbol) {
    return res.status(400).json({ s: 'error', errmsg: 'Symbol parameter is required' });
  }

  try {
    let functionType = 'TIME_SERIES_DAILY';
    let seriesKey = 'Time Series (Daily)';
    let outputsize = 'full';

    // Determine which time series to use based on resolution
    if (resolution && ['1', '5', '15', '30', '60'].includes(resolution)) {
      functionType = 'TIME_SERIES_INTRADAY';
      seriesKey = 'Time Series (5min)'; // Always use 5min since that's what we request from API
      outputsize = 'full';
    } else if (resolution === 'D') {
      functionType = 'TIME_SERIES_DAILY';
      seriesKey = 'Time Series (Daily)';
    } else if (resolution === 'W') {
      functionType = 'TIME_SERIES_WEEKLY';
      seriesKey = 'Weekly Time Series';
    } else if (resolution === 'M') {
      functionType = 'TIME_SERIES_MONTHLY';
      seriesKey = 'Monthly Time Series';
    }

    const data = await fetchAlphaVantageData(symbol, functionType, outputsize);
    let bars = parseTimeSeriesData(data, seriesKey);

    // Filter by date range if provided
    if (from) {
      const fromTime = parseInt(from);
      bars = bars.filter(bar => bar.time >= fromTime);
    }
    if (to) {
      const toTime = parseInt(to);
      bars = bars.filter(bar => bar.time <= toTime);
    }

    if (bars.length === 0) {
      return res.json({ s: 'no_data', nextTime: null });
    }

    // Format response for TradingView
    const response = {
      s: 'ok',
      t: bars.map(bar => bar.time),
      o: bars.map(bar => bar.open),
      h: bars.map(bar => bar.high),
      l: bars.map(bar => bar.low),
      c: bars.map(bar => bar.close),
      v: bars.map(bar => bar.volume)
    };

    res.json(response);
  } catch (error) {
    console.error('Error in /history:', error.message);
    res.status(500).json({ s: 'error', errmsg: error.message });
  }
});

// REST API Endpoints for Stock Quotes

// Get latest quote for a symbol
app.get('/api/quote/:symbol', async (req, res) => {
  const symbol = req.params.symbol;

  try {
    const data = await fetchAlphaVantageData(symbol, 'GLOBAL_QUOTE');
    const quote = data['Global Quote'];

    if (!quote || !quote['01. symbol']) {
      return res.status(404).json({ error: 'Symbol not found' });
    }

    res.json({
      symbol: quote['01. symbol'],
      price: parseFloat(quote['05. price']),
      change: parseFloat(quote['09. change']),
      changePercent: quote['10. change percent'],
      high: parseFloat(quote['03. high']),
      low: parseFloat(quote['04. low']),
      open: parseFloat(quote['02. open']),
      previousClose: parseFloat(quote['08. previous close']),
      volume: parseInt(quote['06. volume']),
      latestTradingDay: quote['07. latest trading day']
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get historical data for a symbol
app.get('/api/history/:symbol', async (req, res) => {
  const symbol = req.params.symbol;
  const interval = req.query.interval || 'daily';
  const outputsize = req.query.outputsize || 'compact';

  try {
    let functionType, seriesKey;
    
    switch (interval) {
      case 'intraday':
        functionType = 'TIME_SERIES_INTRADAY';
        seriesKey = 'Time Series (5min)';
        break;
      case 'weekly':
        functionType = 'TIME_SERIES_WEEKLY';
        seriesKey = 'Weekly Time Series';
        break;
      case 'monthly':
        functionType = 'TIME_SERIES_MONTHLY';
        seriesKey = 'Monthly Time Series';
        break;
      default:
        functionType = 'TIME_SERIES_DAILY';
        seriesKey = 'Time Series (Daily)';
    }

    const data = await fetchAlphaVantageData(symbol, functionType, outputsize);
    const bars = parseTimeSeriesData(data, seriesKey);

    res.json({
      symbol: symbol.toUpperCase(),
      interval: interval,
      data: bars
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    cache_stats: cache.getStats()
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    name: 'Stock Data Visualization API',
    version: '1.0.0',
    endpoints: {
      tradingview_udf: {
        config: '/config',
        time: '/time',
        symbols: '/symbols?symbol=AAPL',
        search: '/search?query=AAPL&limit=10',
        history: '/history?symbol=AAPL&from=1609459200&to=1640995200&resolution=D'
      },
      rest_api: {
        quote: '/api/quote/:symbol',
        history: '/api/history/:symbol?interval=daily&outputsize=compact'
      },
      utility: {
        health: '/health'
      }
    }
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Stock Data Visualization API running on port ${PORT}`);
});
