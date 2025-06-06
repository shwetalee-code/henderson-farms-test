import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import ChartPage from './ChartPage';
import FertilizerChartPage from './FertilizerChartPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/chart" element={<ChartPage />} />
      <Route path="/fertilizer" element={<FertilizerChartPage />} />
    </Routes>
  </Router>
);