# FinalProjectINST377

EasyTrack Stocks aims to provide a user-friendly, easy-to-navigate platform for users to look up stock prices, visualize trends with charts, save a list of stocks under a personalized “watchlist”, and get basic information about stock trends. By focusing on usability and essentials, and removing some of the overly complicated features other programs provide, this goal is for this application to make stock data more accessible and digestible for new investors. 

Target Browsers
EasyTrack Stocks is designed to work  on all modern browsers, including:
Desktop: Chrome, Firefox, Safari, Edge
Mobile: iOS Safari (iOS 14+), Android Chrome (Android 10+)

See the Developer Manual below for setup, API documentation, and contribution guidelines.






Developer Manual

Audience: Future developers maintaining or extending EasyTrack Stocks. Assumes general development knowledge.
Installation
Clone the repository:
git clone https://github.com/yourusername/easytrack-stocks.git
cd easytrack-stocks
Install dependencies:
text
npm install
Set up environment variables:
Create a .env file in the root directory with your Alpha Vantage API key and database URL:
text
ALPHA_VANTAGE_API_KEY=your_api_key_here
DATABASE_URL=your_postgres_connection_string
Set up the database:
Ensure PostgreSQL is running.
The backend will auto-create tables on first run, but you can manually initialize 
Running the Application
Start the backend server:
node server.js
(Or use npm run start if you have a script.)
Start the frontend React app:
npm start
The app will be available at http://localhost:3000 and will proxy API requests to the backend.
Testing
Frontend tests:
npm test
Backend tests: (If implemented, describe location and how to run.)
API Documentation
GET /api/quote/:symbol
Returns real-time quote for the given stock symbol.
GET /api/history/:symbol
Returns historical daily prices for the stock.
GET /api/overview/:symbol
Returns company overview information.
GET /api/watchlist
Returns the user's watchlist as an array of {symbol, company_name}.
POST /api/watchlist
Adds a stock to the watchlist. Body: {symbol, companyName}.
DELETE /api/watchlist/:symbol
Removes a stock from the watchlist.
GET /api/portfolio
Returns the user's portfolio as an array of {symbol, company_name, quantity}.
POST /api/portfolio
Adds a stock to the portfolio. Body: {symbol, companyName, quantity}.
PUT /api/portfolio/:symbol
Updates the quantity of a stock in the portfolio. Body: {quantity}.
DELETE /api/portfolio/:symbol
Removes a stock from the portfolio.
GET /api/recent-searches
Returns an array of recent search objects.
POST /api/recent-searches
Adds a recent search. Body: {symbol, companyName}.
GET /api/symbolsearch/:query
Returns autocomplete matches for the query.
Known Bugs & Roadmap
Known Bugs
Occasional API rate limits from Alpha Vantage may cause missing data or errors.
No authentication: all users share the same watchlist/portfolio (future: add user accounts).
Mobile layout may need further refinement for very small screens.
Portfolio section is glitchy; will further develop it in the future

Add user authentication and per-user data storage.
Enhance error handling and offline support.
Add more advanced charting and analytics.
Improve accessibility (ARIA labels, keyboard navigation).
Add notifications for API errors and data updates.
