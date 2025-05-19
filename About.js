import React from "react";

function About() {
  return (
    <div className="container">
      <h1>About EasyTrack Stocks</h1>
      <p>
        EasyTrack Stocks is designed for investors and students who want a simple, accessible way to track stocks, visualize trends, and monitor portfolios-without the complexity of traditional finance platforms.
      </p>
      <ul>
        <li>🔍 Real-time stock search and quotes</li>
        <li>📈 Interactive price charts</li>
        <li>⭐ Personalized watchlist</li>
        <li>💼 Portfolio tracking with value and allocation breakdown</li>
      </ul>
      <p>
        Our mission is to make stock data easy to understand and manage, so anyone can start investing with confidence.
      </p>
      <p>
        <strong>Technologies used:</strong> React, Node.js, PostgreSQL, Chart.js, Alpha Vantage API
      </p>
    </div>
  );
}

export default About;
