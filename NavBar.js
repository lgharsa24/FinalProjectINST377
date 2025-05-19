import React from "react";
import { Link } from "react-router-dom";

function NavBar() {
  return (
    <nav style={{ display: "flex", alignItems: "center", padding: "12px 24px", background: "#1976d2", fontSize:"1.5rem" }}>
      <Link to="/" style={{ color: "#fff", fontWeight: "bold", fontSize: "3rem", marginRight: 30, textDecoration: "none" }}>
        EasyTrack Stocks
      </Link>
      <Link to ="/home" style={{ color: "#fff", marginLeft: 100, textDecoration: "none" }}>Home</Link>
      <Link to="/watchlist" style={{ color: "#fff", marginLeft: 24, textDecoration: "none" }}>Watchlist</Link>
      <Link to="/portfolio" style={{ color: "#fff", marginLeft: 24, textDecoration: "none" }}>Portfolio</Link>
      <Link to="/about" style={{ color: "#fff", marginLeft: 24, textDecoration: "none" }}>About</Link>
      <Link to="/help" style={{ color: "#fff", marginLeft: 24, textDecoration: "none" }}>Help</Link>
    </nav>
  );
}

export default NavBar;

