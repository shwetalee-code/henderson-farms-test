import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import treeBg from './tree_bg.png';

function FinanceChartPage() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [items, setItems] = useState([]);
  const [names, setNames] = useState([]);
  const [years, setYears] = useState([]);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedNames, setSelectedNames] = useState([]);
  const [selectedYears, setSelectedYears] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Papa.parse('/finance fertilizer data.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const cleaned = results.data.filter(d => d['Name'] && d['Item'] && d['Merged Quantity'] && d['Amount'] && d['Date']);
        const withYear = cleaned.map(d => {
          const trimmedItem = d['Item'].split('(')[0].trim();
          return { ...d, Item: trimmedItem, Year: new Date(d['Date']).getFullYear().toString() };
        });
        setData(withYear);
        setFiltered(withYear);
        const itemList = [...new Set(withYear.map(d => d['Item']))].sort();
        const nameList = [...new Set(withYear.map(d => d['Name']))].sort();
        const yearList = [...new Set(withYear.map(d => d['Year']))].sort();
        setItems(itemList);
        setNames(nameList);
        setYears(yearList);
        setSelectedItems(itemList);
        setSelectedNames(nameList);
        setSelectedYears(yearList);
      }
    });
  }, []);

  useEffect(() => {
    const f = data.filter(d =>
      selectedItems.includes(d['Item']) &&
      selectedNames.includes(d['Name']) &&
      selectedYears.includes(d['Year'])
    );
    setFiltered(f);
  }, [selectedItems, selectedNames, selectedYears, data]);

  const handleMultiSelect = (e, setter, fullList) => {
    const selected = Array.from(e.target.selectedOptions, opt => opt.value);
    if (selected.includes('ALL')) {
      setter(fullList);
    } else {
      setter(selected.length ? selected : fullList);
    }
  };

  const grouped = {};
  filtered.forEach(d => {
    const key = `${d['Name']} | ${d['Merged Quantity']}`;
    if (!grouped[key]) grouped[key] = {};
    grouped[key][d['Item']] = (grouped[key][d['Item']] || 0) + parseFloat(d['Amount'] || 0);
  });

  const x = Object.keys(grouped);
  const traces = selectedItems.map(item => ({
    x,
    y: x.map(k => grouped[k]?.[item] || 0),
    type: 'bar',
    name: item,
    text: x.map(k => grouped[k]?.[item] ? grouped[k][item].toFixed(0) : ''),
    textposition: 'outside',
    hoverinfo: 'x+y+name'
  }));

  return (
    <div style={{
      backgroundColor: '#EAF2E3',
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

      <div style={{ display: 'flex', gap: '20px', marginBottom: '60px', color: 'black' }}>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold' }}>Item</label>
          <select multiple value={selectedItems} onChange={e => handleMultiSelect(e, setSelectedItems, items)} style={{ width: '200px' }}>
            <option value="ALL">All</option>
            {items.map(item => <option key={item} value={item}>{item}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold' }}>Year</label>
          <select multiple value={selectedYears} onChange={e => handleMultiSelect(e, setSelectedYears, years)} style={{ width: '120px' }}>
            <option value="ALL">All</option>
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <label style={{ fontWeight: 'bold' }}>Name</label>
          <select multiple value={selectedNames} onChange={e => handleMultiSelect(e, setSelectedNames, names)} style={{ width: '200px' }}>
            <option value="ALL">All</option>
            {names.map(name => <option key={name} value={name}>{name}</option>)}
          </select>
        </div>
      </div>

      <div style={{ color: 'black', fontWeight: 'bold', marginBottom: '10px' }}>Legend: Item</div>

      <Plot
        data={traces}
        layout={{
          width: 1400,
          height: 600,
          barmode: 'group',
          title: 'Sum of Amount by Merged Quantity, Name and Item',
          titlefont: { color: 'black' },
          xaxis: { title: { text: 'Name | Merged Quantity', standoff: 70 }, tickangle: -45 },
          yaxis: { title: 'Sum of Amount' },
          legend: { orientation: 'h', y: 1.15 }
        }}
        config={{ responsive: true }}
      />
    </div>
  );
}

export default FinanceChartPage;
