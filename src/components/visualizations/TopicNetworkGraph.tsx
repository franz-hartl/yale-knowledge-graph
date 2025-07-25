import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { NetworkData, NetworkNode, NetworkDataProcessor } from '../../utils/networkDataProcessor';
import { Faculty, ResearchTopic } from '../../types';

interface TopicNetworkGraphProps {
  faculty: Faculty[];
  topics: ResearchTopic[];
  onTopicSelect?: (topicKey: string) => void;
  className?: string;
}

export const TopicNetworkGraph: React.FC<TopicNetworkGraphProps> = ({
  faculty,
  topics,
  onTopicSelect,
  className = ''
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [networkData, setNetworkData] = useState<NetworkData>({ nodes: [], edges: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null);

  const renderNetwork = useCallback(() => {
    try {
      console.log('🎨 Rendering network with', networkData.nodes.length, 'nodes and', networkData.edges.length, 'edges');
      
      const svg = d3.select(svgRef.current);
      if (!svg.node()) {
        console.error('❌ SVG ref not available');
        return;
      }
      
      svg.selectAll('*').remove(); // Clear previous render

      const width = 800;
      const height = 600;
      const margin = { top: 20, right: 20, bottom: 20, left: 20 };

    svg.attr('width', width).attr('height', height);

    const g = svg.append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create scales
    const sizeScale = d3.scaleLinear()
      .domain(d3.extent(networkData.nodes, d => d.size) as [number, number])
      .range([8, 40]);

    const linkScale = d3.scaleLinear()
      .domain(networkData.edges.length > 0 ? d3.extent(networkData.edges, d => d.weight) as [number, number] : [0, 1])
      .range([1, 5]);

    // Create force simulation
    const simulation = d3.forceSimulation(networkData.nodes as any);
    
    // Only add link force if there are edges
    if (networkData.edges.length > 0) {
      simulation.force('link', d3.forceLink(networkData.edges)
        .id((d: any) => d.id)
        .distance(120)
        .strength(0.3));
    }
    
    simulation
      .force('charge', d3.forceManyBody().strength(-400))
      .force('center', d3.forceCenter(innerWidth / 2, innerHeight / 2))
      .force('collision', d3.forceCollide().radius((d: any) => sizeScale(d.size) + 10));

    // Create links (only if there are edges)
    const link = g.append('g')
      .selectAll('line')
      .data(networkData.edges)
      .enter()
      .append('line')
      .attr('stroke', '#999')
      .attr('stroke-opacity', 0.6)
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
      .text(d => d.name)
      .style('font-size', '12px')
      .style('font-weight', 'bold')
      .style('fill', '#333')
      .style('text-anchor', 'middle')
      .style('pointer-events', 'none');

    // Add hover and click interactions
    node
      .on('mouseover', function(event, d) {
        // Highlight node
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', sizeScale(d.size) + 6)
          .attr('stroke-width', 4)
          .attr('stroke', '#1f2937');

        // Show tooltip
        const tooltip = d3.select('body').append('div')
          .attr('class', 'network-tooltip')
          .style('position', 'absolute')
          .style('background', 'rgba(0, 0, 0, 0.9)')
          .style('color', 'white')
          .style('padding', '12px')
          .style('border-radius', '6px')
          .style('font-size', '14px')
          .style('font-weight', 'bold')
          .style('pointer-events', 'none')
          .style('opacity', 0)
          .style('box-shadow', '0 4px 8px rgba(0,0,0,0.2)')
          .style('z-index', '9999');

        tooltip.transition().duration(200).style('opacity', 1);
        
        const topicData = d.data as any;
        const tooltipContent = `
          <div style="margin-bottom: 8px;">
            <strong>${d.name}</strong>
          </div>
          <div style="margin-bottom: 4px;">
            👥 ${d.size} faculty with expertise
          </div>
          <div style="font-size: 12px; color: #ccc;">
            Category: ${topicData.category || 'Unknown'}
          </div>
          <div style="font-size: 11px; color: #999; margin-top: 8px;">
            Click to explore faculty →
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
        d3.selectAll('.network-tooltip').remove();
      })
      .on('click', function(event, d) {
        console.log('🎯 Topic clicked:', d.name, 'Faculty count:', d.size);
        setSelectedNode(d);
        if (onTopicSelect && d.type === 'topic') {
          onTopicSelect(d.id);
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
        .attr('y', (d: any) => d.y + 5);
    });

    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    svg.call(zoom as any);

    // Add legend
    const legend = g.append('g')
      .attr('transform', `translate(${innerWidth - 150}, 20)`);

    const legendData = [
      { color: '#10b981', label: 'Environmental' },
      { color: '#f59e0b', label: 'Social' },
      { color: '#8b5cf6', label: 'Solutions' }
    ];

    legend.selectAll('circle')
      .data(legendData)
      .enter()
      .append('circle')
      .attr('cx', 0)
      .attr('cy', (d, i) => i * 20)
      .attr('r', 6)
      .attr('fill', d => d.color);

    legend.selectAll('text')
      .data(legendData)
      .enter()
      .append('text')
      .attr('x', 15)
      .attr('y', (d, i) => i * 20 + 4)
      .text(d => d.label)
      .style('font-size', '12px')
      .style('fill', '#333');
      
      console.log('✅ Network rendering completed successfully');
      
    } catch (error) {
      console.error('❌ Error rendering network:', error);
      setError(`Rendering failed: ${error}`);
    }
  }, [networkData, onTopicSelect, setSelectedNode]);

  useEffect(() => {
    if (faculty.length > 0 && topics.length > 0) {
      console.log('🔄 Generating topic network with', faculty.length, 'faculty and', topics.length, 'topics');
      
      try {
        const processor = new NetworkDataProcessor(faculty, topics);
        processor.setExpertiseThreshold(1); // Lower threshold to show more connections
        
        const data = processor.generateTopicNetwork();
        console.log('✅ Generated network data:', {
          nodeCount: data.nodes.length,
          edgeCount: data.edges.length,
          nodes: data.nodes.map(n => ({ id: n.id, name: n.name, size: n.size })),
          edges: data.edges.map(e => ({ source: e.source, target: e.target, weight: e.weight }))
        });
        
        if (data.nodes.length === 0) {
          console.error('❌ No nodes generated - check topic data');
          setError('No topics found to display');
        } else {
          setNetworkData(data);
          setError(null);
        }
      } catch (error) {
        console.error('❌ Error generating network data:', error);
        setError(`Failed to generate network: ${error}`);
      }
      
      setLoading(false);
    }
  }, [faculty, topics]);

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
          <div className="text-gray-500 mt-4">Processing network data...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`flex items-center justify-center h-96 ${className}`}>
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">Network Generation Error</div>
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

  return (
    <div className={`relative ${className}`}>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Topic Network</h3>
          <p className="text-sm text-gray-600">
            Topics connected by shared faculty expertise. Node size = faculty count, edge thickness = connection strength.
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-sm text-gray-500">
            {networkData.nodes.length} topics • {networkData.edges.length} connections
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
            {selectedNode.size} faculty with expertise in this area
          </p>
          {onTopicSelect && (
            <button
              onClick={() => onTopicSelect(selectedNode.id)}
              className="mt-2 px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700 transition-colors"
            >
              View Faculty Network
            </button>
          )}
        </div>
      )}
    </div>
  );
};