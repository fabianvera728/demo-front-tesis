import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { DatasetRow, DatasetColumn } from '@/types/dataset';

interface SemanticContextProps {
  results: DatasetRow[];
  columns: DatasetColumn[];
  query: string;
  relevanceScores: Record<string, number>;
  highlightedFields: Record<string, string[]>;
}

const SemanticContext: React.FC<SemanticContextProps> = ({
  results,
  columns,
  query,
  relevanceScores,
  highlightedFields
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  
  useEffect(() => {
    if (!results.length || !svgRef.current) return;
    
    d3.select(svgRef.current).selectAll('*').remove();
    
    const width = svgRef.current.parentElement?.clientWidth || 600;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;
    
    const svg = d3.select(svgRef.current)
      .attr('width', width)
      .attr('height', height)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);
    
    const topResults = [...results]
      .sort((a, b) => (relevanceScores[b.id] || 0) - (relevanceScores[a.id] || 0))
      .slice(0, 15);
    
    const nodes: any[] = [];
    
    nodes.push({
      id: 'query',
      name: query,
      group: 0,
      size: 20,
      relevance: 100
    });
    
    topResults.forEach((row, index) => {
      nodes.push({
        id: row.id,
        name: row.name || `Resultado ${index + 1}`,
        group: 1,
        size: 10 + (relevanceScores[row.id] || 50) / 10,
        relevance: relevanceScores[row.id] || 50
      });
    });
    
    const links: any[] = [];
    
    topResults.forEach(row => {
      links.push({
        source: 'query',
        target: row.id,
        value: relevanceScores[row.id] || 50
      });
    });
    
    for (let i = 0; i < topResults.length; i++) {
      for (let j = i + 1; j < topResults.length; j++) {
        const rowA = topResults[i];
        const rowB = topResults[j];
  
        const relevanceA = relevanceScores[rowA.id] || 50;
        const relevanceB = relevanceScores[rowB.id] || 50;
        const similarity = Math.abs(relevanceA - relevanceB) < 20 ? 
          Math.min(relevanceA, relevanceB) * 0.8 : 0;
        
        if (similarity > 30) {
          links.push({
            source: rowA.id,
            target: rowB.id,
            value: similarity
          });
        }
      }
    }
    
    const simulation = d3.forceSimulation(nodes)
      .force('link', d3.forceLink(links).id((d: any) => d.id).distance(100))
      .force('charge', d3.forceManyBody().strength(-200))
      .force('center', d3.forceCenter(innerWidth / 2, innerHeight / 2))
      .force('collision', d3.forceCollide().radius((d: any) => d.size + 5));
    
    const colorScale = d3.scaleLinear<string>()
      .domain([0, 50, 100])
      .range(['#ff6b6b', '#feca57', '#1dd1a1'])
      .interpolate(d3.interpolateRgb.gamma(2.2));
    
    const link = svg.append('g')
      .selectAll('line')
      .data(links)
      .enter()
      .append('line')
      .attr('stroke-width', (d: any) => Math.max(1, d.value / 25))
      .attr('stroke', (d: any) => {
        const relevance = d.value;
        return d3.interpolateBlues(relevance / 100);
      })
      .attr('stroke-opacity', 0.6);
    
    const node = svg.append('g')
      .selectAll('circle')
      .data(nodes)
      .enter()
      .append('circle')
      .attr('r', (d: any) => d.size)
      .attr('fill', (d: any) => d.group === 0 ? '#ff9f43' : colorScale(d.relevance))
      .attr('stroke', '#fff')
      .attr('stroke-width', 1.5)
      .style('cursor', 'pointer')
      .on('mouseover', function(event, d: any) {
        d3.select(this).attr('stroke', '#000').attr('stroke-width', 2);
        
        tooltip.style('opacity', 1)
          .html(`<strong>${d.name}</strong><br>Relevancia: ${d.relevance.toFixed(1)}%`)
          .style('left', (event.pageX + 10) + 'px')
          .style('top', (event.pageY - 28) + 'px');
      })
      .on('mouseout', function() {
        d3.select(this).attr('stroke', '#fff').attr('stroke-width', 1.5);
        tooltip.style('opacity', 0);
      })
      .call(d3.drag()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended) as any);
    
    const label = svg.append('g')
      .selectAll('text')
      .data(nodes)
      .enter()
      .append('text')
      .text((d: any) => {
        if (d.group === 0 || d.relevance > 70) {
          return d.name.length > 15 ? d.name.substring(0, 12) + '...' : d.name;
        }
        return '';
      })
      .attr('font-size', 10)
      .attr('dx', (d: any) => d.size + 5)
      .attr('dy', 4)
      .style('pointer-events', 'none');
    
    const tooltip = d3.select('body').append('div')
      .attr('class', 'tooltip')
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', '1px solid #ddd')
      .style('border-radius', '4px')
      .style('padding', '5px')
      .style('pointer-events', 'none')
      .style('opacity', 0)
      .style('font-size', '12px')
      .style('z-index', 1000);
    
    simulation.on('tick', () => {
      link
        .attr('x1', (d: any) => Math.max(0, Math.min(innerWidth, d.source.x)))
        .attr('y1', (d: any) => Math.max(0, Math.min(innerHeight, d.source.y)))
        .attr('x2', (d: any) => Math.max(0, Math.min(innerWidth, d.target.x)))
        .attr('y2', (d: any) => Math.max(0, Math.min(innerHeight, d.target.y)));
      
      node
        .attr('cx', (d: any) => Math.max(d.size, Math.min(innerWidth - d.size, d.x)))
        .attr('cy', (d: any) => Math.max(d.size, Math.min(innerHeight - d.size, d.y)));
      
      label
        .attr('x', (d: any) => Math.max(d.size, Math.min(innerWidth - d.size, d.x)))
        .attr('y', (d: any) => Math.max(d.size, Math.min(innerHeight - d.size, d.y)));
    });
    
    function dragstarted(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0.3).restart();
      d.fx = d.x;
      d.fy = d.y;
    }
    
    function dragged(event: any, d: any) {
      d.fx = event.x;
      d.fy = event.y;
    }
    
    function dragended(event: any, d: any) {
      if (!event.active) simulation.alphaTarget(0);
      d.fx = null;
      d.fy = null;
    }
    
    return () => {
      d3.select('body').selectAll('.tooltip').remove();
    };
  }, [results, columns, query, relevanceScores, highlightedFields]);
  
  if (!results.length) {
    return (
      <div className="flex items-center justify-center h-64 bg-gray-50 rounded-lg">
        <p className="text-gray-500">No hay suficientes datos para visualizar el contexto semántico</p>
      </div>
    );
  }
  
  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">Contexto Semántico</h3>
      <div className="relative" style={{ height: '300px' }}>
        <svg ref={svgRef} className="w-full h-full"></svg>
      </div>
      <div className="mt-4 text-xs text-gray-500">
        <p>Esta visualización muestra las relaciones semánticas entre la consulta y los resultados.</p>
        <p>Los nodos más grandes y verdes indican mayor relevancia. Las líneas conectan elementos relacionados.</p>
        <p>Puedes arrastrar los nodos para reorganizar la visualización.</p>
      </div>
    </div>
  );
};

export default SemanticContext; 