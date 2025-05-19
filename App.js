import React from 'react';
import {BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import NavBar from './components/NavBar';
import Home from './pages/Home';
import StockDetails from './pages/StockDetails';
import Watchlist from './pages/Watchlist';
import Portfolio from './pages/Portfolio';
import About from './pages/About';
import Help from './pages/Help';
import Style from './App.css';

function App(){
    return(
        <Router>
            <div>
                <NavBar/>
                <main style={{padding:'20px'}}>
                <Routes>
                    <Route path="/" element ={<Home/>}/>
                    <Route path= "/home" element ={<Home/>}/>
                    <Route path="/stock/:symbol" element ={<StockDetails/>}/>
                    <Route path= "/watchlist" element ={<Watchlist/>}/>
                    <Route path= "/portfolio" element = {<Portfolio/>}/>
                    <Route path="/about" element = {<About/>}/>
                    <Route path="/help" element = {<Help/>}/>
                    <Route path="*" element ={<div>Error: Page Doesn't Exist</div>}/>

                </Routes>
                </main>
            </div>
        </Router>
    );
}


export default App;


