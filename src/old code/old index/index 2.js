import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LandingPage from './LandingPage';
import ChartPage from './ChartPage';
import FertilizerChartPage from './FertilizerChartPage';
import SoilChartPage from './SoilChartPage';
import CropYieldChartPage from './CropYieldChartPage';
import FinanceChartPage from './FinanceChartPage';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Router>
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/chart" element={<ChartPage />} />
      <Route path="/fertilizer" element={<FertilizerChartPage />} />
      <Route path="/soil" element={<SoilChartPage />} />
      <Route path="/crop-yield" element={<CropYieldChartPage />} />
      <Route path="/finance" element={<FinanceChartPage />} />
    </Routes>
  </Router>
);
