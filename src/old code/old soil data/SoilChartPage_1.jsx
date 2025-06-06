import React, { useState } from 'react';
import Plot from 'react-plotly.js';
import { useNavigate } from 'react-router-dom';
import treeBg from './tree_bg.png';
import soilData from './soil_data.csv';

function SoilChartPage() {
  const navigate = useNavigate();

  const [selectedElement, setSelectedElement] = useState('');
  const [selectedField, setSelectedField] = useState('');
  const [selectedDates, setSelectedDates] = useState([]);

  // Placeholder for actual data integration
  const mockData = [];

  const filtered = mockData.filter(row =>
    (!selectedElement || row["Element"] === selectedElement) &&
    (!selectedField || row["Field"] === selectedField) &&
    (selectedDates.length === 0 || selectedDates.includes(row["SAMPLE_DATE"]))
  );

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
          {/* Populate with unique Elements */}
        </select>

        <select value={selectedField} onChange={e => setSelectedField(e.target.value)}>
          <option value="">Select Field</option>
          {/* Populate with unique Fields */}
        </select>

        <select multiple value={selectedDates} onChange={e => setSelectedDates(Array.from(e.target.selectedOptions, o => o.value))}>
          {/* Populate with unique SAMPLE_DATEs */}
        </select>
      </div>

      <Plot
        data={[
          {
            x: [],  // SAMPLE_DATE
            y: [],  // Value
            type: 'bar',
            name: 'Value',
            marker: { color: '#86CFFF' }
          },
          {
            x: [],  // SAMPLE_DATE
            y: [],  // Average of High
            type: 'scatter',
            mode: 'lines',
            name: 'High Threshold',
            line: { color: 'hotpink', dash: 'solid' }
          },
          {
            x: [],  // SAMPLE_DATE
            y: [],  // Average of Low
            type: 'scatter',
            mode: 'lines',
            name: 'Low Threshold',
            line: { color: 'forestgreen', dash: 'solid' }
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