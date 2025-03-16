import React, { useState } from 'react';
import { DatasetRow, DatasetColumn } from '@/types/dataset';
import SimilarityHeatmap from './SimilarityHeatmap';
import WordCloud from './WordCloud';
import BarChart from './BarChart';
import RadarChart from './RadarChart';
import SemanticContext from './SemanticContext';
import FeatherIcon from 'feather-icons-react';

interface DataVisualizationsProps {
  results: DatasetRow[];
  columns: DatasetColumn[];
  query: string;
  relevanceScores: Record<string, number>;
  highlightedFields: Record<string, string[]>;
  onWordClick?: (word: string) => void;
}

const DataVisualizations: React.FC<DataVisualizationsProps> = ({
  results,
  columns,
  query,
  relevanceScores,
  highlightedFields,
  onWordClick
}) => {
  const [activeTab, setActiveTab] = useState<'heatmap' | 'wordcloud' | 'barchart' | 'radar' | 'context'>('heatmap');

  if (!results.length) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex flex-col items-center justify-center h-64 text-center">
          <FeatherIcon icon="search" size={48} className="text-gray-300 mb-4" />
          {query ? (
            <p className="text-gray-500">No se encontraron resultados para la búsqueda "{query}"</p>
          ) : (
            <p className="text-gray-500">Realiza una búsqueda para visualizar los resultados</p>
          )}
          <p className="text-gray-400 text-sm mt-2">Prueba con términos diferentes o más generales</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="border-b border-gray-200">
        <nav className="flex flex-wrap">
          <button
            className={`py-3 px-4 text-sm font-medium flex items-center ${
              activeTab === 'heatmap'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('heatmap')}
          >
            <FeatherIcon icon="grid" size={16} className="mr-2" />
            Mapa de Similitud
          </button>
          <button
            className={`py-3 px-4 text-sm font-medium flex items-center ${
              activeTab === 'wordcloud'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('wordcloud')}
          >
            <FeatherIcon icon="cloud" size={16} className="mr-2" />
            Nube de Palabras
          </button>
          <button
            className={`py-3 px-4 text-sm font-medium flex items-center ${
              activeTab === 'barchart'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('barchart')}
          >
            <FeatherIcon icon="bar-chart-2" size={16} className="mr-2" />
            Características
          </button>
          <button
            className={`py-3 px-4 text-sm font-medium flex items-center ${
              activeTab === 'radar'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('radar')}
          >
            <FeatherIcon icon="activity" size={16} className="mr-2" />
            Radar
          </button>
          <button
            className={`py-3 px-4 text-sm font-medium flex items-center ${
              activeTab === 'context'
                ? 'border-b-2 border-blue-500 text-blue-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setActiveTab('context')}
          >
            <FeatherIcon icon="share-2" size={16} className="mr-2" />
            Contexto
          </button>
        </nav>
      </div>

      <div className="p-6">
        {activeTab === 'heatmap' && (
          <SimilarityHeatmap 
            results={results} 
            query={query} 
            relevanceScores={relevanceScores} 
          />
        )}
        {activeTab === 'wordcloud' && (
          <WordCloud 
            results={results} 
            columns={columns} 
            query={query} 
            highlightedFields={highlightedFields}
            onWordClick={onWordClick}
          />
        )}
        {activeTab === 'barchart' && (
          <BarChart 
            results={results} 
            columns={columns} 
            query={query} 
            highlightedFields={highlightedFields}
          />
        )}
        {activeTab === 'radar' && (
          <RadarChart 
            results={results} 
            query={query} 
            relevanceScores={relevanceScores} 
          />
        )}
        {activeTab === 'context' && (
          <SemanticContext 
            results={results} 
            columns={columns} 
            query={query} 
            relevanceScores={relevanceScores} 
            highlightedFields={highlightedFields}
          />
        )}
      </div>
    </div>
  );
};

export default DataVisualizations; 