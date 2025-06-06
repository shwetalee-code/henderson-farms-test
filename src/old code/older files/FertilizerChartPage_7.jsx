import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import treeBg from './tree_bg.png';
import { useNavigate } from 'react-router-dom';

function FertilizerChartPage() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ um: '', field: '', fertilizer: [], year: [], month: [] });
  const navigate = useNavigate();

  useEffect(() => {
    Papa.parse('/fertilizer_data.csv', {
      download: true,
      header: true,
      complete: (result) => {
        setData(result.data);
        setFiltered(result.data);
      }
    });
  }, []);

  useEffect(() => {
    const filteredData = data.filter(row => {
      return (!filters.um || row['U/M'] === filters.um)
        && (!filters.field || row.Field === filters.field)
        && (filters.fertilizer.length === 0 || filters.fertilizer.includes(row.Fertilizer))
        && (filters.year.length === 0 || filters.year.includes(String(row.Year)))
        && (filters.month.length === 0 || filters.month.includes(String(row.Month)));
    });
    setFiltered(filteredData);
  }, [filters, data]);

  
  const filteredByUM = data.filter(row => !filters.um || row['U/M'] === filters.um);

  const unique = (key, base = data)
 => {
    const rawValues = data.map(row => row[key]).filter(v => v !== undefined && v !== null && v !== '');
    const values = Array.from(new Set(rawValues));
    return key === 'Year' || key === 'Month'
      ? values.map(String).sort((a, b) => +a - +b)
      : values.sort((a, b) => a.localeCompare(b));
  };

  const sortedData = [...filtered].sort((a, b) => {
    const aKey = `${a.Year}-${String(a.Month).padStart(2, '0')}`;
    const bKey = `${b.Year}-${String(b.Month).padStart(2, '0')}`;
    return aKey.localeCompare(bKey);
  });

  const xLabels = sortedData.map(d => `${d.Year}-${String(d.Month).padStart(2, '0')}`);

  const sumByKey = (data, key) => data.reduce((acc, row) => acc + parseFloat(row[key] || 0), 0);

  return (
    <div style={{
      backgroundColor: '#FFF8DC',
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

      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <select value={filters.um} onChange={e => setFilters({ ...filters, um: e.target.value })}>
          <option value="">All U/M</option>
          {unique('U/M').map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        <select value={filters.field} onChange={e => setFilters({ ...filters, field: e.target.value })}>
          <option value="">All Fields</option>
          {unique('Field', filteredByUM).map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        <select multiple value={filters.fertilizer} onChange={e => {
          const selected = Array.from(e.target.selectedOptions, o => o.value);
          setFilters({ ...filters, fertilizer: selected });
        }}>
          {unique('Fertilizer', filteredByUM).map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        <select multiple value={filters.year} onChange={e => {
          const selected = Array.from(e.target.selectedOptions, o => o.value);
          setFilters({ ...filters, year: selected });
        }} style={{ width: '80px' }}>
          {unique('Year', filteredByUM).map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        <select multiple value={filters.month} onChange={e => {
          const selected = Array.from(e.target.selectedOptions, o => o.value);
          setFilters({ ...filters, month: selected });
        }} style={{ width: '80px' }}>
          {unique('Month', filteredByUM).map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      <Plot
        data={[
          {
            x: xLabels,
            y: sortedData.map(d => +d['Average of Sales Price']),
            type: 'bar',
            name: 'Sales Price',
            marker: { color: '#7E57C2' },
            yaxis: 'y1'
          },
          {
            x: xLabels,
            y: sortedData.map(d => +d['Sum of Qty']),
            type: 'scatter',
            mode: 'lines+markers',
            name: 'Quantity',
            line: { color: '#FBC02D', width: 3 },
            marker: { size: 6 },
            yaxis: 'y2'
          }
        ]}
        layout={{
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