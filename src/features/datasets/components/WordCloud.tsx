import React, { useEffect, useRef, useState } from 'react';
import * as d3 from 'd3';
import cloud from 'd3-cloud';
import { DatasetRow, DatasetColumn } from '@/types/dataset';

interface WordCloudProps {
  results: DatasetRow[];
  columns: DatasetColumn[];
  query: string;
  highlightedFields?: Record<string, string[]>;
  onWordClick?: (word: string) => void;
}

interface WordData {
  text: string;
  value: number;
  color: string;
}

const WordCloud: React.FC<WordCloudProps> = ({
  results,
  columns,
  query,
  highlightedFields = {},
  onWordClick
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [words, setWords] = useState<WordData[]>([]);
  const [dimensions, setDimensions] = useState({ width: 500, height: 300 });

  useEffect(() => {
    if (!results.length) return;

    const extractWords = (text: string): string[] => {
      if (!text) return [];
      return text
        .toLowerCase()
        .replace(/[^\w\sáéíóúüñ]/g, '')
        .split(/\s+/)
        .filter(word => word.length > 2)
        .filter(word => !['the', 'and', 'for', 'with', 'los', 'las', 'del', 'por', 'con', 'una', 'que', 'para'].includes(word));
    };

    const allWords: string[] = [];
    
    results.forEach(row => {
      const fields = highlightedFields[row.id] || [];
      
      if (fields.length > 0) {
        fields.forEach(field => {
          if (row[field]) {
            const words = extractWords(row[field].toString());
            allWords.push(...words);
          }
        });
      } else {
        columns.forEach(column => {
          if (column.type === 'string' && row[column.name]) {
            const words = extractWords(row[column.name].toString());
            allWords.push(...words);
          }
        });
      }
    });

    const wordCount: Record<string, number> = {};
    allWords.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1;
    });

    const wordData: WordData[] = Object.entries(wordCount)
      .filter(([_, count]) => count > 1)
      .map(([text, value]) => {
        const isInQuery = query.toLowerCase().includes(text.toLowerCase());
        const color = isInQuery ? '#4299e1' : '#718096';
        
        return { text, value, color };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 50);

    setWords(wordData);
  }, [results, columns, query, highlightedFields]);

  useEffect(() => {
    if (!words.length || !svgRef.current) return;

    d3.select(svgRef.current).selectAll('*').remove();

    const containerWidth = svgRef.current.parentElement?.clientWidth || 500;
    const containerHeight = 300;
    setDimensions({ width: containerWidth, height: containerHeight });

    const layout = cloud()
      .size([containerWidth, containerHeight])
      .words(words.map(d => ({ 
        text: d.text, 
        size: 10 + (d.value * 5),
        color: d.color
      })))
      .padding(5)
      .rotate(() => 0)
      .font('Arial')
      .fontSize(d => d.size as number)
      .on('end', draw);

    layout.start();

    function draw(words: any[]) {
      const svg = d3.select(svgRef.current)
        .attr('width', containerWidth)
        .attr('height', containerHeight)
        .append('g')
        .attr('transform', `translate(${containerWidth / 2},${containerHeight / 2})`);

      svg.selectAll('text')
        .data(words)
        .enter()
        .append('text')
        .style('font-size', d => `${d.size}px`)
        .style('font-family', 'Arial')
        .style('fill', d => d.color)
        .attr('text-anchor', 'middle')
        .attr('transform', d => `translate(${d.x},${d.y})`)
        .text(d => d.text)
        .style('cursor', 'pointer')
        .on('click', function(_, d) {
          if (onWordClick) {
            onWordClick(d.text);
          }
        })
        .on('mouseover', function() {
          d3.select(this).style('font-weight', 'bold');
        })
        .on('mouseout', function() {
          d3.select(this).style('font-weight', 'normal');
        });
    }
  }, [words, onWordClick]);

  if (!results.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay suficientes datos para generar la nube de palabras</p>
      </div>
    );
  }

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Nube de palabras</h3>
      <div className="relative" style={{ height: `${dimensions.height}px` }}>
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>
      <div className="mt-4 text-xs text-gray-500">
        <p>Esta nube muestra las palabras más frecuentes en los resultados de búsqueda.</p>
        <p>Las palabras más grandes aparecen con mayor frecuencia. Haz clic en una palabra para buscarla.</p>
      </div>
    </div>
  );
};

export default WordCloud; 