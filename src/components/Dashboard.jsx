import React, { useEffect, useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Doughnut, Radar } from 'react-chartjs-2';
import './Dashboard.css';

// Registrar componentes de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  RadialLinearScale,
  ArcElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const Dashboard = () => {
  // Colores del tema
  const colors = {
    primary: '#865cf0',
    secondary: '#6B4AC7',
    accent: '#9D7AF3',
    complement: '#CF8A65',
    light: '#F8F9FA',
    success: '#28A745',
    warning: '#FFC107',
    danger: '#DC3545'
  };

  // Datos para los gráficos
  const perceptionData = {
    labels: ['India', 'Pakistan', 'Indonesia', 'México', 'Chile', 'Brasil', 'China', 'España', 'EE.UU.', 'Alemania'],
    datasets: [{
      label: 'Percepción Positiva',
      data: [75, 72, 76, 65, 64, 57, 70, 49, 48, 34],
      backgroundColor: colors.primary,
      borderRadius: 6
    }, {
      label: 'Percepción Negativa',
      data: [25, 28, 24, 35, 36, 43, 30, 51, 52, 66],
      backgroundColor: '#E9ECEF',
      borderRadius: 6
    }]
  };

  const adoptionData = {
    labels: ['Norte América', 'Asia', 'Europa', 'Latinoamérica', 'África'],
    datasets: [{
      data: [68, 61, 52, 47, 39],
      backgroundColor: [
        colors.primary,
        colors.secondary,
        colors.accent,
        colors.complement,
        '#ADB5BD'
      ],
      borderWidth: 2,
      borderColor: '#fff'
    }]
  };

  const jobsData = {
    labels: ['Estados Unidos', 'China', 'India', 'Brasil', 'México', 'Colombia', 'España', 'Alemania'],
    datasets: [{
      label: 'Empleos Totales',
      data: [165, 780, 520, 100, 58, 24, 23, 45],
      backgroundColor: colors.light,
      borderColor: colors.primary,
      borderWidth: 2
    }, {
      label: 'Empleos en Riesgo',
      data: [25, 110, 60, 12, 8, 3, 3.5, 7],
      backgroundColor: colors.primary
    }]
  };

  const sectorData = {
    labels: ['Serv. Financieros', 'Salud', 'Educación', 'Manufactura', 'Gobierno'],
    datasets: [{
      label: '% Adopción Alta',
      data: [55, 47, 42, 40, 37],
      backgroundColor: [
        colors.primary,
        colors.primary,
        colors.complement, // Destacar Educación
        colors.primary,
        colors.primary
      ],
      borderRadius: 6
    }]
  };

  const skillsData = {
    labels: [
      'Pensamiento Analítico',
      'Resiliencia/Flexibilidad', 
      'Liderazgo Social',
      'IA y Big Data',
      'Ciberseguridad',
      'Creatividad',
      'Alfabetización Tech'
    ],
    datasets: [{
      label: 'Demanda (%)',
      data: [70, 65, 60, 59, 55, 50, 48],
      backgroundColor: `${colors.primary}20`,
      borderColor: colors.primary,
      borderWidth: 2,
      pointBackgroundColor: colors.primary,
      pointBorderColor: '#fff',
      pointBorderWidth: 2
    }]
  };

  // Opciones de configuración para los gráficos
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top'
      }
    }
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      x: { 
        ticks: { maxRotation: 45 }
      },
      y: { 
        beginAtZero: true,
        max: 100,
        ticks: { callback: (value) => value + '%' }
      }
    }
  };

  const jobsOptions = {
    ...chartOptions,
    scales: {
      x: { 
        ticks: { maxRotation: 45 }
      },
      y: { 
        beginAtZero: true,
        ticks: { callback: (value) => value + 'M' }
      }
    }
  };

  const sectorOptions = {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: {
      legend: {
        display: false
      }
    },
    scales: {
      x: { 
        beginAtZero: true,
        max: 60,
        ticks: { callback: (value) => value + '%' }
      }
    }
  };

  const radarOptions = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      r: {
        beginAtZero: true,
        max: 80
      }
    }
  };

  return (
    <div className="dashboard">
      <header className="header">
        <h1>IA Generativa: Transformando el Futuro del Trabajo</h1>
        <p>Análisis Estratégico para la Universidad Icesi • Consejo Académico 2025</p>
      </header>

      <div className="dashboard-container">
        {/* Percepción Global */}
        <div className="card">
          <h2 className="card-title">Percepción Global sobre IA en el Empleo</h2>
          <p className="card-subtitle">¿Cree que la IA tendrá un impacto positivo en su trabajo?</p>
          <div className="chart-container">
            <Bar data={perceptionData} options={barOptions} />
          </div>
        </div>

        {/* Adopción por Región */}
        <div className="card">
          <h2 className="card-title">Adopción de IA por Región</h2>
          <p className="card-subtitle">Niveles de adopción alta en diferentes regiones</p>
          <div className="chart-container">
            <Doughnut data={adoptionData} options={chartOptions} />
          </div>
        </div>

        {/* Empleos en Riesgo */}
        <div className="card full-width">
          <h2 className="card-title">Impacto Laboral por Países</h2>
          <p className="card-subtitle">Empleos en riesgo vs empleos totales (en millones)</p>
          <div className="chart-container large-chart">
            <Bar data={jobsData} options={jobsOptions} />
          </div>
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">170M</span>
              <span className="stat-label">Empleos Creados</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">92M</span>
              <span className="stat-label">Empleos Desplazados</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">+78M</span>
              <span className="stat-label">Balance Neto</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">13%</span>
              <span className="stat-label">Colombia en Riesgo</span>
            </div>
          </div>
        </div>

        {/* Adopción por Sector en LatAm */}
        <div className="card">
          <h2 className="card-title">Adopción IA en Latinoamérica por Sector</h2>
          <p className="card-subtitle">Oportunidad en educación: solo 42% adopción alta</p>
          <div className="chart-container">
            <Bar data={sectorData} options={sectorOptions} />
          </div>
        </div>

        {/* Habilidades Demandadas */}
        <div className="card">
          <h2 className="card-title">Habilidades Más Demandadas 2025-2030</h2>
          <p className="card-subtitle">% de empresas que las requerirán</p>
          <div className="chart-container">
            <Radar data={skillsData} options={radarOptions} />
          </div>
        </div>

        {/* Insights Clave */}
        <div className="card full-width">
          <h2 className="card-title">Insights Estratégicos para Icesi</h2>
          <div className="insight-box">
            <div className="insight-title">🎯 Oportunidad Educativa</div>
            <p>Latinoamérica tiene solo 42% de adopción alta en educación vs 55% en servicios financieros. Icesi puede liderar este espacio.</p>
          </div>
          <div className="insight-box">
            <div className="insight-title">💼 Empleabilidad del Futuro</div>
            <p>70% de empresas demandarán pensamiento analítico, 59% habilidades en IA y Big Data. Necesitamos adaptar nuestros currículos.</p>
          </div>
          <div className="insight-box">
            <div className="insight-title">🌎 Contexto Colombiano</div>
            <p>Colombia: 3M empleos en riesgo (13%), pero balance global positivo (+78M empleos). Preparar para la transición es clave.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;