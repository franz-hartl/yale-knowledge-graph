import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { NetworkData, NetworkNode, NetworkDataProcessor } from '../../utils/networkDataProcessor';
import { Faculty, ResearchTopic } from '../../types';

interface EgoNetworkGraphProps {
  faculty: Faculty[];
  topics: ResearchTopic[];
  selectedFacultyEmail: string;
  className?: string;
}

export const EgoNetworkGraph: React.FC<EgoNetworkGraphProps> = ({
  faculty,
  topics,
  selectedFacultyEmail,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [networkData, setNetworkData] = useState<NetworkData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

  const renderNetwork = useCallback(() => {
    try {
      console.log('🎨 Rendering ego network with', networkData.nodes.length, 'nodes and', networkData.edges.length, 'edges');
      
      const svg = d3.select(svgRef.current);
      if (!svg.node()) {
        console.error('❌ SVG ref not available');
        return;
      }
      
      svg.selectAll('*').remove(); // Clear previous render

      const width = 1000;
      const height = 800;
      const margin = { top: 50, right: 50, bottom: 50, left: 50 };

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
          .text('No collaboration network found for this faculty member');
        return;
      }

      // Network has different node types that we'll style differently
      // const centralNode = networkData.nodes.find(n => n.id === selectedFacultyEmail);
      // const topicNodes = networkData.nodes.filter(n => n.type === 'topic');
      // const facultyNodes = networkData.nodes.filter(n => n.type === 'faculty' && n.id !== selectedFacultyEmail);

      // Create scales
      const sizeScale = d3.scaleLinear()
        .domain(d3.extent(networkData.nodes, d => d.size) as [number, number])
        .range([8, 45]);

      const linkScale = d3.scaleLinear()
        .domain(networkData.edges.length > 0 ? d3.extent(networkData.edges, d => d.weight) as [number, number] : [0, 1])
        .range([2, 8]);

      // Create force simulation with specialized positioning
      const simulation = d3.forceSimulation(networkData.nodes as any)
        .force('charge', d3.forceManyBody().strength((d: any) => {
          if (d.id === selectedFacultyEmail) return -800; // Central node repels strongly
          if (d.type === 'topic') return -400; // Topic nodes moderate repulsion
          return -200; // Other faculty nodes light repulsion
        }))
        .force('center', d3.forceCenter(innerWidth / 2, innerHeight / 2))
        .force('collision', d3.forceCollide().radius((d: any) => sizeScale(d.size) + 15));

      // Add link force if there are edges
      if (networkData.edges.length > 0) {
        simulation.force('link', d3.forceLink(networkData.edges)
          .id((d: any) => d.id)
          .distance((d: any) => {
            // Shorter distance to central node
            if (d.source.id === selectedFacultyEmail || d.target.id === selectedFacultyEmail) {
              return d.type === 'faculty-topic' ? 100 : 150;
            }
            return 200;
          })
          .strength(0.5));
      }

      // Create links
      const link = g.append('g')
        .selectAll('line')
        .data(networkData.edges)
        .enter()
        .append('line')
        .attr('stroke', (d: any) => {
          if (d.type === 'faculty-topic') return '#3b82f6';
          if (d.type === 'faculty-faculty') return '#10b981';
          return '#94a3b8';
        })
        .attr('stroke-opacity', 0.8)
        .attr('stroke-width', d => linkScale(d.weight))
        .attr('stroke-dasharray', (d: any) => d.type === 'faculty-topic' ? '5,5' : 'none');

      // Create nodes
      const node = g.append('g')
        .selectAll('circle')
        .data(networkData.nodes)
        .enter()
        .append('circle')
        .attr('r', d => sizeScale(d.size))
        .attr('fill', d => {
          if (d.id === selectedFacultyEmail) return '#1f2937'; // Central node is dark
          return d.color;
        })
        .attr('stroke', d => d.id === selectedFacultyEmail ? '#fbbf24' : '#fff')
        .attr('stroke-width', d => d.id === selectedFacultyEmail ? 4 : 2)
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
          if (d.type === 'topic') return d.name;
          const parts = d.name.split(' ');
          return parts.length > 1 ? `${parts[0]} ${parts[parts.length - 1]}` : d.name;
        })
        .style('font-size', d => d.id === selectedFacultyEmail ? '14px' : '11px')
        .style('font-weight', d => d.id === selectedFacultyEmail ? 'bold' : 'normal')
        .style('fill', d => d.id === selectedFacultyEmail ? '#1f2937' : '#374151')
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
            .attr('stroke-width', d.id === selectedFacultyEmail ? 6 : 4)
            .attr('stroke', d.id === selectedFacultyEmail ? '#f59e0b' : '#1f2937');

          // Show tooltip
          const tooltip = d3.select('body').append('div')
            .attr('class', 'ego-tooltip')
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
            .style('max-width', '320px');

          tooltip.transition().duration(200).style('opacity', 1);
          
          let tooltipContent = '';
          
          if (d.type === 'topic') {
            tooltipContent = `
              <div style="margin-bottom: 12px;">
                <strong>🎯 ${d.name}</strong>
              </div>
              <div style="margin-bottom: 8px;">
                Expertise Level: ${d.size}
              </div>
              <div style="font-size: 12px; color: #ccc;">
                Research area of interest
              </div>
            `;
          } else {
            const facultyData = d.data as Faculty;
            const isCentral = d.id === selectedFacultyEmail;
            
            tooltipContent = `
              <div style="margin-bottom: 12px;">
                <strong>${isCentral ? '🌟 ' : '🤝 '}${d.name}</strong>
              </div>
              <div style="margin-bottom: 8px;">
                ${isCentral ? 'Central Faculty' : `Collaboration Score: ${d.size}`}
              </div>
              <div style="margin-bottom: 8px;">
                🏛️ ${facultyData.school || 'Unknown School'}
              </div>
              ${facultyData.department ? `<div style="margin-bottom: 8px;">📍 ${facultyData.department}</div>` : ''}
              ${facultyData.job_title ? `<div style="margin-bottom: 8px;">💼 ${facultyData.job_title}</div>` : ''}
              ${!isCentral ? '<div style="font-size: 11px; color: #999; margin-top: 12px;">Potential collaborator</div>' : ''}
            `;
          }
          
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
            .attr('stroke-width', d.id === selectedFacultyEmail ? 4 : 2)
            .attr('stroke', d.id === selectedFacultyEmail ? '#fbbf24' : '#fff');

          // Remove tooltip
          d3.selectAll('.ego-tooltip').remove();
        })
        .on('click', function(event, d) {
          console.log('🎯 Node clicked:', d.name, 'Type:', d.type);
          setSelectedNode(d);
        });

      // Update positions on simulation tick
      simulation.on('tick', () => {
        link
          .attr('x1', (d: any) => d.source.x)
          .attr('y1', (d: any) => d.source.y)
          .attr('x2', (d: any) => d.target.x)
          .attr('y2', (d: any) => d.target.y);

        node
          .attr('cx', (d: any) => d.x)
          .attr('cy', (d: any) => d.y);

        labels
          .attr('x', (d: any) => d.x)
          .attr('y', (d: any) => d.y + 4);
      });

      // Add zoom behavior
      const zoom = d3.zoom<SVGSVGElement, unknown>()
        .scaleExtent([0.3, 4])
        .on('zoom', (event) => {
          g.attr('transform', event.transform);
        });

      svg.call(zoom as any);

      // Add legend
      const legend = g.append('g')
        .attr('transform', `translate(20, 20)`);

      const legendData = [
        { color: '#1f2937', label: 'Central Faculty', type: 'central' },
        { color: '#3b82f6', label: 'Research Topics', type: 'topic' },
        { color: '#10b981', label: 'Collaborators', type: 'faculty' }
      ];

      legend.selectAll('circle')
        .data(legendData)
        .enter()
        .append('circle')
        .attr('cx', 0)
        .attr('cy', (d, i) => i * 22)
        .attr('r', 6)
        .attr('fill', d => d.color)
        .attr('stroke', '#fff')
        .attr('stroke-width', 1);

      legend.selectAll('text')
        .data(legendData)
        .enter()
        .append('text')
        .attr('x', 15)
        .attr('y', (d, i) => i * 22 + 4)
        .text(d => d.label)
        .style('font-size', '12px')
        .style('fill', '#333');

      // Add connection type legend
      const connectionLegend = g.append('g')
        .attr('transform', `translate(20, 90)`);

      const connectionTypes = [
        { stroke: '#3b82f6', dashArray: '5,5', label: 'Expertise Connection' },
        { stroke: '#10b981', dashArray: 'none', label: 'Collaboration Potential' }
      ];

      connectionLegend.selectAll('line')
        .data(connectionTypes)
        .enter()
        .append('line')
        .attr('x1', 0)
        .attr('y1', (d, i) => i * 22 + 3)
        .attr('x2', 20)
        .attr('y2', (d, i) => i * 22 + 3)
        .attr('stroke', d => d.stroke)
        .attr('stroke-width', 3)
        .attr('stroke-dasharray', d => d.dashArray);

      connectionLegend.selectAll('text')
        .data(connectionTypes)
        .enter()
        .append('text')
        .attr('x', 25)
        .attr('y', (d, i) => i * 22 + 7)
        .text(d => d.label)
        .style('font-size', '12px')
        .style('fill', '#333');
        
      console.log('✅ Ego network rendering completed successfully');
      
    } catch (error) {
      console.error('❌ Error rendering ego network:', error);
      setError(`Rendering failed: ${error}`);
    }
  }, [networkData, selectedFacultyEmail, setSelectedNode]);

  useEffect(() => {
    if (faculty.length > 0 && topics.length > 0 && selectedFacultyEmail) {
      console.log('🔄 Generating ego network for faculty:', selectedFacultyEmail);
      
      try {
        const processor = new NetworkDataProcessor(faculty, topics);
        processor.setExpertiseThreshold(1);
        
        const data = processor.generateFacultyEgoNetwork(selectedFacultyEmail);
        console.log('✅ Generated ego network data:', {
          nodeCount: data.nodes.length,
          edgeCount: data.edges.length,
          facultyEmail: selectedFacultyEmail
        });
        
        setNetworkData(data);
        setError(null);
      } catch (error) {
        console.error('❌ Error generating ego network:', error);
        setError(`Failed to generate ego network: ${error}`);
      }
      
      setLoading(false);
    }
  }, [faculty, topics, selectedFacultyEmail]);

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
          <div className="text-gray-500 mt-4">Loading collaboration network...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">Ego Network Error</div>
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

  const centralFaculty = faculty.find(f => f.email === selectedFacultyEmail);

  return (
    <div className={`relative ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Collaboration Network: {centralFaculty ? `${centralFaculty.first_name} ${centralFaculty.last_name}` : 'Unknown Faculty'}
          </h3>
          <p className="text-sm text-gray-600">
            Personal network showing research expertise and potential collaborators.
            Central node = selected faculty, connected topics = research areas, outer nodes = potential collaborators.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {networkData.nodes.length} nodes • {networkData.edges.length} connections
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
          <h4 className="font-semibold text-blue-900">
            {selectedNode.type === 'topic' ? '🎯 ' : '👤 '}{selectedNode.name}
          </h4>
          <p className="text-sm text-blue-700 mt-1">
            {selectedNode.type === 'topic' 
              ? `Research area with expertise level ${selectedNode.size}`
              : selectedNode.id === selectedFacultyEmail
                ? 'Central faculty member'
                : `Potential collaborator (score: ${selectedNode.size})`
            }
          </p>
        </div>
      )}
    </div>
  );
};