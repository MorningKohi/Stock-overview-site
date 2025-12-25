import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

class StockAPI {
  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    });
  }

  // Stock API Methods
  async getQuote(symbol) {
    try {
      const response = await this.client.get(`/api/stocks/quote/${symbol}`);
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getIntraday(symbol, interval = '5min') {
    try {
      const response = await this.client.get(`/api/stocks/intraday/${symbol}`, {
        params: { interval }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getDaily(symbol, outputsize = 'compact') {
    try {
      const response = await this.client.get(`/api/stocks/daily/${symbol}`, {
        params: { outputsize }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchSymbols(keywords) {
    try {
      const response = await this.client.get('/api/stocks/search', {
        params: { keywords }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  // UDF Methods for TradingView
  async getUDFConfig() {
    try {
      const response = await this.client.get('/udf/config');
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUDFSymbol(symbol) {
    try {
      const response = await this.client.get('/udf/symbols', {
        params: { symbol }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async searchUDFSymbols(query, limit = 10) {
    try {
      const response = await this.client.get('/udf/search', {
        params: { query, limit }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  async getUDFHistory(symbol, resolution, from, to) {
    try {
      const response = await this.client.get('/udf/history', {
        params: { symbol, resolution, from, to }
      });
      return response.data;
    } catch (error) {
      throw this.handleError(error);
    }
  }

  handleError(error) {
    if (error.response) {
      // Server responded with error
      return new Error(error.response.data.error?.message || error.response.data.errmsg || 'API Error');
    } else if (error.request) {
      // Request made but no response
      return new Error('No response from server. Please check if the backend is running.');
    } else {
      // Something else happened
      return new Error(error.message);
    }
  }
}

export default new StockAPI();
