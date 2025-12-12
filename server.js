require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const NodeCache = require('node-cache');

const app = express();
const PORT = process.env.PORT || 3000;
const ALPHA_VANTAGE_API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

// Constants
const DEFAULT_INTRADAY_INTERVAL = '5min';
const SUPPORTED_RESOLUTIONS = ['1', '5', '15', '30', '60', '240', 'D', 'W', 'M'];
const TIME_SERIES_KEYS = [
  'Time Series (1min)',
  'Time Series (5min)',
  'Time Series (15min)',
  'Time Series (30min)',
  'Time Series (60min)',
  'Time Series (Daily)',
  'Weekly Time Series',
  'Monthly Time Series'
];

// Initialize cache with 5 minutes TTL (300 seconds)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 60 });

// Enable CORS for all origins (including Builder.IO)
const corsOptions = {
  origin: process.env.CORS_ORIGIN || '*',
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());

// Middleware to check API key configuration
const checkApiKey = (req, res, next) => {
  if (!ALPHA_VANTAGE_API_KEY || ALPHA_VANTAGE_API_KEY === 'your_api_key_here') {
    return res.status(500).json({ 
      error: 'Alpha Vantage API key not configured. Please set ALPHA_VANTAGE_API_KEY in .env file.' 
    });
  }
  next();
};

// Helper function to fetch from Alpha Vantage with caching
async function fetchAlphaVantage(url, cacheKey) {
  // Check cache first
  const cachedData = cache.get(cacheKey);
  if (cachedData) {
    console.log(`Cache hit for ${cacheKey}`);
    return cachedData;
  }

  // Fetch from API
  try {
    console.log(`Fetching from Alpha Vantage: ${cacheKey}`);
    const response = await axios.get(url);
    
    // Check for API error messages
    if (response.data['Error Message']) {
      throw new Error(response.data['Error Message']);
    }
    if (response.data['Note']) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }

    // Cache the response
    cache.set(cacheKey, response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      throw new Error(`Alpha Vantage API error: ${error.response.status}`);
    }
    throw error;
  }
}

// REST Endpoint: Get stock quote data
app.get('/api/stock/:symbol', checkApiKey, async (req, res) => {
  try {
    const { symbol } = req.params;
    const cacheKey = `quote_${symbol.toUpperCase()}`;
    
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const data = await fetchAlphaVantage(url, cacheKey);
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching stock data:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// REST Endpoint: Get chart/time series data
app.get('/api/chart/:symbol', checkApiKey, async (req, res) => {
  try {
    const { symbol } = req.params;
    const { interval = 'daily', outputsize = 'compact' } = req.query;
    const cacheKey = `chart_${symbol.toUpperCase()}_${interval}_${outputsize}`;
    
    let functionName = 'TIME_SERIES_DAILY';
    let intervalParam = '';
    
    // Determine the correct API function based on interval
    if (interval === 'intraday' || interval.includes('min')) {
      functionName = 'TIME_SERIES_INTRADAY';
      intervalParam = `&interval=${interval === 'intraday' ? DEFAULT_INTRADAY_INTERVAL : interval}`;
    } else if (interval === 'weekly') {
      functionName = 'TIME_SERIES_WEEKLY';
    } else if (interval === 'monthly') {
      functionName = 'TIME_SERIES_MONTHLY';
    }
    
    const url = `https://www.alphavantage.co/query?function=${functionName}&symbol=${symbol}${intervalParam}&outputsize=${outputsize}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const data = await fetchAlphaVantage(url, cacheKey);
    
    res.json(data);
  } catch (error) {
    console.error('Error fetching chart data:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// TradingView UDF: Configuration endpoint
app.get('/udf/config', (req, res) => {
  res.json({
    supported_resolutions: SUPPORTED_RESOLUTIONS,
    supports_group_request: false,
    supports_marks: false,
    supports_search: true,
    supports_timescale_marks: false,
    exchanges: [
      { value: 'NYSE', name: 'NYSE', desc: 'New York Stock Exchange' },
      { value: 'NASDAQ', name: 'NASDAQ', desc: 'NASDAQ' }
    ],
    symbols_types: [
      { name: 'Stock', value: 'stock' }
    ]
  });
});

// TradingView UDF: Symbol search
app.get('/udf/search', checkApiKey, async (req, res) => {
  try {
    const { query, limit = 10 } = req.query;
    
    if (!query) {
      return res.json([]);
    }
    
    const cacheKey = `search_${query}`;
    const cachedData = cache.get(cacheKey);
    
    if (cachedData) {
      return res.json(cachedData);
    }
    
    const url = `https://www.alphavantage.co/query?function=SYMBOL_SEARCH&keywords=${query}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const data = await fetchAlphaVantage(url, cacheKey);
    
    const results = (data.bestMatches || []).slice(0, limit).map(match => ({
      symbol: match['1. symbol'],
      full_name: match['2. name'],
      description: match['2. name'],
      exchange: match['4. region'],
      type: 'stock'
    }));
    
    cache.set(cacheKey, results);
    res.json(results);
  } catch (error) {
    console.error('Error searching symbols:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// TradingView UDF: Symbol info
app.get('/udf/symbols', checkApiKey, async (req, res) => {
  try {
    const { symbol } = req.query;
    
    if (!symbol) {
      return res.status(400).json({ error: 'Symbol parameter is required' });
    }
    
    const cacheKey = `symbol_info_${symbol.toUpperCase()}`;
    const url = `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const data = await fetchAlphaVantage(url, cacheKey);
    
    const quote = data['Global Quote'];
    if (!quote || !quote['01. symbol']) {
      return res.status(404).json({ error: 'Symbol not found' });
    }
    
    res.json({
      name: quote['01. symbol'],
      ticker: quote['01. symbol'],
      description: quote['01. symbol'],
      type: 'stock',
      session: '0930-1600',
      exchange: 'NYSE',
      listed_exchange: 'NYSE',
      timezone: 'America/New_York',
      format: 'price',
      pricescale: 100,
      minmov: 1,
      has_intraday: true,
      has_daily: true,
      has_weekly_and_monthly: true,
      supported_resolutions: SUPPORTED_RESOLUTIONS
    });
  } catch (error) {
    console.error('Error fetching symbol info:', error.message);
    res.status(500).json({ error: error.message });
  }
});

// TradingView UDF: Historical data (OHLCV)
app.get('/udf/history', checkApiKey, async (req, res) => {
  try {
    const { symbol, resolution, from, to } = req.query;
    
    if (!symbol || !resolution || !from || !to) {
      return res.status(400).json({ 
        s: 'error', 
        errmsg: 'Missing required parameters: symbol, resolution, from, to' 
      });
    }
    
    // Map TradingView resolution to Alpha Vantage interval
    let functionName = 'TIME_SERIES_DAILY';
    let intervalParam = '';
    
    if (resolution === '1' || resolution === '5' || resolution === '15' || resolution === '30' || resolution === '60') {
      functionName = 'TIME_SERIES_INTRADAY';
      intervalParam = `&interval=${resolution}min`;
    } else if (resolution === 'D' || resolution === '1D') {
      functionName = 'TIME_SERIES_DAILY';
    } else if (resolution === 'W' || resolution === '1W') {
      functionName = 'TIME_SERIES_WEEKLY';
    } else if (resolution === 'M' || resolution === '1M') {
      functionName = 'TIME_SERIES_MONTHLY';
    }
    
    const cacheKey = `history_${symbol.toUpperCase()}_${resolution}`;
    const url = `https://www.alphavantage.co/query?function=${functionName}&symbol=${symbol}${intervalParam}&outputsize=full&apikey=${ALPHA_VANTAGE_API_KEY}`;
    const data = await fetchAlphaVantage(url, cacheKey);
    
    // Parse the time series data
    let timeSeries = null;
    for (const key of TIME_SERIES_KEYS) {
      if (data[key]) {
        timeSeries = data[key];
        break;
      }
    }
    
    if (!timeSeries) {
      return res.json({ s: 'no_data' });
    }
    
    // Convert to TradingView format
    const bars = [];
    const fromTimestamp = parseInt(from);
    const toTimestamp = parseInt(to);
    
    for (const [dateStr, values] of Object.entries(timeSeries)) {
      const timestamp = Math.floor(new Date(dateStr).getTime() / 1000);
      
      if (timestamp >= fromTimestamp && timestamp <= toTimestamp) {
        bars.push({
          time: timestamp,
          open: parseFloat(values['1. open']),
          high: parseFloat(values['2. high']),
          low: parseFloat(values['3. low']),
          close: parseFloat(values['4. close']),
          volume: parseFloat(values['5. volume'])
        });
      }
    }
    
    // Sort by time ascending
    bars.sort((a, b) => a.time - b.time);
    
    if (bars.length === 0) {
      return res.json({ s: 'no_data' });
    }
    
    // Format response for TradingView
    res.json({
      s: 'ok',
      t: bars.map(b => b.time),
      o: bars.map(b => b.open),
      h: bars.map(b => b.high),
      l: bars.map(b => b.low),
      c: bars.map(b => b.close),
      v: bars.map(b => b.volume)
    });
  } catch (error) {
    console.error('Error fetching history:', error.message);
    res.json({ s: 'error', errmsg: error.message });
  }
});

// TradingView UDF: Server time
app.get('/udf/time', (req, res) => {
  res.send(Math.floor(Date.now() / 1000).toString());
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
    name: 'Stock Overview API',
    version: '1.0.0',
    endpoints: {
      rest: {
        stock: '/api/stock/:symbol',
        chart: '/api/chart/:symbol?interval=daily&outputsize=compact'
      },
      tradingview_udf: {
        config: '/udf/config',
        search: '/udf/search?query=:keyword',
        symbols: '/udf/symbols?symbol=:symbol',
        history: '/udf/history?symbol=:symbol&resolution=:resolution&from=:timestamp&to=:timestamp',
        time: '/udf/time'
      },
      health: '/health'
    }
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Stock Overview API server running on port ${PORT}`);
  console.log(`API Key configured: ${ALPHA_VANTAGE_API_KEY ? 'Yes' : 'No'}`);
  console.log(`\nEndpoints:`);
  console.log(`  - REST API: http://localhost:${PORT}/api/stock/:symbol`);
  console.log(`  - Chart API: http://localhost:${PORT}/api/chart/:symbol`);
  console.log(`  - TradingView UDF: http://localhost:${PORT}/udf/config`);
  console.log(`  - Health Check: http://localhost:${PORT}/health`);
});

module.exports = app;
