
import React, { useState, useEffect } from 'react';
import Plot from 'react-plotly.js';
import Papa from 'papaparse';
import { useNavigate } from 'react-router-dom';
import treeBg from './tree_bg.png';

function CropYieldChartPage() {
  const [data, setData] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [orchardCodes, setOrchardCodes] = useState([]);
  const [selectedOrchards, setSelectedOrchards] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    Papa.parse('/crop yield data.csv', {
      download: true,
      header: true,
      complete: (results) => {
        const parsed = results.data.filter(row => row['Orchard Code'] && row['Variety']);
        setData(parsed);
        setFiltered(parsed);
        const uniqueOrchards = [...new Set(parsed.map(d => d['Orchard Code']))].sort();
        setOrchardCodes(uniqueOrchards);
        setSelectedOrchards(uniqueOrchards);
      }
    });
  }, []);

  useEffect(() => {
    const f = data.filter(d => selectedOrchards.includes(d['Orchard Code']));
    setFiltered(f);
  }, [selectedOrchards, data]);

  const handleDropdownChange = (e) => {
    const options = Array.from(e.target.options);
    const selected = Array.from(e.target.selectedOptions, option => option.value);
    setSelectedOrchards(selected.length ? selected : orchardCodes);
  };

  const grouped = {};
  filtered.forEach(d => {
    const variety = d['Variety'];
    if (!grouped[variety]) grouped[variety] = { '2022': null, '2023': null, '2024': null };
    if (!isNaN(+d['Sum of 2022 USDA Mt Lbs'])) grouped[variety]['2022'] = (+d['Sum of 2022 USDA Mt Lbs']);
    if (!isNaN(+d['Sum of 2023 USDA Mt Lbs'])) grouped[variety]['2023'] = (+d['Sum of 2023 USDA Mt Lbs']);
    if (!isNaN(+d['Sum of 2024 USDA Mt Lbs'])) grouped[variety]['2024'] = (+d['Sum of 2024 USDA Mt Lbs']);
  });

  const varieties = Object.keys(grouped);
  const trace2022 = { x: [], y: [], name: '2022 USDA Mt Lbs', type: 'scatter', mode: 'lines+markers' };
  const trace2023 = { x: [], y: [], name: '2023 USDA Mt Lbs', type: 'scatter', mode: 'lines+markers' };
  const trace2024 = { x: [], y: [], name: '2024 USDA Mt Lbs', type: 'scatter', mode: 'lines+markers' };

  varieties.forEach(v => {
    const row = grouped[v];
    if (row['2022'] != null) {
      trace2022.x.push(v); trace2022.y.push(row['2022']);
    }
    if (row['2023'] != null) {
      trace2023.x.push(v); trace2023.y.push(row['2023']);
    }
    if (row['2024'] != null) {
      trace2024.x.push(v); trace2024.y.push(row['2024']);
    }
  });

  const sumMetric = key => filtered.reduce((sum, d) => sum + (+d[key] || 0), 0);

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

      <div style={{ marginBottom: '20px', textAlign: 'center' }}>
        <label style={{ fontWeight: 'bold', fontSize: '20px', color: 'black' }}>Field</label>
        <br />
        <select multiple value={selectedOrchards} onChange={handleDropdownChange} style={{ width: '300px', marginTop: '10px' }}>
          {orchardCodes.map(code => <option key={code} value={code}>{code}</option>)}
        </select>
      </div>

      <Plot
        data={[trace2022, trace2023, trace2024]}
        layout={{
          width: 1300,
          height: 500,
          title: 'USDA Mt Lbs by Variety and Year',
          xaxis: { title: 'Variety', type: 'category' },
          yaxis: { title: 'USDA Mt Lbs' },
          legend: { x: 1.05, y: 1 }
        }}
        config={{ responsive: true }}
      />

      <Plot
        data={[{
          x: ['2022 Incoming', '2022 USDA', '2023 Incoming', '2023 USDA', '2024 Incoming', '2024 USDA'],
          y: [
            sumMetric('Sum of 2022 Incoming'),
            sumMetric('Sum of 2022 USDA Mt Lbs'),
            sumMetric('Sum of 2023 Incoming'),
            sumMetric('Sum of 2023 USDA Mt Lbs'),
            sumMetric('Sum of 2024 Incoming'),
            sumMetric('Sum of 2024 USDA Mt Lbs')
          ],
          type: 'bar',
          marker: { color: ['#86CFFF', '#CAC691', '#86CFFF', '#CAC691', '#86CFFF', '#CAC691'] }
        }]}
        layout={{
          width: 1300,
          height: 500,
          title: 'Total Incoming and USDA Mt Lbs by Year',
          yaxis: { title: 'Sum of Values' }
        }}
        config={{ responsive: true }}
      />
    </div>
  );
}

export default CropYieldChartPage;
