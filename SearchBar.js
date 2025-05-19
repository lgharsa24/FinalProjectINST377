import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function SearchBar() {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestionsLoading, setSuggestionsLoading] = useState(false);
  const navigate = useNavigate();


  const handleInputChange = async (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value.trim().length < 1) {
      setSuggestions([]);
      setShowSuggestions(false);
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
    }
    setSuggestionsLoading(false);
  };


  const handleSuggestionClick = (match) => {
    setQuery('');
    setShowSuggestions(false);
    navigate(`/stock/${match['1. symbol']}`);
  };


  const handleSearch = (e) => {
    e.preventDefault();
    if (query.trim()) {
      navigate(`/stock/${query.trim().toUpperCase()}`);
      setShowSuggestions(false);
      setQuery('');
    }
  };

  return (
    <form onSubmit={handleSearch} style={{ position: 'relative', flex: 1, maxWidth: 420 }}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        placeholder="Search by symbol or company name"
        autoComplete="off"
        style={{
          width: "100%",
          height: "42px",
          fontSize: "1rem",
          padding: "0 16px",
          borderRadius: "8px",
          border: "none",
          outline: "none"
        }}
        onFocus={() => setShowSuggestions(suggestions.length > 0)}
        onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
      />
      {suggestionsLoading && <div style={{ position: "absolute", top: 44, left: 0, background: "#fff", padding: 8 }}>Loading...</div>}
      {showSuggestions && suggestions.length > 0 && (
        <div style={{
          position: "absolute",
          top: "44px",
          left: 0,
          width: "100%",
          background: "#fff",
          border: "1px solid #1976d2",
          borderRadius: "0 0 8px 8px",
          zIndex: 10,
          boxShadow: "0 4px 16px rgba(0,0,0,0.07)"
        }}>
          {suggestions.map(match => (
            <div
              key={match['1. symbol']}
              onMouseDown={() => handleSuggestionClick(match)}
              style={{
                padding: "12px 16px",
                cursor: "pointer",
                fontSize: "1rem"
              }}
              tabIndex={0}
              onKeyDown={e => {
                if (e.key === "Enter") handleSuggestionClick(match);
              }}
            >
              <strong>{match['1. symbol']}</strong> - {match['2. name']}
            </div>
          ))}
        </div>
      )}
    </form>
  );
}

export default SearchBar;
