import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import treeBg from './tree_bg.png';
import { useNavigate } from 'react-router-dom';

function ChartPage() {
  const [data, setData] = useState([]);
  const [thresholds, setThresholds] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ element: '', year: [], month: [], field: '' });
  const [hiddenTraces, setHiddenTraces] = useState({});
  const navigate = useNavigate();

  useEffect(() => {
    Papa.parse(`${process.env.PUBLIC_URL}/chart_data.csv`, {
      download: true,
      header: true,
      complete: (result) => {
        const cleanedData = result.data.filter(d =>
          d.element && d.field && d.year && d.month &&
          d.value !== undefined && d.normalizedValue !== undefined &&
          !isNaN(+d.value) && !isNaN(+d.normalizedValue)
        );
        setData(cleanedData);
        setFiltered(cleanedData);
      }
    });

    Papa.parse(`${process.env.PUBLIC_URL}/thresholds.csv`, {
      download: true,
      header: true,
      complete: (result) => {
        setThresholds(result.data);
      }
    });
  }, []);

  useEffect(() => {
    const filteredData = data.filter(row => {
      return (!filters.element || row.element === filters.element)
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
  const currentThreshold = thresholds.find(t => t['Element_Full'] === filters.element);

  const high = currentThreshold && !isNaN(+currentThreshold['High Threshold Value'])
    ? +currentThreshold['High Threshold Value']
    : null;

  const low = currentThreshold && !isNaN(+currentThreshold['Low Threshold Value'])
    ? +currentThreshold['Low Threshold Value']
    : null;

  const shapes = [];
  const showThresholds = !hiddenTraces['Original Value'];
  if (showThresholds && high != null) {
    shapes.push({
      type: 'line',
      xref: 'paper',
      x0: 0,
      x1: 1,
      y0: high,
      y1: high,
      line: { color: 'hotpink', width: 2 }
    });
  }
  if (showThresholds && low != null) {
    shapes.push({
      type: 'line',
      xref: 'paper',
      x0: 0,
      x1: 1,
      y0: low,
      y1: low,
      line: { color: 'forestgreen', width: 2 }
    });
  }

  const handleMultiSelect = (e, key) => {
    const options = Array.from(e.target.options);
    let selected;
    if (e.target.value === '') {
      selected = options.filter(opt => opt.value !== '').map(opt => opt.value);
    } else {
      selected = Array.from(e.target.selectedOptions, option => option.value);
    }
    setFilters(prev => ({ ...prev, [key]: selected }));
  };

  const handleLegendClick = (e) => {
    const name = e.data[e.curveNumber].name;
    const isCurrentlyHidden = hiddenTraces[name];
    const newHiddenState = { ...hiddenTraces, [name]: !isCurrentlyHidden };
    setHiddenTraces(newHiddenState);
    return false;
  };

  return (
    <div style={{
      backgroundColor: '#ADEBB3',
      backgroundImage: `url(${treeBg})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      padding: '20px 40px 40px 40px',
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

      <h2 style={{ color: 'black', fontWeight: 'bold', marginBottom: '20px', fontSize: '20px', textAlign: 'center' }}>
        Leaf Nutrient
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{
          display: 'flex',
          gap: '20px',
          flexWrap: 'wrap',
          justifyContent: 'center'
        }}>
          {['element', 'field', 'year', 'month'].map((key) => (
            <div key={key} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <label style={{ fontWeight: 'bold', marginBottom: '4px', color: 'black' }}>
                {key.charAt(0).toUpperCase() + key.slice(1)}
              </label>
              {key === 'year' || key === 'month' ? (
                <select multiple value={filters[key]} onChange={e => handleMultiSelect(e, key)} style={{ width: '150px' }}>
                  <option value="">All </option>
                  {unique(key).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              ) : (
                <select value={filters[key]} onChange={e => setFilters({ ...filters, [key]: e.target.value })} style={{ width: '200px' }}>
                  <option value="">All {key}</option>
                  {unique(key).map(v => <option key={v} value={v}>{v}</option>)}
                </select>
              )}
            </div>
          ))}
        </div>
      </div>

      <Plot
        data={[
          {
            x: xLabels,
            y: sortedData.map(d => +d.value),
            type: 'bar',
            name: 'Original Value',
            visible: hiddenTraces['Original Value'] ? 'legendonly' : true,
            marker: { color: '#86CFFF' },
            text: sortedData.map(d => (+d.value).toFixed(3)),
            textposition: 'outside',
            textfont: { size: 12, color: 'black' },
            hovertemplate: '%{x}:<br> %{y:.3f}<extra></extra>'
          },
          {
            x: xLabels,
            y: sortedData.map(d => +d.normalizedValue),
            type: 'bar',
            name: 'Per Acre Value',
            visible: hiddenTraces['Per Acre Value'] ? 'legendonly' : true,
            marker: { color: '#CAC691' },
            text: sortedData.map(d => (+d.normalizedValue).toFixed(3)),
            textposition: 'outside',
            textfont: { size: 12, color: 'black' },
            hovertemplate: '%{x}<br>Per Acre Value: %{y:.3f}<extra></extra>'
          }
        ]}
        layout={{
          width: 1300,
          height: 650,
          barmode: 'group',
          title: 'Leaf Nutrient',
          xaxis: { title: 'Year-Month', type: 'category' },
          yaxis: { autorange: true },
          legend: { x: 1.1, y: 1 },
          shapes,
          annotations: [
            high != null && !hiddenTraces['Original Value'] ? {
              xref: 'paper',
              yref: 'y',
              x: 1,
              y: high,
              text: String(high),
              showarrow: false,
              font: { color: 'hotpink', size: 12 },
              yshift: -20,
              xanchor: 'left',
              align: 'right'
            } : null,
            low != null && !hiddenTraces['Original Value'] ? {
              xref: 'paper',
              yref: 'y',
              x: 1,
              y: low,
              text: String(low),
              showarrow: false,
              font: { color: 'forestgreen', size: 12 },
              yshift: -20,
              xanchor: 'left',
              align: 'right'
            } : null
          ].filter(Boolean)
        }}
        config={{ responsive: true }}
        onLegendClick={handleLegendClick}
      />
    </div>
  );
}

export default ChartPage;