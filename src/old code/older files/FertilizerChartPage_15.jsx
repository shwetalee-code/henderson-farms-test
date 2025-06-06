
import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import treeBg from './tree_bg.png';
import { useNavigate } from 'react-router-dom';

function FertilizerChartPage() {
  const navigate = useNavigate();

  const umOptions = ['bg', 'btl', 'gal', 'lb', 'tn'];
  const fieldOptions = ['505 NORTH', '505 SOUTH', 'BALBOA', 'BC-W', 'BI-1', 'BRS-250', 'BRU-1A', 'BRU-2A', 'BRU-3W', 'BYRD', 'C & H 2', 'C & H 3', 'DAF', 'DAF 2', 'DNW', 'FI', 'GB-40', 'GJ', 'GL-ORGANIC', 'GL-RANCH', 'GOLF', 'GOLFP', 'GOOD', 'HIB', 'JBW', 'JK', 'KF', 'MATT', 'MAZZ-50', 'MAZZ-HOME', 'MCA', 'MCW', 'OTHER', 'OVERHEAD', 'RCH', 'REYES', 'SP50', 'STACY', 'TD', 'TERK', 'TOP', 'WFP - DAWLEY', 'YOLO 97', 'ZUM'];
  const fertilizerOptions = ['0-0-0 25.10S 21.16Ca (0-0-0 25.10S 21.16Ca)', '15-15-15 (15-15-15)', '7 SEAS ELITE (7 SEAS ELITE)', 'AAC 1-0-0 AMINO ACID CHELATE (AAC 1-0-0 AMINO ACID CHELATE)', 'AMMONIUM SULFATE (AMMONIUM SULFATE)', 'AMMONIUM THIOSULFATE (AMMONIUM THIOSULFATE (ATS))', 'AWP Key Plex 2.5 (AWP Key Plex 2.5)', 'BASE Blue Gold (BASE Blue Gold)', 'BG-SAC VALLEY BLEND (PPD) (BG-SAC VALLEY BLEND)', 'BLUE GOLD HUMA-PHOS (BLUE GOLD HUMA-PHOS)', 'BLUE GOLD SALT SLAYER (BLUE GOLD SALT SLAYER)', 'BORON 10% (BORON 10%)', 'CAN-17 (CAN-17)', 'CITRIC ACID (CITRIC ACID)', 'CN-9 (CN-9)', 'COBALT Blue Gold (COBALT Blue Gold)', 'COPPER SULFATE CRYSTALS (COPPER SULFATE CRYSTALS)', 'CUSTOM-MIN-COL (CUSTOM-MIN-COL BASE Blue Gold)', 'CoBorMoly (INTEGRITY Z 5-0-0)', 'CoMoly (INTEGRITY Z 5-0-0)', 'CopBorMoly (INTEGRITY Z 5-0-0)', 'CopMoly (INTEGRITY Z 5-0-0)', 'ECOVAM (ECOVAM)', 'ENHANCE FOLIAR (ENHANCE FOLIAR)', 'ETIDOT-67/SOLUBOR (ETIDOT-67)']; // limit for preview
  const yearOptions = [2022, 2023, 2024, 2025];
  const monthOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];

  const [selectedUM, setSelectedUM] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [selectedFerts, setSelectedFerts] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [selectedMonths, setSelectedMonths] = useState([]);

  return (
    <div style={{
      backgroundColor: '#FFF8DC',
      backgroundImage: `url(${treeBg})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      minHeight: '100vh',
      padding: '40px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative'
    }}>
      <button
        onClick={() => navigate('/')}
        style={{
          position: 'absolute',
          top: '20px',
          right: '20px',
          padding: '10px 20px',
          backgroundColor: '#7CB342',
          color: 'white',
          border: 'none',
          borderRadius: '25px',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
        }}
      >
        Back
      </button>

      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '20px', marginBottom: '20px' }}>
        <select value={selectedUM} onChange={e => setSelectedUM(e.target.value)}>
          <option value="">Select U/M</option>
          {umOptions.map((um, i) => <option key={i} value={um}>{um}</option>)}
        </select>

        <select value={selectedField} onChange={e => setSelectedField(e.target.value)}>
          <option value="">Select Field</option>
          {fieldOptions.map((f, i) => <option key={i} value={f}>{f}</option>)}
        </select>

        <select multiple value={selectedFerts} onChange={e => setSelectedFerts(Array.from(e.target.selectedOptions, o => o.value))}>
          {fertilizerOptions.map((f, i) => <option key={i} value={f}>{f}</option>)}
        </select>

        <select multiple value={selectedYears} onChange={e => setSelectedYears(Array.from(e.target.selectedOptions, o => parseInt(o.value)))}>
          {yearOptions.map((y, i) => <option key={i} value={y}>{y}</option>)}
        </select>

        <select multiple value={selectedMonths} onChange={e => setSelectedMonths(Array.from(e.target.selectedOptions, o => parseInt(o.value)))}>
          {monthOptions.map((m, i) => <option key={i} value={m}>{m}</option>)}
        </select>
      </div>

      <Plot
        data={[]}  // To be dynamically populated
        layout={{
          barmode: 'stack',
          width: 1000,
          height: 500,
          title: 'Fertilizer Sales Price and Quantity Trends',
          xaxis: { title: 'Year-Month', type: 'category' },
          yaxis: { title: 'Sales Price ($)', side: 'left' },
          yaxis2: {
            title: 'Qty',
            overlaying: 'y',
            side: 'right'
          },
          legend: { x: 1.05, y: 1 }
        }}
        config={{ responsive: true }}
      />
    </div>
  );
}

export default FertilizerChartPage;
