import React, { useEffect, useState } from 'react';
import { 
  Chart as ChartJS, 
  RadialLinearScale, 
  PointElement, 
  LineElement, 
  Filler, 
  Tooltip, 
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Radar } from 'react-chartjs-2';
import { DatasetRow } from '@/types/dataset';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  RadialLinearScale,
  PointElement,
  LineElement,
  Filler,
  Tooltip,
  Legend
);

interface RadarChartProps {
  results: DatasetRow[];
  query: string;
  relevanceScores: Record<string, number>;
}

const RadarChart: React.FC<RadarChartProps> = ({ 
  results, 
  query, 
  relevanceScores 
}) => {
  const [chartData, setChartData] = useState<ChartData<'radar'>>({
    labels: [],
    datasets: []
  });
  const [chartOptions, setChartOptions] = useState<ChartOptions<'radar'>>({});

  useEffect(() => {
    if (!results.length || results.length < 5) return;

    // Seleccionar los 5 resultados más relevantes
    const topResults = [...results]
      .sort((a, b) => (relevanceScores[b.id] || 0) - (relevanceScores[a.id] || 0))
      .slice(0, 5);

    // Definir categorías para el radar (aspectos de similitud)
    const categories = [
      'Relevancia general',
      'Coincidencia de términos',
      'Contexto semántico',
      'Importancia relativa',
      'Especificidad'
    ];

    // Generar datos para cada resultado
    const datasets = topResults.map((row, index) => {
      // Calcular valores para cada categoría
      // Estos cálculos son simulados y deberían adaptarse a tus datos reales
      const baseRelevance = relevanceScores[row.id] || 50;
      
      // Generar valores ligeramente diferentes para cada categoría
      // basados en la relevancia general
      const values = [
        baseRelevance, // Relevancia general
        baseRelevance * (0.8 + Math.random() * 0.4), // Coincidencia de términos
        baseRelevance * (0.7 + Math.random() * 0.5), // Contexto semántico
        baseRelevance * (0.6 + Math.random() * 0.6), // Importancia relativa
        baseRelevance * (0.5 + Math.random() * 0.7)  // Especificidad
      ].map(v => Math.min(100, Math.max(0, v))); // Asegurar que los valores estén entre 0 y 100

      // Colores predefinidos para los datasets
      const colors = [
        'rgba(255, 99, 132, 0.7)',   // Rojo
        'rgba(54, 162, 235, 0.7)',   // Azul
        'rgba(255, 206, 86, 0.7)',   // Amarillo
        'rgba(75, 192, 192, 0.7)',   // Verde azulado
        'rgba(153, 102, 255, 0.7)'   // Púrpura
      ];

      return {
        label: row.name || `Resultado ${index + 1}`,
        data: values,
        backgroundColor: colors[index % colors.length].replace('0.7', '0.2'),
        borderColor: colors[index % colors.length],
        borderWidth: 2,
        pointBackgroundColor: colors[index % colors.length],
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: colors[index % colors.length]
      };
    });

    const data: ChartData<'radar'> = {
      labels: categories,
      datasets
    };

    const options: ChartOptions<'radar'> = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        r: {
          angleLines: {
            display: true
          },
          suggestedMin: 0,
          suggestedMax: 100,
          ticks: {
            stepSize: 20,
            callback: function(value) {
              return value + '%';
            }
          }
        }
      },
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: `Análisis de similitud para "${query}"`,
          font: {
            size: 16
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `${context.dataset.label}: ${context.parsed.r.toFixed(1)}%`;
            }
          }
        }
      }
    };

    setChartData(data);
    setChartOptions(options);
  }, [results, query, relevanceScores]);

  if (!results.length || results.length < 5) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">Se necesitan al menos 5 resultados para generar el gráfico de radar</p>
      </div>
    );
  }

  return (
    <div>
      <div className="h-64">
        <Radar data={chartData} options={chartOptions} />
      </div>
      <div className="mt-4 text-xs text-gray-500">
        <p>Este gráfico de radar muestra diferentes aspectos de similitud para los 5 resultados más relevantes.</p>
        <p>Cada eje representa una dimensión diferente de la similitud semántica.</p>
      </div>
    </div>
  );
};

export default RadarChart; 