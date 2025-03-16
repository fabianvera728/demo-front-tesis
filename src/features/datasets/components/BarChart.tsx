import React, { useEffect, useState } from 'react';
import { 
  Chart as ChartJS, 
  CategoryScale, 
  LinearScale, 
  BarElement, 
  Title, 
  Tooltip, 
  Legend,
  ChartData,
  ChartOptions
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { DatasetRow, DatasetColumn } from '@/types/dataset';

// Registrar los componentes necesarios de Chart.js
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface BarChartProps {
  results: DatasetRow[];
  columns: DatasetColumn[];
  query: string;
  highlightedFields: Record<string, string[]>;
}

const BarChart: React.FC<BarChartProps> = ({ 
  results, 
  columns, 
  query,
  highlightedFields
}) => {
  const [chartData, setChartData] = useState<ChartData<'bar'>>({
    labels: [],
    datasets: []
  });
  const [chartOptions, setChartOptions] = useState<ChartOptions<'bar'>>({});

  useEffect(() => {
    if (!results.length) return;

    // Contar las coincidencias por campo
    const fieldMatches: Record<string, number> = {};
    
    // Inicializar contador para cada columna de texto
    columns.forEach(column => {
      if (column.type === 'string') {
        fieldMatches[column.name] = 0;
      }
    });

    // Contar coincidencias basadas en campos destacados
    results.forEach(row => {
      const fields = highlightedFields[row.id] || [];
      
      if (fields.length > 0) {
        fields.forEach(field => {
          if (fieldMatches[field] !== undefined) {
            fieldMatches[field]++;
          }
        });
      }
    });

    // Filtrar campos sin coincidencias y ordenar por número de coincidencias
    const sortedFields = Object.entries(fieldMatches)
      .filter(([_, count]) => count > 0)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10); // Mostrar solo los 10 campos con más coincidencias

    const labels = sortedFields.map(([field]) => {
      // Formatear nombre del campo para mejor visualización
      return field.length > 15 ? field.substring(0, 12) + '...' : field;
    });

    const data = sortedFields.map(([_, count]) => count);

    const data_chart: ChartData<'bar'> = {
      labels,
      datasets: [
        {
          label: 'Número de coincidencias',
          data,
          backgroundColor: 'rgba(54, 162, 235, 0.6)',
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1,
        }
      ]
    };

    const options: ChartOptions<'bar'> = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: `Campos con coincidencias para "${query}"`,
          font: {
            size: 16
          }
        },
        tooltip: {
          callbacks: {
            label: (context) => {
              return `${context.parsed.y} coincidencias`;
            }
          }
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          title: {
            display: true,
            text: 'Número de coincidencias'
          },
          ticks: {
            precision: 0 // Solo mostrar números enteros
          }
        },
        x: {
          title: {
            display: true,
            text: 'Campos'
          }
        }
      }
    };

    setChartData(data_chart);
    setChartOptions(options);
  }, [results, columns, query, highlightedFields]);

  if (!results.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay suficientes datos para generar el gráfico</p>
      </div>
    );
  }

  return (
    <div>
      <div className="h-64">
        <Bar data={chartData} options={chartOptions} />
      </div>
      <div className="mt-4 text-xs text-gray-500">
        <p>Este gráfico muestra los campos con más coincidencias para la consulta realizada.</p>
        <p>Las barras más altas indican campos con mayor número de coincidencias.</p>
      </div>
    </div>
  );
};

export default BarChart; 