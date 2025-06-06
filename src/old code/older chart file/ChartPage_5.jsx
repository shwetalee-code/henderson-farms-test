import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import treeBg from './tree_bg.png'; // small decorative tree image

function ChartPage() {
  const [data, setData] = useState([]);
  const [thresholds, setThresholds] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ element: '', year: [], month: [], field: '' });
  const [hiddenTraces, setHiddenTraces] = useState({});

  useEffect(() => {
    Papa.parse('/chart_data.csv', {
      download: true,
      header: true,
      complete: (result) => {
        setData(result.data);
        setFiltered(result.data);
      }
    });

    Papa.parse('/thresholds.csv', {
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
    const values = [...new Set(data.map(row => row[key]).filter(v => v !== undefined && v !== null && v !== ''))];
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
  const high = currentThreshold ? +currentThreshold['High Threshold Value'] : null;
  const low = currentThreshold ? +currentThreshold['Low Threshold Value'] : null;

  const shapes = [];
  const showThresholds = !hiddenTraces['Value'];
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
    const selected = Array.from(e.target.selectedOptions, option => option.value);
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
      backgroundColor: '#f5f5f5',
      backgroundImage: `url(${treeBg})`,
      backgroundRepeat: 'no-repeat',
      backgroundPosition: 'center',
      backgroundSize: 'cover',
      backgroundSize: '100px',
      padding: '40px',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center'
    }}>
      <div style={{
        display: 'flex',
        gap: '10px',
        marginBottom: '20px',
        flexWrap: 'wrap',
        justifyContent: 'center'
      }}>
        <select value={filters.element} onChange={e => setFilters({ ...filters, element: e.target.value })}>
          <option value="">All element</option>
          {unique('element').map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        <select multiple value={filters.year} onChange={e => handleMultiSelect(e, 'year')} style={{ width: '80px' }}>
          {unique('year').map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        <select multiple value={filters.month} onChange={e => handleMultiSelect(e, 'month')} style={{ width: '80px' }}>
          {unique('month').map(v => <option key={v} value={v}>{v}</option>)}
        </select>

        <select value={filters.field} onChange={e => setFilters({ ...filters, field: e.target.value })}>
          <option value="">All field</option>
          {unique('field').map(v => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>

      <Plot
        data={[
          {
            x: xLabels,
            y: sortedData.map(d => +d.value),
            type: 'bar',
            name: 'Value',
            visible: hiddenTraces['Value'] ? 'legendonly' : true,
            marker: { color: '#86CFFF' },
            text: sortedData.map(d => (+d.value).toFixed(3)),
            textposition: 'outside',
            textfont: { size: 12, color: 'black' }
          },
          {
            x: xLabels,
            y: sortedData.map(d => +d.normalizedValue),
            type: 'bar',
            name: 'Normalized Value',
            visible: hiddenTraces['Normalized Value'] ? 'legendonly' : true,
            marker: { color: '#CAC691' },
            text: sortedData.map(d => (+d.normalizedValue).toFixed(3)),
            textposition: 'outside',
            textfont: { size: 12, color: 'black' }
          }
        ]}
        layout={{
          width: 1000,
          height: 500,
          barmode: 'group',
          title: 'Original Nutrient Value vs Normalized Nutrient Value',
          xaxis: { title: 'Year-Month', type: 'category' },
          yaxis: { autorange: true },
          legend: { x: 1.1, y: 1 },
          shapes,
          annotations: [
            high != null && !hiddenTraces['Value'] ? {
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
            low != null && !hiddenTraces['Value'] ? {
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