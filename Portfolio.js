import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

function Portfolio() {
  const [portfolio, setPortfolio] = useState([]);
  const [loading, setLoading] = useState(true);
  const [totalValue, setTotalValue] = useState(0);

  const fetchPortfolio = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/portfolio");
      const stocks = await res.json();
      
      const stocksWithValues = await Promise.all(
        stocks.map(async (stock) => {
          const quoteRes = await fetch(`/api/quote/${stock.symbol}`);
          const quote = await quoteRes.json();
          const value = Number(quote.price) * stock.quantity;
          return { ...stock, ...quote, value };
        })
      );

      const total = stocksWithValues.reduce((sum, stock) => sum + stock.value, 0);
      setTotalValue(total);
      setPortfolio(stocksWithValues);
    } catch {
      setPortfolio([]);
    }
    setLoading(false);

  };

  const handleRemove = async (symbol) => {
    await fetch(`/api/portfolio/${symbol}`, { method: "DELETE" });
    setPortfolio((prev) => prev.filter((stock) => stock.symbol !== symbol));
  };

  const handleQuantityChange = async (symbol, newQuantity) => {
    if (isNaN(newQuantity) || newQuantity < 0) return;
    
    try {
      await fetch(`/api/portfolio/${symbol}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ quantity: parseInt(newQuantity) })
      });
      fetchPortfolio(); 
    } catch (err) {
      console.error("Error updating quantity:", err);
    }
  };

  const chartData = {
    labels: portfolio.map(stock => stock.symbol),
    datasets: [{
      data: portfolio.map(stock => stock.value),
      backgroundColor: [
        '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', 
        '#9966FF', '#FF9F40', '#EB3B5A', '#2d98da'
      ]
    }]
  };

  if (loading) return <div>Loading portfolio...</div>;

  return (
    <div>
      <h2>Your Portfolio</h2>
      <div style={{ marginBottom: '20px', fontSize: '1.2rem' }}>
        Total Value: ${totalValue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div>
          <table>
            <thead>
              <tr>
                <th>Symbol</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Value</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {portfolio.map((stock) => (
                <tr key={stock.symbol}>
                  <td>
                    <Link to={`/stock/${stock.symbol}`}>
                      {stock.symbol} - {stock.company_name}
                    </Link>
                  </td>
                  <td>${Number(stock.price).toFixed(2)}</td>
                  <td>
                    <input
                      type="number"
                      value={stock.quantity}
                      min="0"
                      onChange={(e) => handleQuantityChange(stock.symbol, e.target.value)}
                      style={{ width: '70px' }}
                    />
                  </td>
                  <td>${(stock.quantity * stock.price).toFixed(2)}</td>
                  <td>
                    <button onClick={() => handleRemove(stock.symbol)}>Remove</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {portfolio.length > 0 && (
          <div style={{ maxWidth: '400px' }}>
            <h3>Portfolio Allocation</h3>
            <Pie 
              data={chartData}
              options={{
                plugins: {
                  tooltip: {
                    callbacks: {
                      label: (context) => {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        return `${label}: $${value.toFixed(2)} (${((value/totalValue)*100).toFixed(1)}%)`;
                      }
                    }
                  }
                }
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}

export default Portfolio;
