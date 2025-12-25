import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { BuilderComponent, builder } from '@builder.io/react';
import StockQuote from './components/StockQuote';
import StockSearch from './components/StockSearch';
import './App.css';

// Initialize Builder.io with your API key
builder.init(process.env.REACT_APP_BUILDER_API_KEY || 'YOUR_BUILDER_API_KEY');

// Register custom components with Builder.io
builder.registerComponent(StockQuote, {
  name: 'StockQuote',
  inputs: [
    {
      name: 'symbol',
      type: 'text',
      defaultValue: 'AAPL',
      required: true,
      helperText: 'Stock ticker symbol (e.g., AAPL, TSLA, GOOGL)'
    },
    {
      name: 'showChart',
      type: 'boolean',
      defaultValue: false,
      helperText: 'Show chart visualization'
    }
  ]
});

builder.registerComponent(StockSearch, {
  name: 'StockSearch',
  inputs: []
});

function App() {
  const [selectedStock, setSelectedStock] = React.useState('AAPL');

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          <h1>📈 Stock Overview</h1>
          <p>Powered by Builder.io & Alpha Vantage</p>
        </header>

        <Routes>
          {/* Builder.io page route */}
          <Route
            path="/"
            element={
              <BuilderComponent model="page" />
            }
          />

          {/* Demo page without Builder.io */}
          <Route
            path="/demo"
            element={
              <div className="demo-page">
                <div className="container">
                  <section className="search-section">
                    <h2>Search Stocks</h2>
                    <StockSearch onSelectStock={setSelectedStock} />
                  </section>

                  <section className="quote-section">
                    <h2>Stock Quote</h2>
                    <StockQuote symbol={selectedStock} />
                  </section>
                </div>
              </div>
            }
          />

          {/* Catch-all for Builder.io dynamic pages */}
          <Route
            path="*"
            element={
              <BuilderComponent model="page" />
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
