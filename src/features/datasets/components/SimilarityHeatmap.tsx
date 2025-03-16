import React, { useEffect, useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  PointElement, 
  Title, 
  Tooltip, 
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Scatter } from 'react-chartjs-2';
import { DatasetRow } from '@/types/dataset';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  Title,
  Tooltip,
  Legend
);

interface SimilarityHeatmapProps {
  results: DatasetRow[];
  query: string;
  relevanceScores: Record<string, number>;
}

const SimilarityHeatmap: React.FC<SimilarityHeatmapProps> = ({ 
  results, 
  query, 
  relevanceScores 
}) => {
  const [chartData, setChartData] = useState<ChartData<'scatter'>>({
    datasets: []
  });
  const [chartOptions, setChartOptions] = useState<ChartOptions<'scatter'>>({});

  useEffect(() => {
    if (!results.length) return;

    // Generar datos para el mapa de calor
    const generateHeatmapData = () => {
      // Crear un conjunto de datos para el gráfico de dispersión que simula un mapa de calor
      const dataPoints = results.map((row, rowIndex) => {
        // Usar el índice como coordenada X
        const x = rowIndex % Math.ceil(Math.sqrt(results.length));
        // Usar el índice dividido por la raíz cuadrada como coordenada Y
        const y = Math.floor(rowIndex / Math.ceil(Math.sqrt(results.length)));
        // Usar la puntuación de relevancia como tamaño del punto
        const r = (relevanceScores[row.id] || 50) / 10;
        
        return {
          x,
          y,
          r,
          rowId: row.id,
          relevance: relevanceScores[row.id] || 0
        };
      });

      return {
        datasets: [
          {
            label: `Similitud semántica para "${query}"`,
            data: dataPoints,
            backgroundColor: (context: any) => {
              const value = context.raw as { relevance: number };
              // Generar color basado en la relevancia (rojo para baja, verde para alta)
              const relevance = value?.relevance || 0;
              const r = Math.floor(255 - (relevance * 2.55));
              const g = Math.floor(relevance * 2.55);
              const b = 0;
              return `rgba(${r}, ${g}, ${b}, 0.7)`;
            },
            pointRadius: 10,
            pointHoverRadius: 12,
          }
        ]
      };
    };

    // Configurar opciones del gráfico
    const options: ChartOptions<'scatter'> = {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          title: {
            display: true,
            text: 'Dimensión X (Proyección 2D)'
          },
          ticks: {
            display: false // Ocultar etiquetas de eje X
          },
          grid: {
            display: false
          }
        },
        y: {
          title: {
            display: true,
            text: 'Dimensión Y (Proyección 2D)'
          },
          ticks: {
            display: false // Ocultar etiquetas de eje Y
          },
          grid: {
            display: false
          }
        }
      },
      plugins: {
        tooltip: {
          callbacks: {
            label: (context) => {
              const dataPoint = context.raw as { rowId: string, relevance: number };
              const row = results.find(r => r.id === dataPoint.rowId);
              const relevance = dataPoint.relevance;
              
              // Mostrar información relevante en el tooltip
              const rowName = row ? (row.name || row.id) : 'Desconocido';
              return [
                `ID: ${dataPoint.rowId}`,
                `Nombre: ${rowName}`,
                `Relevancia: ${relevance}%`
              ];
            }
          }
        },
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Mapa de calor de similitud semántica',
          font: {
            size: 16
          }
        },
      },
    };

    setChartData(generateHeatmapData());
    setChartOptions(options);
  }, [results, query, relevanceScores]);

  if (!results.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay suficientes datos para generar el mapa de calor</p>
      </div>
    );
  }

  return (
    <div>
      <div className="h-64">
        <Scatter data={chartData} options={chartOptions} />
      </div>
      <div className="mt-4 text-xs text-gray-500">
        <p>Este mapa de calor muestra la similitud semántica entre los resultados de búsqueda.</p>
        <p>Los puntos más grandes y verdes indican mayor relevancia con respecto a la consulta.</p>
      </div>
    </div>
  );
};

export default SimilarityHeatmap; 