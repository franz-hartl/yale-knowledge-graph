import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { NetworkData, NetworkNode, NetworkDataProcessor } from '../../utils/networkDataProcessor';
import { Faculty, ResearchTopic } from '../../types';

interface FacultyClusterGraphProps {
  faculty: Faculty[];
  topics: ResearchTopic[];
  selectedTopicKey: string;
  onFacultySelect?: (facultyEmail: string) => void;
  className?: string;
}

export const FacultyClusterGraph: React.FC<FacultyClusterGraphProps> = ({
  faculty,
  topics,
  selectedTopicKey,
  onFacultySelect,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [networkData, setNetworkData] = useState<NetworkData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);
  const [expertiseThreshold, setExpertiseThreshold] = useState(1);

  const renderNetwork = useCallback(() => {
    try {
      console.log('🎨 Rendering faculty cluster with', networkData.nodes.length, 'faculty and', networkData.edges.length, 'connections');
      
      const svg = d3.select(svgRef.current);
      if (!svg.node()) {
        console.error('❌ SVG ref not available');
        return;
      }
      
      svg.selectAll('*').remove(); // Clear previous render

      const width = 900;
      const height = 700;
      const margin = { top: 40, right: 40, bottom: 40, left: 40 };

      svg.attr('width', width).attr('height', height);

      const g = svg.append('g')
        .attr('transform', `translate(${margin.left}, ${margin.top})`);

      const innerWidth = width - margin.left - margin.right;
      const innerHeight = height - margin.top - margin.bottom;

      if (networkData.nodes.length === 0) {
        // Show empty state
        g.append('text')
          .attr('x', innerWidth / 2)
          .attr('y', innerHeight / 2)
          .attr('text-anchor', 'middle')
          .style('font-size', '18px')
          .style('fill', '#666')
          .text('No faculty found with expertise in this topic');
        return;
      }

      // Create scales
      const sizeScale = d3.scaleLinear()
        .domain(d3.extent(networkData.nodes, d => d.size) as [number, number])
        .range([12, 35]);

      const linkScale = d3.scaleLinear()
        .domain(networkData.edges.length > 0 ? d3.extent(networkData.edges, d => d.weight) as [number, number] : [0, 1])
        .range([1, 6]);

      // Create force simulation
      const simulation = d3.forceSimulation(networkData.nodes as any);
      
      // Only add link force if there are edges
      if (networkData.edges.length > 0) {
        simulation.force('link', d3.forceLink(networkData.edges)
          .id((d: any) => d.id)
          .distance(d => 80 + (d as any).weight * 20)
          .strength(0.4));
      }
      
      simulation
        .force('charge', d3.forceManyBody().strength(d => -300 - (d as any).size * 10))
        .force('center', d3.forceCenter(innerWidth / 2, innerHeight / 2))
        .force('collision', d3.forceCollide().radius((d: any) => sizeScale(d.size) + 8));

      // Create links (only if there are edges)
      const link = g.append('g')
        .selectAll('line')
        .data(networkData.edges)
        .enter()
        .append('line')
        .attr('stroke', '#94a3b8')
        .attr('stroke-opacity', 0.7)
        .attr('stroke-width', d => linkScale(d.weight));

      // Create nodes
      const node = g.append('g')
        .selectAll('circle')
        .data(networkData.nodes)
        .enter()
        .append('circle')
        .attr('r', d => sizeScale(d.size))
        .attr('fill', d => d.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 2)
        .style('cursor', 'pointer')
        .call(d3.drag<SVGCircleElement, NetworkNode>()
          .on('start', (event, d) => {
            if (!event.active) simulation.alphaTarget(0.3).restart();
            (d as any).fx = (d as any).x;
            (d as any).fy = (d as any).y;
          })
          .on('drag', (event, d) => {
            (d as any).fx = event.x;
            (d as any).fy = event.y;
          })
          .on('end', (event, d) => {
            if (!event.active) simulation.alphaTarget(0);
            (d as any).fx = null;
            (d as any).fy = null;
          }));

      // Add labels
      const labels = g.append('g')
        .selectAll('text')
        .data(networkData.nodes)
        .enter()
        .append('text')
        .text(d => {
          const parts = d.name.split(' ');
          return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1]}` : d.name;
        })
        .style('font-size', '11px')
        .style('font-weight', 'bold')
        .style('fill', '#1f2937')
        .style('text-anchor', 'middle')
        .style('pointer-events', 'none');

      // Add hover and click interactions
      node
        .on('mouseover', function(event, d) {
          // Highlight node
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', sizeScale(d.size) + 8)
            .attr('stroke-width', 4)
            .attr('stroke', '#1f2937');

          // Show tooltip
          const tooltip = d3.select('body').append('div')
            .attr('class', 'faculty-tooltip')
            .style('position', 'absolute')
            .style('background', 'rgba(0, 0, 0, 0.9)')
            .style('color', 'white')
            .style('padding', '16px')
            .style('border-radius', '8px')
            .style('font-size', '14px')
            .style('pointer-events', 'none')
            .style('opacity', 0)
            .style('box-shadow', '0 4px 12px rgba(0,0,0,0.3)')
            .style('z-index', '9999')
            .style('max-width', '300px');

          tooltip.transition().duration(200).style('opacity', 1);
          
          const facultyData = d.data as Faculty;
          const selectedTopic = topics.find(t => t.topic_key === selectedTopicKey);
          
          const tooltipContent = `
            <div style="margin-bottom: 12px;">
              <strong>${d.name}</strong>
            </div>
            <div style="margin-bottom: 8px;">
              🎯 ${selectedTopic?.display_name || 'Unknown Topic'}: Level ${d.size}
            </div>
            <div style="margin-bottom: 8px;">
              🏛️ ${facultyData.school || 'Unknown School'}
            </div>
            ${facultyData.department ? `<div style="margin-bottom: 8px;">📍 ${facultyData.department}</div>` : ''}
            ${facultyData.job_title ? `<div style="margin-bottom: 8px;">💼 ${facultyData.job_title}</div>` : ''}
            <div style="font-size: 11px; color: #999; margin-top: 12px;">
              Click to view collaboration network →
            </div>
          `;
          
          tooltip.html(tooltipContent)
            .style('left', (event.pageX + 15) + 'px')
            .style('top', (event.pageY - 10) + 'px');
        })
        .on('mouseout', function(event, d) {
          // Reset node
          d3.select(this)
            .transition()
            .duration(200)
            .attr('r', sizeScale(d.size))
            .attr('stroke-width', 2)
            .attr('stroke', '#fff');

          // Remove tooltip
          d3.selectAll('.faculty-tooltip').remove();
        })
        .on('click', function(event, d) {
          console.log('🎯 Faculty clicked:', d.name, 'Email:', d.id);
          setSelectedNode(d);
          if (onFacultySelect) {
            onFacultySelect(d.id);
          }
        });

      // Update positions on simulation tick
      simulation.on('tick', () => {
        // Only update links if there are edges
        if (networkData.edges.length > 0) {
          link
            .attr('x1', (d: any) => d.source.x)
            .attr('y1', (d: any) => d.source.y)
            .attr('x2', (d: any) => d.target.x)
            .attr('y2', (d: any) => d.target.y);
        }

        node
          .attr('cx', (d: any) => d.x)
          .attr('cy', (d: any) => d.y);

        labels
          .attr('x', (d: any) => d.x)
          .attr('y', (d: any) => d.y + 4);
      });

      // Add zoom behavior
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 3])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        });

      svg.call(zoom as any);

      // Add school legend
      const schoolColors = new Set(networkData.nodes.map(n => n.color));
      const legendData = Array.from(schoolColors).map((color, i) => ({
        color,
        label: `School ${i + 1}` // Simplified for now
      }));

      const legend = g.append('g')
        .attr('transform', `translate(${innerWidth - 120}, 20)`);

      legend.selectAll('circle')
        .data(legendData)
        .enter()
        .append('circle')
        .attr('cx', 0)
        .attr('cy', (d, i) => i * 18)
        .attr('r', 5)
        .attr('fill', d => d.color);

      legend.selectAll('text')
        .data(legendData)
        .enter()
        .append('text')
        .attr('x', 12)
        .attr('y', (d, i) => i * 18 + 4)
        .text(d => d.label)
        .style('font-size', '11px')
        .style('fill', '#333');
        
      console.log('✅ Faculty cluster rendering completed successfully');
      
    } catch (error) {
      console.error('❌ Error rendering faculty cluster:', error);
      setError(`Rendering failed: ${error}`);
    }
  }, [networkData, onFacultySelect, setSelectedNode, selectedTopicKey, topics]);

  useEffect(() => {
    if (faculty.length > 0 && topics.length > 0 && selectedTopicKey) {
      console.log('🔄 Generating faculty cluster for topic:', selectedTopicKey);
      
      try {
        const processor = new NetworkDataProcessor(faculty, topics);
        processor.setExpertiseThreshold(expertiseThreshold);
        
        const data = processor.generateFacultyClusterNetwork(selectedTopicKey);
        console.log('✅ Generated faculty cluster data:', {
          nodeCount: data.nodes.length,
          edgeCount: data.edges.length,
          topicKey: selectedTopicKey
        });
        
        setNetworkData(data);
        setError(null);
      } catch (error) {
        console.error('❌ Error generating faculty cluster:', error);
        setError(`Failed to generate cluster: ${error}`);
      }
      
      setLoading(false);
    }
  }, [faculty, topics, selectedTopicKey, expertiseThreshold]);

  useEffect(() => {
    if (!loading && networkData.nodes.length > 0) {
      renderNetwork();
    }
  }, [networkData, loading, renderNetwork]);

  if (loading) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-gray-500 mt-4">Loading faculty network...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">Faculty Cluster Error</div>
          <div className="text-gray-500 text-sm mb-4">{error}</div>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const selectedTopic = topics.find(t => t.topic_key === selectedTopicKey);

  return (
    <div className={`relative ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Faculty Network: {selectedTopic?.display_name || selectedTopicKey}
          </h3>
          <p className="text-sm text-gray-600">
            Faculty with expertise in this area and their collaboration potential. 
            Node size = expertise level, edges = shared research interests.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <label className="text-sm text-gray-600">Expertise Threshold:</label>
            <select
              value={expertiseThreshold}
              onChange={(e) => setExpertiseThreshold(Number(e.target.value))}
              className="px-2 py-1 border rounded text-sm"
            >
              <option value={1}>Level 1+</option>
              <option value={2}>Level 2+</option>
              <option value={3}>Level 3+</option>
              <option value={4}>Level 4+</option>
              <option value={5}>Level 5 only</option>
            </select>
          </div>
          <div className="text-sm text-gray-500">
            {networkData.nodes.length} faculty • {networkData.edges.length} connections
          </div>
          <button
            onClick={() => {
              const svg = d3.select(svgRef.current);
              const zoom = d3.zoom<SVGSVGElement, unknown>();
              svg.transition().duration(750).call(
                zoom.transform as any,
                d3.zoomIdentity
              );
            }}
            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200 transition-colors"
          >
            Reset View
          </button>
        </div>
      </div>

      <div className="border rounded-lg overflow-hidden bg-white">
        <svg ref={svgRef} className="w-full h-auto"></svg>
      </div>

      {selectedNode && (
        <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h4 className="font-semibold text-blue-900">{selectedNode.name}</h4>
          <p className="text-sm text-blue-700 mt-1">
            Expertise level: {selectedNode.size} in {selectedTopic?.display_name}
          </p>
          {onFacultySelect && (
            <button
              onClick={() => onFacultySelect(selectedNode.id)}
              className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              View Collaboration Network
            </button>
          )}
        </div>
      )}
    </div>
  );
};