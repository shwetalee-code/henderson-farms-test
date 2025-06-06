import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import treeBg from './tree_bg.png';

function FertilizerChartPage() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({
    um: [],
    field: [],
    fertilizer: [],
    year: [],
    quarter: [],
  });

  const [selectedFilters, setSelectedFilters] = useState({
    um: [],
    field: [],
    fertilizer: [],
    year: [],
    quarter: [],
  });

  const navigate = useNavigate();

  useEffect(() => {
    Papa.parse('/finance fertilizer data.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const parsed = results.data.filter(r => r['Date'] && !isNaN(new Date(r['Date'])));
        parsed.forEach(d => {
          const date = new Date(d['Date']);
          const y = date.getFullYear();
          const m = String(date.getMonth() + 1).padStart(2, '0');
          d['YearMonth'] = `${y}-${m}`;
          d['Year'] = y.toString();
          d['Quarter'] = Math.ceil((date.getMonth() + 1) / 3).toString();
        });

        setData(parsed);

        const unique = (key) => [...new Set(parsed.map(d => d[key]).filter(Boolean))].sort();
        setFilters({
          um: unique('U/M'),
          field: unique('Field'),
          fertilizer: unique('Item'),
          year: unique('Year'),
          quarter: unique('Quarter'),
        });
        setSelectedFilters({
          um: unique('U/M'),
          field: unique('Field'),
          fertilizer: unique('Item'),
          year: unique('Year'),
          quarter: unique('Quarter'),
        });
        setFiltered(parsed);
      }
    });
  }, []);

  useEffect(() => {
    const f = data.filter(d =>
      selectedFilters.um.includes(d['U/M']) &&
      selectedFilters.field.includes(d['Field']) &&
      selectedFilters.fertilizer.includes(d['Item']) &&
      selectedFilters.year.includes(d['Year']) &&
      selectedFilters.quarter.includes(d['Quarter'])
    );
    setFiltered(f);
  }, [selectedFilters, data]);

  const handleSelect = (key, fullList) => (e) => {
    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
    setSelectedFilters(prev => ({
      ...prev,
      [key]: selected.includes('ALL') ? fullList : (selected.length ? selected : fullList)
    }));
  };

  const grouped = {};
  filtered.forEach(d => {
    const ym = d['YearMonth'];
    if (!grouped[ym]) grouped[ym] = { qty: 0, price: 0, count: 0 };
    grouped[ym].qty += parseFloat(d['Quantity']) || 0;
    grouped[ym].price += parseFloat(d['Sales Price']) || 0;
    grouped[ym].count += 1;
  });

  const yearMonths = Object.keys(grouped).sort();
  const quantities = yearMonths.map(k => grouped[k].qty);
  const avgPrices = yearMonths.map(k => grouped[k].count ? grouped[k].price / grouped[k].count : 0);

  return (
    <div style={{
      backgroundColor: '#E0F2F1',
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
        padding: '10px 20px', backgroundColor: '#00796B', color: 'white',
        border: 'none', borderRadius: '25px', fontWeight: 'bold',
        cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)'
      }}>Back</button>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '30px' }}>
        {Object.entries(filters).map(([key, list]) => (
          <div key={key}>
            <label style={{ fontWeight: 'bold' }}>{`Select ${key.toUpperCase()}`}</label><br />
            <select multiple value={selectedFilters[key]} onChange={handleSelect(key, list)} style={{ width: '200px' }}>
              <option value="ALL">All</option>
              {list.map(val => <option key={val} value={val}>{val}</option>)}
            </select>
          </div>
        ))}
      </div>

      {yearMonths.length === 0 ? (
        <div style={{ fontSize: '18px', fontWeight: 'bold', color: 'darkred', marginTop: '50px' }}>
          No data available for selected filters.
        </div>
      ) : (
        <Plot
          data={[
            {
              x: yearMonths,
              y: avgPrices,
              type: 'bar',
              name: 'Sales Price',
              yaxis: 'y1',
              marker: { color: '#7E57C2' }
            },
            {
              x: yearMonths,
              y: quantities,
              type: 'scatter',
              name: 'Quantity',
              yaxis: 'y2',
              mode: 'lines+markers',
              line: { color: '#FDD835' }
            }
          ]}
          layout={{
            title: 'Fertilizer Sales Price and Quantity Trends',
            xaxis: { title: 'Year-Month', tickangle: -45 },
            yaxis: { title: 'Sales Price ($)', side: 'left' },
            yaxis2: {
              title: 'Qty',
              overlaying: 'y',
              side: 'right'
            },
            legend: { orientation: 'h', y: -0.2 },
            width: 1300,
            height: 600
          }}
          config={{ responsive: true }}
        />
      )}
    </div>
  );
}

export default FertilizerChartPage;
