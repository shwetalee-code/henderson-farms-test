import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import treeBg from './tree_bg.png';
import { useNavigate } from 'react-router-dom';

function FertilizerChartPage() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ type: '', year: [], month: [], field: '' });
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
      return (!filters.type || row.type === filters.type)
        && (filters.year.length === 0 || filters.year.includes(String(row.year)))
        && (filters.month.length === 0 || filters.month.includes(String(row.month)))
        && (!filters.field || row.field === filters.field);
    });
    setFiltered(filteredData);
  }, [filters, data]);

  const unique = (key) => {
    const rawValues = data.map(row => row[key]).filter(v => v !== undefined && v !== null && v !== '');
    const values = Array.from(new Set(rawValues));
    return key === 'year' || key === 'month'
      ? values.map(String).sort((a, b) => +a - +b)
      : values.sort((a, b) => a.localeCompare(b));
  };

  const sortedData = [...filtered].sort((a, b) => {
    const aKey = `${a.year}-${String(a.month).padStart(2, '0')}`;
    const bKey = `${b.year}-${String(b.month).padStart(2, '0')}`;
    return aKey.localeCompare(bKey);
  });

  const xLabels = sortedData.map(d => `${d.year}-${String(d.month).padStart(2, '0')}`);

  const handleMultiSelect = (e, key) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setFilters(prev => ({ ...prev, [key]: selected }));
  };

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
        <select value={filters.type} onChange={e => setFilters({ ...filters, type: e.target.value })}>
          <option value="">All Types</option>
          {unique('type').map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        <select multiple value={filters.year} onChange={e => handleMultiSelect(e, 'year')} style={{ width: '80px' }}>
          {unique('year').map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        <select multiple value={filters.month} onChange={e => handleMultiSelect(e, 'month')} style={{ width: '80px' }}>
          {unique('month').map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        <select value={filters.field} onChange={e => setFilters({ ...filters, field: e.target.value })}>
          <option value="">All Fields</option>
          {unique('field').map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      <Plot
        data={[
          {
            x: xLabels,
            y: sortedData.map(d => +d.value),
            type: 'bar',
            name: 'Fertilizer Used',
            marker: { color: '#8BC34A' },
            text: sortedData.map(d => (+d.value).toFixed(2)),
            textposition: 'outside',
            textfont: { size: 12, color: 'black' }
          }
        ]}
        layout={{
          width: 1000,
          height: 500,
          barmode: 'group',
          title: 'Fertilizer Application Overview',
          xaxis: { title: 'Year-Month', type: 'category' },
          yaxis: { autorange: true },
          legend: { x: 1.05, y: 1 }
        }}
        config={{ responsive: true }}
      />
    </div>
  );
}

export default FertilizerChartPage;