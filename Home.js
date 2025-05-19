
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Home() {
  const [query, setQuery] = useState('');
  const [stock, setStock] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const navigate = useNavigate();


  const [watchlist, setWatchlist] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [loadingWatchlist, setLoadingWatchlist] = useState(true);
  const [loadingSearches, setLoadingSearches] = useState(true);
  const [watchlistError, setWatchlistError] = useState(null);


  useEffect(() => {
    const fetchWatchlist = async () => {
      try {
        const res = await axios.get("/api/watchlist");
const items = res.data; // [{symbol, company_name}]
if (!Array.isArray(items) || items.length === 0) {
  setWatchlist([]);
  return;
}
const stocks = await Promise.all(
  items.map(async ({ symbol, company_name }) => {
    const quoteRes = await axios.get(`/api/quote/${symbol}`);
    return { symbol, company_name, ...quoteRes.data };
  })
);
setWatchlist(stocks);
      } catch (err) {
        setWatchlistError("Failed to load watchlist");
      } finally {
        setLoadingWatchlist(false);
      }
    };
    fetchWatchlist();
  }, []);

  useEffect(() => {
    const fetchRecentSearches = async () => {
      try {
        const res = await axios.get("/api/recent-searches");
        setRecentSearches(res.data);
      } catch (err) {
        setRecentSearches([]);
      } finally {
        setLoadingSearches(false);
      }
    };
    fetchRecentSearches();
  }, []);

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);
    setError('');
    setStock(null);

    if (value.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
      setSuggestionsLoading(false);
      return;
    }

    setSuggestionsLoading(true);
    try {
      const res = await fetch(`/api/symbolsearch/${encodeURIComponent(value.trim())}`);
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.bestMatches || []);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch {
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setSuggestionsLoading(false);
    }
  };

  const handleSuggestionClick = async (match) => {
    setQuery(match['1. symbol']);
    setShowSuggestions(false);
    await handleSearchBySymbol(match['1. symbol'], match['2. name']);
  };

  const handleSearchBySymbol = async (symbol, companyName) => {
    setLoading(true);
    setError('');
    setStock(null);
    try {
      const quoteRes = await fetch(`/api/quote/${symbol}`);
      if (!quoteRes.ok) throw new Error('Stock not found');
      const quoteData = await quoteRes.json();
      const stockData = quoteData.symbol ? quoteData : {
        symbol: quoteData["01. symbol"],
        price: quoteData["05. price"],
        change: quoteData["09. change"],
        changePercent: quoteData["10. change percent"]
      };

      let fullCompanyName = companyName || symbol;
      try {
        const overviewRes = await fetch(`/api/overview/${symbol}`);
        if (overviewRes.ok) {
          const overviewData = await overviewRes.json();
          if (overviewData.Name) fullCompanyName = overviewData.Name;
        }
      } catch {} 

      setStock(stockData);

      // Save recent search
      await fetch('/api/recent-searches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: stockData.symbol,
          companyName: fullCompanyName
        }),
      });

    } catch (err) {
      setError(err.message || 'Error fetching stock data');
    }
    setLoading(false);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setStock(null);
    try {
      await handleSearchBySymbol(query.trim().toUpperCase(), '');
    } catch (err) {
      setError('Stock not found.');
    }
    setLoading(false);
  };


  return (
    <div>
      <h1>EasyTrack Stocks</h1>
      <p>Track your favorite stocks and manage your investments.</p>

      {/* --- Search Bar Section --- */}
      <form onSubmit={handleSearch} style={{ position: 'relative', maxWidth: 600, margin: '0 auto' }}>
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          placeholder="Search by symbol or company name"
          autoComplete="off"
          style={{
            width: "100%",
            height: "48px",
            fontSize: "1.2rem",
            padding: "0 18px",
            borderRadius: "10px",
            border: "2px solid #1976d2",
            boxSizing: "border-box",
            outline: "none"
          }}
          onFocus={() => setShowSuggestions(suggestions.length > 0)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            height: '48px',
            fontSize: '1.1rem',
            marginLeft: '8px',
            borderRadius: '10px',
            padding: '0 24px',
            background: '#1976d2',
            color: 'white',
            border: 'none',
            cursor: 'pointer',
            position: 'absolute',
            right: 0,
            top: 0
          }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>

        {suggestionsLoading && query.trim() && (
          <div style={{ marginTop: 8 }}>Loading suggestions...</div>
        )}

        {showSuggestions && suggestions.length > 0 && (
          <div
            style={{
              position: 'absolute',
              top: '52px',
              left: 0,
              width: '100%',
              maxHeight: '350px',
              overflowY: 'auto',
              background: '#fff',
              border: '2px solid #1976d2',
              borderTop: 'none',
              borderRadius: '0 0 10px 10px',
              zIndex: 20,
              boxShadow: '0 4px 16px rgba(0,0,0,0.07)'
            }}
          >
            {suggestions.map((match) => (
              <div
                key={match['1. symbol']}
                onMouseDown={() => handleSuggestionClick(match)}
                style={{
                  padding: '18px 24px',
                  fontSize: '1.15rem',
                  cursor: 'pointer',
                  background: '#fff',
                  borderBottom: '1px solid #eee',
                  transition: 'background 0.2s',
                  userSelect: 'none'
                }}
                tabIndex={0}
                onKeyDown={e => {
                  if (e.key === 'Enter') handleSuggestionClick(match);
                }}
              >
                <strong>{match['1. symbol']}</strong> - {match['2. name']}
              </div>
            ))}
          </div>
        )}
      </form>

      {error && <div style={{ color: '#F44336', marginTop: 20 }}>{error}</div>}

      {stock && (
        <div style={{ marginTop: 36, maxWidth: 500, border: '1.5px solid #1976d2', borderRadius: 12, padding: 24, background: '#f8fbff', marginLeft: 'auto', marginRight: 'auto' }}>
          <h2 style={{ marginBottom: 12 }}>
            {stock.symbol}
            <span style={{ fontWeight: 400, fontSize: '1rem', marginLeft: 12 }}>
              <Link to={`/stock/${stock.symbol}`} style={{ color: '#1976d2', textDecoration: 'underline' }}>View Details →</Link>
            </span>
          </h2>
          <div style={{ fontSize: '1.15rem', marginBottom: 6 }}>
            <strong>Price:</strong> ${stock.price}
          </div>
          <div style={{ fontSize: '1.15rem' }}>
            <strong>Change:</strong>{' '}
            <span style={{ color: Number(stock.change) >= 0 ? '#4CAF50' : '#F44336' }}>
              {Number(stock.change) >= 0 ? '+' : ''}
              {stock.change} {stock.changePercent}
            </span>
          </div>
        </div>
      )}

      {/* --- Watchlist Section --- */}
      <h2>Watchlist</h2>
      {loadingWatchlist ? (
        <div>Loading watchlist...</div>
      ) : watchlistError ? (
        <div>{watchlistError}</div>
      ) : watchlist.length === 0 ? (
        <div>Your watchlist is empty.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Price</th>
              <th>Change</th>
              <th>Change %</th>
            </tr>
          </thead>
          <tbody>
            {watchlist.map((stock) => (
              <tr key={stock.symbol}>
                <td>
                  <Link to={`/stock/${stock.symbol}`}>{stock.symbol} - {stock.company_name}</Link>
                </td>
                <td>${Number(stock.price).toFixed(2)}</td>
                <td style={{ color: stock.change >= 0 ? "green" : "red" }}>
                  {stock.change >= 0 ? "+" : ""}
                  {stock.change}
                </td>
                <td>{stock.changePercent}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {/* --- Recent Searches Section --- */}
      <h2>Recent Searches</h2>
      {loadingSearches ? (
        <div>Loading recent searches...</div>
      ) : recentSearches.length === 0 ? (
        <div>No recent searches.</div>
      ) : (
        <ul>
          {recentSearches.map(({ symbol, companyName }) => (
            <li key={symbol}>
              <Link to={`/stock/${symbol}`}>
                {symbol} {companyName ? `- ${companyName}` : ""}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Home;

