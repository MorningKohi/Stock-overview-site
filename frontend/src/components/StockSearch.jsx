import React, { useState } from 'react';
import stockApi from '../services/stockApi';
import './StockSearch.css';

const StockSearch = ({ onSelectStock }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();

    if (!query.trim()) {
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await stockApi.searchSymbols(query);
      setResults(data.results || []);
    } catch (err) {
      setError(err.message);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectStock = (symbol) => {
    if (onSelectStock) {
      onSelectStock(symbol);
    }
    setQuery('');
    setResults([]);
  };

  return (
    <div className="stock-search">
      <form onSubmit={handleSearch} className="search-form">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search stocks (e.g., Apple, Tesla)..."
          className="search-input"
        />
        <button type="submit" className="search-button" disabled={loading}>
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      {error && <div className="search-error">{error}</div>}

      {results.length > 0 && (
        <div className="search-results">
          {results.map((result) => (
            <div
              key={result.symbol}
              className="result-item"
              onClick={() => handleSelectStock(result.symbol)}
            >
              <div className="result-symbol">{result.symbol}</div>
              <div className="result-name">{result.name}</div>
              <div className="result-details">
                {result.type} • {result.region}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StockSearch;
