const axios = require('axios');

const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';
const API_KEY = process.env.ALPHA_VANTAGE_API_KEY;

class StockService {
  // Get current stock quote
  async getQuote(symbol) {
    try {
      const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol.toUpperCase(),
          apikey: API_KEY
        }
      });

      if (response.data['Error Message']) {
        throw new Error('Invalid stock symbol');
      }

      if (response.data['Note']) {
        throw new Error('API rate limit reached. Please try again later.');
      }

      const quote = response.data['Global Quote'];

      if (!quote || Object.keys(quote).length === 0) {
        throw new Error('No data found for this symbol');
      }

      return {
        symbol: quote['01. symbol'],
        price: parseFloat(quote['05. price']),
        change: parseFloat(quote['09. change']),
        changePercent: quote['10. change percent'],
        volume: parseInt(quote['06. volume']),
        latestTradingDay: quote['07. latest trading day'],
        previousClose: parseFloat(quote['08. previous close']),
        open: parseFloat(quote['02. open']),
        high: parseFloat(quote['03. high']),
        low: parseFloat(quote['04. low'])
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`Alpha Vantage API error: ${error.response.status}`);
      }
      throw error;
    }
  }

  // Get intraday data for charts
  async getIntraday(symbol, interval = '5min') {
    try {
      const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: 'TIME_SERIES_INTRADAY',
          symbol: symbol.toUpperCase(),
          interval: interval,
          apikey: API_KEY
        }
      });

      if (response.data['Error Message']) {
        throw new Error('Invalid stock symbol');
      }

      if (response.data['Note']) {
        throw new Error('API rate limit reached. Please try again later.');
      }

      const timeSeriesKey = `Time Series (${interval})`;
      const timeSeries = response.data[timeSeriesKey];

      if (!timeSeries) {
        throw new Error('No intraday data found');
      }

      const formattedData = Object.entries(timeSeries).map(([timestamp, values]) => ({
        timestamp,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'])
      }));

      return {
        symbol: symbol.toUpperCase(),
        interval,
        data: formattedData
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`Alpha Vantage API error: ${error.response.status}`);
      }
      throw error;
    }
  }

  // Get daily historical data
  async getDaily(symbol, outputsize = 'compact') {
    try {
      const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: 'TIME_SERIES_DAILY',
          symbol: symbol.toUpperCase(),
          outputsize: outputsize,
          apikey: API_KEY
        }
      });

      if (response.data['Error Message']) {
        throw new Error('Invalid stock symbol');
      }

      if (response.data['Note']) {
        throw new Error('API rate limit reached. Please try again later.');
      }

      const timeSeries = response.data['Time Series (Daily)'];

      if (!timeSeries) {
        throw new Error('No daily data found');
      }

      const formattedData = Object.entries(timeSeries).map(([date, values]) => ({
        date,
        open: parseFloat(values['1. open']),
        high: parseFloat(values['2. high']),
        low: parseFloat(values['3. low']),
        close: parseFloat(values['4. close']),
        volume: parseInt(values['5. volume'])
      }));

      return {
        symbol: symbol.toUpperCase(),
        data: formattedData
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`Alpha Vantage API error: ${error.response.status}`);
      }
      throw error;
    }
  }

  // Search for stock symbols
  async searchSymbols(keywords) {
    try {
      const response = await axios.get(ALPHA_VANTAGE_BASE_URL, {
        params: {
          function: 'SYMBOL_SEARCH',
          keywords: keywords,
          apikey: API_KEY
        }
      });

      if (response.data['Note']) {
        throw new Error('API rate limit reached. Please try again later.');
      }

      const matches = response.data['bestMatches'] || [];

      return {
        results: matches.map(match => ({
          symbol: match['1. symbol'],
          name: match['2. name'],
          type: match['3. type'],
          region: match['4. region'],
          marketOpen: match['5. marketOpen'],
          marketClose: match['6. marketClose'],
          timezone: match['7. timezone'],
          currency: match['8. currency'],
          matchScore: parseFloat(match['9. matchScore'])
        }))
      };
    } catch (error) {
      if (error.response) {
        throw new Error(`Alpha Vantage API error: ${error.response.status}`);
      }
      throw error;
    }
  }
}

module.exports = new StockService();
