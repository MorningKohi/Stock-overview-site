const express = require('express');
const router = express.Router();
const udfService = require('../services/udfService');

// UDF Configuration endpoint
router.get('/config', (req, res) => {
  res.json({
    supported_resolutions: ['1', '5', '15', '30', '60', 'D', 'W', 'M'],
    supports_group_request: false,
    supports_marks: false,
    supports_search: true,
    supports_timescale_marks: false,
    exchanges: [
      { value: 'NYSE', name: 'New York Stock Exchange', desc: 'NYSE' },
      { value: 'NASDAQ', name: 'NASDAQ', desc: 'NASDAQ' },
      { value: 'CRYPTO', name: 'Cryptocurrency', desc: 'Crypto' }
    ],
    symbols_types: [
      { name: 'Stock', value: 'stock' },
      { name: 'Index', value: 'index' },
      { name: 'Crypto', value: 'crypto' }
    ]
  });
});

// UDF Symbol Info endpoint
router.get('/symbols', async (req, res, next) => {
  try {
    const { symbol } = req.query;

    if (!symbol) {
      return res.status(400).json({
        s: 'error',
        errmsg: 'Symbol parameter is required'
      });
    }

    const symbolInfo = await udfService.getSymbolInfo(symbol);
    res.json(symbolInfo);
  } catch (error) {
    res.json({
      s: 'error',
      errmsg: error.message
    });
  }
});

// UDF Symbol Search endpoint
router.get('/search', async (req, res, next) => {
  try {
    const { query, limit } = req.query;

    if (!query) {
      return res.json([]);
    }

    const results = await udfService.searchSymbols(query, limit);
    res.json(results);
  } catch (error) {
    res.json([]);
  }
});

// UDF History endpoint - OHLCV bar data
router.get('/history', async (req, res, next) => {
  try {
    const { symbol, resolution, from, to } = req.query;

    if (!symbol || !resolution || !from || !to) {
      return res.json({
        s: 'error',
        errmsg: 'Missing required parameters: symbol, resolution, from, to'
      });
    }

    const history = await udfService.getHistory(
      symbol,
      resolution,
      parseInt(from),
      parseInt(to)
    );

    res.json(history);
  } catch (error) {
    res.json({
      s: 'error',
      errmsg: error.message
    });
  }
});

// UDF Time endpoint
router.get('/time', (req, res) => {
  res.send(Math.floor(Date.now() / 1000).toString());
});

module.exports = router;
