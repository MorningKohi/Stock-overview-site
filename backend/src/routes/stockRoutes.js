const express = require('express');
const router = express.Router();
const stockService = require('../services/stockService');

// Get current stock quote
router.get('/quote/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const quote = await stockService.getQuote(symbol);
    res.json(quote);
  } catch (error) {
    next(error);
  }
});

// Get intraday data (for charts)
router.get('/intraday/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const interval = req.query.interval || '5min';
    const data = await stockService.getIntraday(symbol, interval);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Get daily historical data
router.get('/daily/:symbol', async (req, res, next) => {
  try {
    const { symbol } = req.params;
    const outputsize = req.query.outputsize || 'compact';
    const data = await stockService.getDaily(symbol, outputsize);
    res.json(data);
  } catch (error) {
    next(error);
  }
});

// Search for stocks by keyword
router.get('/search', async (req, res, next) => {
  try {
    const { keywords } = req.query;
    if (!keywords) {
      return res.status(400).json({ error: 'Keywords parameter is required' });
    }
    const results = await stockService.searchSymbols(keywords);
    res.json(results);
  } catch (error) {
    next(error);
  }
});

module.exports = router;
