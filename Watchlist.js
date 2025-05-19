import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function Watchlist() {
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWatchlist();
  }, []);

  const fetchWatchlist = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/watchlist");
      const stocks = await res.json(); // [{symbol, company_name}]
      if (!Array.isArray(stocks) || stocks.length === 0) {
        setWatchlist([]);
        setLoading(false);
        return;
      }
      const stocksWithQuotes = await Promise.all(
        stocks.map(async (stock) => {
          const quoteRes = await fetch(`/api/quote/${stock.symbol}`);
          const quote = await quoteRes.json();
          return { ...stock, ...quote };
        })
      );
      setWatchlist(stocksWithQuotes);
    } catch {
      setWatchlist([]);
    }
    setLoading(false);
  };

  const handleRemove = async (symbol) => {
    await fetch(`/api/watchlist/${symbol}`, { method: "DELETE" });
    setWatchlist((prev) => prev.filter((stock) => stock.symbol !== symbol));
  };

  if (loading) return <div>Loading watchlist...</div>;

  return (
    <div>
      <h2>Your Watchlist</h2>
      {watchlist.length === 0 ? (
        <div>No stocks in your watchlist.</div>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Symbol & Name</th>
              <th>Price</th>
              <th>Change</th>
              <th>Change %</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {watchlist.map((stock) => (
              <tr key={stock.symbol}>
                <td>
                  <Link to={`/stock/${stock.symbol}`}>
                    {stock.symbol} - {stock.company_name}
                  </Link>
                </td>
                <td>${Number(stock.price).toFixed(2)}</td>
                <td style={{ color: Number(stock.change) >= 0 ? "green" : "red" }}>
                  {Number(stock.change) >= 0 ? "+" : ""}
                  {stock.change}
                </td>
                <td>{stock.changePercent}</td>
                <td>
                  <button onClick={() => handleRemove(stock.symbol)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Watchlist;
