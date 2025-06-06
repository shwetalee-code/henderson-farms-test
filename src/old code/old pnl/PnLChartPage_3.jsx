import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import treeBg from './tree_bg.png';

function PnLChartPage() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [orchardCodes, setOrchardCodes] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedOrchards, setSelectedOrchards] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const [turnoutData, setTurnoutData] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Papa.parse('/pandL data.csv', {
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
        setSelectedYears(yearList);
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
      (selectedYears.length === 0 || selectedYears.includes(d['Year']))
    );
    setFiltered(f);
  }, [selectedOrchards, selectedYears, data]);

  const getTotalTurnout = (yearColumn) => {
    const valid = turnoutData.filter(row => selectedOrchards.includes(row['Orchard Code']) && !isNaN(+row[yearColumn]));
    const sum = valid.reduce((total, row) => total + +row[yearColumn], 0);
    return valid.length ? `${sum.toFixed(2)}%` : 'N/A';
  };

  const pieData = () => {
    const group = {};
    filtered.forEach(d => {
      const v = d['Variety'];
      const acres = parseFloat(d['Total_Acres_By_Variety_And_Orchard']);
      if (!isNaN(acres) && acres > 0) {
        group[v] = (group[v] || 0) + acres;
      }
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
            setSelectedOrchards(selected.includes('ALL') ? orchardCodes : (selected.length ? selected : orchardCodes));
          }} style={{ width: '250px', marginTop: '10px' }}>
            <option value="ALL">All</option>
            {orchardCodes.map(code => <option key={code} value={code}>{code}</option>)}
          </select>
        </div>

        <div style={{ textAlign: 'center' }}>
          <label style={{ fontWeight: 'bold', fontSize: '20px', color: 'black' }}>Year</label><br />
          <select multiple value={selectedYears} onChange={e => {
            const selected = Array.from(e.target.selectedOptions, option => option.value);
            setSelectedYears(selected.includes('ALL') ? years : (selected.length ? selected : years));
          }} style={{ width: '150px', marginTop: '10px' }}>
            <option value="ALL">All</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', color: 'black', fontWeight: 'bold', fontSize: '16px' }}>
          <div>2022 Turnout: {getTotalTurnout('Sum of 2022 Turn Out %')}</div>
          <div>2023 Turnout: {getTotalTurnout('Sum of 2023 Turnout')}</div>
          <div>2024 Turnout: {getTotalTurnout('Sum of 2024 Turnout %')}</div>
        </div>
      </div>

      {pieData().length > 0 ? (
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
      ) : (
        <div style={{ fontSize: '20px', fontWeight: 'bold', color: 'darkred', marginTop: '50px' }}>
          No data available for selected orchard(s) and year.
        </div>
      )}
    </div>
  );
}

export default PnLChartPage;
