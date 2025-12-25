const stockService = require('./stockService');

class UDFService {
  // Convert resolution string to Alpha Vantage format
  convertResolution(resolution) {
    const resolutionMap = {
      '1': '1min',
      '5': '5min',
      '15': '15min',
      '30': '30min',
      '60': '60min',
      'D': 'daily',
      'W': 'weekly',
      'M': 'monthly'
    };
    return resolutionMap[resolution] || '5min';
  }

  // Get symbol information
  async getSymbolInfo(symbol) {
    try {
      const quote = await stockService.getQuote(symbol);

      return {
        name: symbol.toUpperCase(),
        ticker: symbol.toUpperCase(),
        description: symbol.toUpperCase(),
        type: 'stock',
        session: '0930-1600',
        exchange: 'NYSE',
        listed_exchange: 'NYSE',
        timezone: 'America/New_York',
        minmov: 1,
        pricescale: 100,
        has_intraday: true,
        has_daily: true,
        has_weekly_and_monthly: true,
        supported_resolutions: ['1', '5', '15', '30', '60', 'D', 'W', 'M'],
        data_status: 'streaming',
        currency_code: 'USD'
      };
    } catch (error) {
      throw new Error(`Symbol not found: ${symbol}`);
    }
  }

  // Search for symbols
  async searchSymbols(query, limit = 10) {
    try {
      const searchResults = await stockService.searchSymbols(query);

      return searchResults.results.slice(0, limit).map(result => ({
        symbol: result.symbol,
        full_name: result.symbol,
        description: result.name,
        exchange: result.region,
        ticker: result.symbol,
        type: result.type.toLowerCase()
      }));
    } catch (error) {
      return [];
    }
  }

  // Get historical OHLCV data
  async getHistory(symbol, resolution, from, to) {
    try {
      const avResolution = this.convertResolution(resolution);
      let data;

      // Determine which Alpha Vantage function to use based on resolution
      if (avResolution === 'daily' || avResolution === 'weekly' || avResolution === 'monthly') {
        // For daily and longer timeframes
        data = await stockService.getDaily(symbol, 'full');
      } else {
        // For intraday data
        const interval = avResolution;
        data = await stockService.getIntraday(symbol, interval);
      }

      // Convert Alpha Vantage data to UDF format
      const bars = this.convertToUDFBars(data.data, from, to, resolution);

      if (bars.length === 0) {
        return {
          s: 'no_data',
          nextTime: to
        };
      }

      return {
        s: 'ok',
        t: bars.map(b => b.time),
        o: bars.map(b => b.open),
        h: bars.map(b => b.high),
        l: bars.map(b => b.low),
        c: bars.map(b => b.close),
        v: bars.map(b => b.volume)
      };
    } catch (error) {
      return {
        s: 'error',
        errmsg: error.message
      };
    }
  }

  // Convert Alpha Vantage data to UDF bar format
  convertToUDFBars(data, from, to, resolution) {
    const bars = [];

    for (const item of data) {
      // Parse timestamp
      let timestamp;
      if (item.timestamp) {
        // Intraday data
        timestamp = new Date(item.timestamp).getTime() / 1000;
      } else if (item.date) {
        // Daily data - use UTC midnight instead of EST to avoid timezone issues
        const date = new Date(item.date + 'T00:00:00Z');
        timestamp = date.getTime() / 1000;
      } else {
        continue;
      }

      // Filter by time range
      if (timestamp < from || timestamp > to) {
        continue;
      }

      bars.push({
        time: Math.floor(timestamp),
        open: item.open,
        high: item.high,
        low: item.low,
        close: item.close,
        volume: item.volume
      });
    }

    // Sort bars by time (ascending)
    bars.sort((a, b) => a.time - b.time);

    return bars;
  }

  // Get marks (optional - for events on chart)
  async getMarks(symbol, from, to, resolution) {
    // This can be implemented later to show earnings, dividends, etc.
    return [];
  }

  // Get timescale marks (optional - for timeline events)
  async getTimescaleMarks(symbol, from, to, resolution) {
    // This can be implemented later
    return [];
  }
}

module.exports = new UDFService();
