import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import treeBg from './tree_bg.png';

function CropYieldChartPage() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [orchardCodes, setOrchardCodes] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedOrchards, setSelectedOrchards] = useState([]);
  const [selectedYear, setSelectedYear] = useState('All');
  const [turnoutData, setTurnoutData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Papa.parse('/crop yield data pie.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const parsed = results.data.filter(row => row['Orchard Code'] && row['Variety'] && row['Year']);
        setData(parsed);
        setFiltered(parsed);
        const orchards = [...new Set(parsed.map(d => d['Orchard Code']))].sort();
        const yearList = [...new Set(parsed.map(d => d['Year']))].sort();
        setOrchardCodes(orchards);
        setYears(yearList);
        setSelectedOrchards(orchards);
      }
    });

    Papa.parse('/crop yield turnout.csv', {
      download: true,
      header: true,
      complete: (results) => {
        setTurnoutData(results.data);
      }
    });
  }, []);

  useEffect(() => {
    const f = data.filter(d =>
      selectedOrchards.includes(d['Orchard Code']) &&
      (selectedYear === 'All' || d['Year'] === selectedYear)
    );
    setFiltered(f);
  }, [selectedOrchards, selectedYear, data]);

  const getTotalTurnout = (yearColumn) => {
    const valid = turnoutData.filter(row => selectedOrchards.includes(row['Orchard Code']) && !isNaN(+row[yearColumn]));
    const sum = valid.reduce((total, row) => total + +row[yearColumn], 0);
    return valid.length ? `${sum.toFixed(2)}%` : 'N/A';
  };

  const pieData = () => {
    const group = {};
    filtered.forEach(d => {
      const v = d['Variety'];
      group[v] = (group[v] || 0) + (+d['Total_Acres_By_Variety_And_Orchard'] || 0);
    });
    return Object.entries(group).map(([variety, value]) => ({ variety, value }));
  };

  return (
    <div style={{
      backgroundColor: '#ADEBB3',
      backgroundImage: `url(${treeBg})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      padding: '40px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      position: 'relative'
    }}>
      <button onClick={() => navigate('/')} style={{
        position: 'absolute', top: '20px', right: '20px',
        padding: '10px 20px', backgroundColor: '#7CB342', color: 'white',
        border: 'none', borderRadius: '25px', fontWeight: 'bold',
        cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
      }}>Back</button>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '30px', marginBottom: '20px' }}>
        <div style={{ textAlign: 'center' }}>
          <label style={{ fontWeight: 'bold', fontSize: '20px', color: 'black' }}>Orchard Code</label><br />
          <select multiple value={selectedOrchards} onChange={e => {
            const selected = Array.from(e.target.selectedOptions, option => option.value);
            setSelectedOrchards(selected.length ? selected : orchardCodes);
          }} style={{ width: '250px', marginTop: '10px' }}>
            {orchardCodes.map(code => <option key={code} value={code}>{code}</option>)}
          </select>
        </div>

        <div style={{ textAlign: 'center' }}>
          <label style={{ fontWeight: 'bold', fontSize: '20px', color: 'black' }}>Year</label><br />
          <select value={selectedYear} onChange={e => setSelectedYear(e.target.value)} style={{ width: '150px', marginTop: '10px' }}>
            <option value="All">All</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'black', fontWeight: 'bold', fontSize: '16px' }}>
          <div>2022 Turnout: {getTotalTurnout('Sum of 2022 Turn Out %')}</div>
          <div>2023 Turnout: {getTotalTurnout('Sum of 2023 Turnout')}</div>
          <div>2024 Turnout: {getTotalTurnout('Sum of 2024 Turnout %')}</div>
        </div>
      </div>

      <Plot
        data={[{
          labels: pieData().map(d => d.variety),
          values: pieData().map(d => d.value),
          type: 'pie',
          textinfo: 'label+percent+value',
          hoverinfo: 'label+percent+value',
        }]}
        layout={{
          width: 1000,
          height: 600,
          title: 'Comparison of Variety by Total Acres',
        }}
        config={{ responsive: true }}
      />
    </div>
  );
}

export default CropYieldChartPage;
