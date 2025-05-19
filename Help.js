import React from "react";

function Help() {
  return (
    <div className="container">
      <h1>Help &amp; FAQ</h1>
      <h2>How do I search for a stock?</h2>
      <p>
        Use the search bar at the top of the Home page. Start typing a symbol or company name and select from the suggestions.
      </p>
      <h2>How do I add a stock to my watchlist or portfolio?</h2>
      <p>
        On the stock details page, click "Add to Watchlist" or "Add to Portfolio". You can manage your lists from the Watchlist and Portfolio pages.
      </p>
      <h2>How do I change the quantity of a stock in my portfolio?</h2>
      <p>
        On the Portfolio page, type the desired quantity in the input box next to the stock. The portfolio value and chart will update automatically.
      </p>
      <h2>Why am I seeing an error or missing data?</h2>
      <p>
        Stock data is fetched from the Alpha Vantage API, which may have rate limits or occasional outages. Try again later if you experience issues.
      </p>
      <h2>Still need help?</h2>
      <p>
        Contact the developer at <a href="mailto:support@easytrackstocks.com">support@easytrackstocks.com</a>
      </p>
    </div>
  );
}

export default Help;
