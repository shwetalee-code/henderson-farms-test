import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import treeBg from './tree_bg.png';
import { useNavigate } from 'react-router-dom';

function SoilChartPage() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [filters, setFilters] = useState({ element: '', sampleDate: [], field: '' });
  const [hiddenTraces, setHiddenTraces] = useState({});
  const navigate = useNavigate();

  const elementFullNames = {
    'Al': 'AL–ALUMINUM', 'B': 'B–BORON', 'Ca': 'CA–CALCIUM', 'Cl': 'CL–CHLORIDE',
    'Co': 'CO–COBALT', 'Cu': 'CU–COPPER', 'Fe': 'FE–IRON', 'I': 'I–IODINE',
    'K': 'K–POTASSIUM', 'Mg': 'MG–MAGNESIUM', 'Mn': 'MN–MANGANESE',
    'Mo': 'MO–MOLYBDENUM', 'Na': 'NA–SODIUM', 'NH4': 'NH4–AMMONIUM',
    'NO3': 'NO3–NITRATE', 'P': 'P–PHOSPHOROUS', 'PH': 'PH', 'S': 'S–SULFUR',
    'Se': 'SE–SELENIUM', 'Si': 'SI–SILICON', 'Zn': 'ZN–ZINC'
  };

  useEffect(() => {
    Papa.parse(`${process.env.PUBLIC_URL}/soil_data.csv`, {
      download: true,
      header: true,
      dynamicTyping: true,
      complete: (result) => {
        const rows = result.data.filter(d => d.Element && d.Field && d.Year && d.Month && d.Day && d.Value !== undefined);
        const withDate = rows.map(d => ({ ...d, sampleDate: `${d.Year}-${d.Month}-${d.Day}` }));
        setData(withDate);
        setFiltered(withDate);
      }
    });
  }, []);

  useEffect(() => {
    const filteredData = data.filter(row => {
      return (!filters.element || row.Element === filters.element)
        && (!filters.field || row.Field === filters.field)
        && (filters.sampleDate.length === 0 || filters.sampleDate.includes(row.sampleDate));
    });
    setFiltered(filteredData);
  }, [filters, data]);

  const unique = (key) => Array.from(new Set(data.map(row => row[key]).filter(Boolean))).sort((a, b) => a.localeCompare(b));

  const handleMultiSelect = (e, key) => {
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setFilters(prev => ({ ...prev, [key]: selected.includes('') ? unique(key) : selected }));
  };

  const handleLegendClick = (e) => {
    const name = e.data[e.curveNumber].name;
    const newHiddenState = { ...hiddenTraces, [name]: !hiddenTraces[name] };
    setHiddenTraces(newHiddenState);
    return false;
  };

  const groupedByDate = {};
  filtered.forEach(d => {
    const key = `${d.Element}||${d.Field}||${d.sampleDate}`;
    if (!groupedByDate[key]) {
      groupedByDate[key] = { count: 0, sumValue: 0, sumPerAcre: 0, ...d };
    }
    groupedByDate[key].count += 1;
    groupedByDate[key].sumValue += +d.Value;
    groupedByDate[key].sumPerAcre += +d.ValuePerAcre;
  });

  const averagedData = Object.values(groupedByDate).map(d => ({
    ...d,
    Value: d.sumValue / d.count,
    ValuePerAcre: d.sumPerAcre / d.count
  }));

  const sortedData = averagedData.sort((a, b) => a.sampleDate.localeCompare(b.sampleDate));
  const xLabels = sortedData.map(d => d.sampleDate);

  const showThresholds = !hiddenTraces['Original Value'];
  const shapes = [];
  const annotations = [];
  if (showThresholds && sortedData.length > 0) {
    const high = +sortedData[0]['Average of High'];
    const low = +sortedData[0]['Average of Low'];
    shapes.push({ type: 'line', xref: 'paper', x0: 0, x1: 1, y0: high, y1: high, line: { color: 'hotpink', width: 2 } });
    shapes.push({ type: 'line', xref: 'paper', x0: 0, x1: 1, y0: low, y1: low, line: { color: 'forestgreen', width: 2 } });
    annotations.push({ xref: 'paper', yref: 'y', x: 1, y: high, text: String(high), showarrow: false, font: { color: 'hotpink', size: 12 }, yshift: -20, xanchor: 'left', align: 'right' });
    annotations.push({ xref: 'paper', yref: 'y', x: 1, y: low, text: String(low), showarrow: false, font: { color: 'forestgreen', size: 12 }, yshift: -20, xanchor: 'left', align: 'right' });
  }

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
      <button onClick={() => navigate('/')} style={{ position: 'absolute', top: '20px', right: '20px', padding: '10px 20px', backgroundColor: '#7CB342', color: 'white', border: 'none', borderRadius: '25px', fontWeight: 'bold', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.3)' }}>Back</button>

      <h2 style={{ color: 'black', fontWeight: 'bold', marginBottom: '10px', fontSize: '20px', textAlign: 'center' }}>Soil Nutrient</h2>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '20px' }}>
        <div style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold', marginBottom: '4px', color: 'black' }}>Element</label>
            <select value={filters.element} onChange={e => setFilters({ ...filters, element: e.target.value })} style={{ width: '200px' }}>
              <option value="">All element</option>
              {unique('Element').map(v => <option key={v} value={v}>{elementFullNames[v] || v}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold', marginBottom: '4px', color: 'black' }}>Field</label>
            <select value={filters.field} onChange={e => setFilters({ ...filters, field: e.target.value })} style={{ width: '200px' }}>
              <option value="">All field</option>
              {unique('Field').map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <label style={{ fontWeight: 'bold', marginBottom: '4px', color: 'black' }}>Date</label>
            <select multiple value={filters.sampleDate} onChange={e => handleMultiSelect(e, 'sampleDate')} style={{ width: '150px' }}>
              <option value="">All</option>
              {unique('sampleDate').map(v => <option key={v} value={v}>{v}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <button onClick={() => navigate('/soil-detailed')} style={{ padding: '10px 30px', fontSize: '1rem', fontWeight: 'bold', backgroundColor: '#43A047', color: 'white', border: 'none', borderRadius: '20px', cursor: 'pointer', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }}>Detailed View</button>
      </div>

      <Plot
        data={[
          {
            x: xLabels,
            y: sortedData.map(d => +d.Value),
            type: 'bar',
            name: 'Original Value',
            visible: hiddenTraces['Original Value'] ? 'legendonly' : true,
            marker: { color: '#86CFFF' },
            text: sortedData.map(d => (+d.Value).toFixed(3)),
            textposition: 'outside',
            textfont: { size: 12, color: 'black' },
            hovertemplate: '%{x}:<br> %{y:.3f}<extra></extra>'
          },
          {
            x: xLabels,
            y: sortedData.map(d => +d.ValuePerAcre),
            type: 'bar',
            name: 'Per Acre Value',
            visible: hiddenTraces['Per Acre Value'] ? 'legendonly' : true,
            marker: { color: '#CAC691' },
            text: sortedData.map(d => (+d.ValuePerAcre).toFixed(3)),
            textposition: 'outside',
            textfont: { size: 12, color: 'black' },
            hovertemplate: '%{x}<br>Per Acre Value: %{y:.3f}<extra></extra>'
          }
        ]}
        layout={{
          width: 1300,
          height: 650,
          barmode: 'group',
          title: 'Soil Nutrient',
          xaxis: { title: 'Date', type: 'category' },
          yaxis: { autorange: true },
          legend: { x: 1.1, y: 1 },
          shapes,
          annotations
        }}
        config={{ responsive: true }}
        onLegendClick={handleLegendClick}
      />
    </div>
  );
}

export default SoilChartPage;
