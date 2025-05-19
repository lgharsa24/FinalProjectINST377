import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
);

function StockDetails() {
  const { symbol } = useParams();
  const [stock, setStock] = useState(null);
  const [message, setMessage] = useState("");
  const [history, setHistory] = useState(null);
  const [range, setRange] = useState('30');

  useEffect(() => {
    fetch(`/api/quote/${symbol}`)
      .then(res => res.json())
      .then(data => setStock(data));
  }, [symbol]);

  useEffect(() => {
    fetch(`/api/history/${symbol}`)
      .then(res => res.json())
      .then(data => setHistory(data));
  }, [symbol]);

  const handleAddToWatchlist = async () => {
    setMessage("");
    const res = await fetch("/api/watchlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: stock.symbol, companyName: stock.companyName || stock.symbol }),
    });
    const data = await res.json();
    if (data.success) setMessage("Added to Watchlist!");
    else setMessage(data.error || "Error adding to Watchlist.");
  };

  const handleAddToPortfolio = async () => {
    setMessage("");
    const res = await fetch("/api/portfolio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ symbol: stock.symbol, companyName: stock.companyName || stock.symbol }),
    });
    const data = await res.json();
    if (data.success) setMessage("Added to Portfolio!");
    else setMessage(data.error || "Error adding to Portfolio.");
  };

  const ranges = [
    { label: "7D", value: "7" },
    { label: "30D", value: "30" },
    { label: "90D", value: "90" },
    { label: "All", value: "all" }
  ];

  let chartData = null;
  if (history) {
    const allDates = Object.keys(history).reverse();
    const allCloses = allDates.map(date => parseFloat(history[date]['4. close']));
    let dates = allDates;
    let closes = allCloses;
    if (range !== "all") {
      const n = parseInt(range, 10);
      dates = allDates.slice(-n);
      closes = allCloses.slice(-n);
    }
    chartData = {
      labels: dates,
      datasets: [
        {
          label: `${symbol} Closing Price`,
          data: closes,
          fill: false,
          borderColor: 'rgba(75,192,192,1)',
          tension: 0.1,
        },
      ],
    };
  }

  if (!stock) return <div>Loading...</div>;

  return (
    <div>
      <h2>{stock.symbol} Details</h2>
      <div>
        <strong>Price:</strong> ${Number(stock.price).toFixed(2)}<br />
        <strong>Change:</strong> <span style={{ color: Number(stock.change) >= 0 ? "green" : "red" }}>
          {Number(stock.change) >= 0 ? "+" : ""}
          {stock.change} ({stock.changePercent})
        </span><br />
        <strong>Open:</strong> {stock.open}<br />
        <strong>High:</strong> {stock.high}<br />
        <strong>Low:</strong> {stock.low}<br />
        <strong>Previous Close:</strong> {stock.previousClose}<br />
        <strong>Volume:</strong> {stock.volume}<br />
        <strong>Latest Trading Day:</strong> {stock.latestTradingDay}<br />
      </div>
      <button onClick={handleAddToWatchlist}>Add to Watchlist</button>
      <button onClick={handleAddToPortfolio}>Add to Portfolio</button>
      {message && <div>{message}</div>}
      <div>
        <h3>Price History</h3>
        <div>
          {ranges.map(r => (
            <button
              key={r.value}
              onClick={() => setRange(r.value)}
              style={{ fontWeight: range === r.value ? "bold" : "normal" }}
            >
              {r.label}
            </button>
          ))}
        </div>
        {chartData && <Line data={chartData} />}
      </div>
    </div>
  );
}

export default StockDetails;
