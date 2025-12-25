import React, { useEffect, useState } from 'react';
import stockApi from '../services/stockApi';
import './StockQuote.css';

const StockQuote = ({ symbol = 'AAPL', showChart = false }) => {
  const [quote, setQuote] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchQuote = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await stockApi.getQuote(symbol);
        setQuote(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (symbol) {
      fetchQuote();
    }
  }, [symbol]);

  if (loading) {
    return <div className="stock-quote loading">Loading {symbol}...</div>;
  }

  if (error) {
    return <div className="stock-quote error">Error: {error}</div>;
  }

  if (!quote) {
    return null;
  }

  const isPositive = quote.change >= 0;
  const changeClass = isPositive ? 'positive' : 'negative';

  return (
    <div className="stock-quote">
      <div className="stock-header">
        <h2 className="stock-symbol">{quote.symbol}</h2>
        <div className="stock-price">${quote.price.toFixed(2)}</div>
      </div>

      <div className={`stock-change ${changeClass}`}>
        <span className="change-amount">
          {isPositive ? '+' : ''}{quote.change.toFixed(2)}
        </span>
        <span className="change-percent">
          ({quote.changePercent})
        </span>
      </div>

      <div className="stock-details">
        <div className="detail-row">
          <span className="label">Open:</span>
          <span className="value">${quote.open.toFixed(2)}</span>
        </div>
        <div className="detail-row">
          <span className="label">High:</span>
          <span className="value">${quote.high.toFixed(2)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Low:</span>
          <span className="value">${quote.low.toFixed(2)}</span>
        </div>
        <div className="detail-row">
          <span className="label">Volume:</span>
          <span className="value">{quote.volume.toLocaleString()}</span>
        </div>
        <div className="detail-row">
          <span className="label">Previous Close:</span>
          <span className="value">${quote.previousClose.toFixed(2)}</span>
        </div>
      </div>

      <div className="stock-footer">
        <small>Last updated: {quote.latestTradingDay}</small>
      </div>
    </div>
  );
};

export default StockQuote;
