import React from 'react';
import { useNavigate } from 'react-router-dom';
import bg from './almond_farm.png'; // Ensure this image is saved as src/almond_farm.png

function LandingPage() {
  const navigate = useNavigate();

  return (
    <div style={{
      backgroundImage: `url(${bg})`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      height: '100vh',
      width: '100vw',
      fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center'
    }}>
      <h1 style={{
        fontSize: '4rem',
        color: 'white',
        textShadow: '2px 2px 8px rgba(0,0,0,0.7)',
        marginBottom: '2rem'
      }}>
        Henderson Farms
      </h1>
      <button
        onClick={() => navigate('/chart')}
        style={{
          fontSize: '1.8rem',
          padding: '20px 50px',
          background: 'linear-gradient(to right, #FFB347, #FFCC33)',
          border: 'none',
          borderRadius: '50px',
          color: '#333',
          fontWeight: 'bold',
          cursor: 'pointer',
          boxShadow: '0 10px 25px rgba(0,0,0,0.4)',
          transition: 'transform 0.2s ease, box-shadow 0.2s ease'
        }}
        onMouseOver={e => {
          e.currentTarget.style.transform = 'scale(1.1)';
          e.currentTarget.style.boxShadow = '0 15px 30px rgba(0,0,0,0.5)';
        }}
        onMouseOut={e => {
          e.currentTarget.style.transform = 'scale(1)';
          e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.4)';
        }}
      >
        Nutrient
      </button>
    </div>
  );
}

export default LandingPage;