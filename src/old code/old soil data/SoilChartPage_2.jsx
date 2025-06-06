import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import { useNavigate } from 'react-router-dom';
import treeBg from './tree_bg.png';
import Papa from 'papaparse';

function SoilChartPage() {
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [selectedElement, setSelectedElement] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [selectedDates, setSelectedDates] = useState([]);

  useEffect(() => {
    Papa.parse('/soil_data.csv', {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (results) => {
        const cleaned = results.data.filter(d => d.Element && d.Field && d['Sample Date']);
        setData(cleaned);
      }
    });
  }, []);

  const unique = (key) => [...new Set(data.map(row => row[key]).filter(v => v !== undefined && v !== null && v !== ''))];

  const filtered = data.filter(row =>
    (!selectedElement || row["Element"] === selectedElement) &&
    (!selectedField || row["Field"] === selectedField) &&
    (selectedDates.length === 0 || selectedDates.includes(row["Sample Date"]))
  );

  const x = filtered.map(d => d["Sample Date"]);
  const y = filtered.map(d => d.Value);
  const high = filtered.map(d => d["Average of High"]);
  const low = filtered.map(d => d["Average of Low"]);

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
        <select value={selectedElement} onChange={e => setSelectedElement(e.target.value)}>
          <option value="">Select Element</option>
          {unique("Element").map((d, i) => <option key={i} value={d}>{d}</option>)}
        </select>

        <select value={selectedField} onChange={e => setSelectedField(e.target.value)}>
          <option value="">Select Field</option>
          {unique("Field").map((d, i) => <option key={i} value={d}>{d}</option>)}
        </select>

        <select multiple value={selectedDates} onChange={e => setSelectedDates(Array.from(e.target.selectedOptions, o => o.value))}>
          {unique("Sample Date").map((d, i) => <option key={i} value={d}>{d}</option>)}
        </select>
      </div>

      <Plot
        data={[
          {
            x,
            y,
            type: 'bar',
            name: 'Value',
            marker: { color: '#86CFFF' }
          },
          {
            x,
            y: high,
            type: 'scatter',
            mode: 'lines',
            name: 'High Threshold',
            line: { color: 'hotpink' }
          },
          {
            x,
            y: low,
            type: 'scatter',
            mode: 'lines',
            name: 'Low Threshold',
            line: { color: 'forestgreen' }
          }
        ]}
        layout={{
          width: 1000,
          height: 500,
          title: 'Soil Nutrient Level Trends',
          xaxis: { title: 'Sample Date', type: 'category' },
          yaxis: { title: 'Value' },
          legend: { x: 1.05, y: 1 }
        }}
        config={{ responsive: true }}
      />
    </div>
  );
}

export default SoilChartPage;