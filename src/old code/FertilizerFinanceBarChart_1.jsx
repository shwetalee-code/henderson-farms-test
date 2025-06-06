import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import treeBg from './tree_bg.png';

function FertilizerFinanceBarChart() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({
    Item: [],
    Year: [],
    Name: []
  });
  const [selected, setSelected] = useState({
    Item: [],
    Year: [],
    Name: []
  });

  const navigate = useNavigate();

  useEffect(() => {
    Papa.parse('/finance fertilizer data.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const parsed = results.data.filter(d => d['Item'] && d['Merged Quantity'] && d['Name'] && d['Amount'] && d['Date']);
        const withYear = parsed.map(d => ({
          ...d,
          Year: new Date(d['Date']).getFullYear().toString(),
          Item: d['Item'].split('(')[0].trim()
        }));
        setData(withYear);
        setFiltered(withYear);
        const items = [...new Set(withYear.map(d => d['Item']))].sort();
        const years = [...new Set(withYear.map(d => d['Year']))].sort();
        const names = [...new Set(withYear.map(d => d['Name']))].sort();
        setFilters({ Item: items, Year: years, Name: names });
        setSelected({ Item: items, Year: years, Name: names });
      }
    });
  }, []);

  useEffect(() => {
    const f = data.filter(d =>
      selected.Item.includes(d['Item']) &&
      selected.Year.includes(d['Year']) &&
      selected.Name.includes(d['Name'])
    );
    setFiltered(f);
  }, [selected, data]);

  const handleSelect = (key, list) => (e) => {
    const selectedValues = Array.from(e.target.selectedOptions, opt => opt.value);
    setSelected(prev => ({
      ...prev,
      [key]: selectedValues.includes('ALL') ? list : selectedValues.length ? selectedValues : list
    }));
  };

  const xLabels = filtered.map(d => `${d['Name']} | ${d['Merged Quantity']}`);
  const grouped = {};
  filtered.forEach(d => {
    const x = `${d['Name']} | ${d['Merged Quantity']}`;
    if (!grouped[d['Item']]) grouped[d['Item']] = {};
    grouped[d['Item']][x] = (grouped[d['Item']][x] || 0) + parseFloat(d['Amount']) || 0;
  });

  const traces = Object.keys(grouped).map(item => ({
    x: xLabels,
    y: xLabels.map(x => grouped[item]?.[x] || 0),
    type: 'bar',
    name: item,
    text: xLabels.map(x => grouped[item]?.[x] ? grouped[item][x].toFixed(0) : ''),
    textposition: 'auto'
  }));

  return (
    <div style={{
      backgroundColor: '#F0F4E3',
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

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
        {Object.entries(filters).map(([key, list]) => (
          <div key={key}>
            <label style={{ fontWeight: 'bold' }}>{key}</label><br />
            <select multiple value={selected[key]} onChange={handleSelect(key, list)} style={{ width: '200px' }}>
              <option value="ALL">All</option>
              {list.map(val => <option key={val} value={val}>{val}</option>)}
            </select>
          </div>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ color: 'darkred', fontWeight: 'bold', marginTop: '40px' }}>
          No data available for selected filters.
        </div>
      ) : (
        <Plot
          data={traces}
          layout={{
            title: 'Sum of Amount by Merged Quantity, Name and Item',
            xaxis: { title: 'Name | Merged Quantity', tickangle: 45 },
            yaxis: { title: 'Sum of Amount' },
            legend: { orientation: 'h', y: -0.3 },
            barmode: 'group',
            bargap: 0.3,
            bargroupgap: 0.1,
            width: 1300,
            height: 600
          }}
          config={{ responsive: true }}
        />
      )}
    </div>
  );
}

export default FertilizerFinanceBarChart;
