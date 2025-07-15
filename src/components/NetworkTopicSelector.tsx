import React, { useEffect, useRef, useState } from 'react'
import * as d3 from 'd3'
import { ResearchTopic } from '../types'
import { useFacultyTopicCounts } from '../hooks/useFacultyTopicCounts'
import { useTopicRelationships } from '../hooks/useTopicRelationships'

interface NetworkTopicSelectorProps {
  topics: ResearchTopic[]
  selectedTopics: string[]
  onTopicToggle: (topicKey: string) => void
  maxSelections?: number
}

interface NetworkNode extends d3.SimulationNodeDatum {
  id: string
  topic: ResearchTopic
  selected: boolean
  facultyCount?: number
}

interface NetworkLink extends d3.SimulationLinkDatum<NetworkNode> {
  source: string | NetworkNode
  target: string | NetworkNode
  strength: number
}

export const NetworkTopicSelector: React.FC<NetworkTopicSelectorProps> = ({
  topics,
  selectedTopics,
  onTopicToggle,
  maxSelections = 3
}) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [dimensions, setDimensions] = useState({ width: 500, height: 400 })
  const { getTopicCount, loading: countsLoading } = useFacultyTopicCounts()
  const { relationships, loading: relationshipsLoading } = useTopicRelationships()



  // Color function based on category
  const getNodeColor = (node: NetworkNode): string => {
    if (node.selected) return '#3B82F6' // Blue for selected
    
    switch (node.topic.category) {
      case 'environmental':
        return '#10B981' // Green
      case 'social':
        return '#F59E0B' // Orange
      case 'solutions':
        return '#8B5CF6' // Purple
      default:
        return '#6B7280' // Gray
    }
  }

  // Get node size based on faculty count
  const getNodeSize = (node: NetworkNode): number => {
    const baseSize = 6
    const maxSize = 12
    return baseSize + (node.facultyCount || 0) / 10 * (maxSize - baseSize)
  }

  useEffect(() => {
    if (!svgRef.current || topics.length === 0 || countsLoading || relationshipsLoading) return

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove() // Clear previous render

    const { width, height } = dimensions
    
    // Add zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform)
      })
    
    svg.call(zoom)
    
    // Create main group for all graph elements
    const g = svg.append('g')
      .attr('class', 'graph-container')
    
    // Create nodes from topics (inline to fix dependency issue)
    const nodes: NetworkNode[] = topics.map(topic => ({
      id: topic.topic_key,
      topic,
      selected: selectedTopics.includes(topic.topic_key),
      facultyCount: getTopicCount(topic.topic_key)
    }))
    
    // Convert relationship data to network links
    const links: NetworkLink[] = relationships.map(rel => ({
      source: rel.source,
      target: rel.target,
      strength: rel.strength
    }))

    // Create force simulation with improved category clustering
    const simulation = d3.forceSimulation<NetworkNode>(nodes)
      .force('link', d3.forceLink<NetworkNode, NetworkLink>(links)
        .id(d => d.id)
        .distance(d => d.strength > 0.6 ? 50 : 100) // Adjust distances for cleaner layout
        .strength(d => d.strength * 0.7) // Reduce link strength for gentler clustering
      )
      .force('charge', d3.forceManyBody().strength(-120)) // Increase repulsion for better separation
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => getNodeSize(d as NetworkNode) + 8))
      
      // Enhanced category clustering forces with better positioning
      .force('categoryX', d3.forceX<NetworkNode>(d => {
        switch (d.topic.category) {
          case 'environmental': return width * 0.25  // Left side
          case 'social': return width * 0.75        // Right side
          case 'solutions': return width * 0.5      // Center
          default: return width * 0.5
        }
      }).strength(0.3)) // Increased strength for better clustering
      .force('categoryY', d3.forceY<NetworkNode>(d => {
        switch (d.topic.category) {
          case 'environmental': return height * 0.35 // Upper left
          case 'social': return height * 0.35       // Upper right
          case 'solutions': return height * 0.65    // Lower center
          default: return height * 0.5
        }
      }).strength(0.25)) // Increased strength for better vertical separation

    // Create links with cleaner, more subtle styling
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', '#E5E7EB') // Lighter gray for subtlety
      .attr('stroke-width', d => {
        // Thinner lines based on strength
        if (d.strength > 0.6) return 2
        if (d.strength > 0.4) return 1.5
        return 1
      })
      .attr('opacity', d => {
        // More subtle opacity gradation
        if (d.strength > 0.6) return 0.4
        if (d.strength > 0.4) return 0.25
        return 0.15
      })
      .attr('stroke-dasharray', d => d.strength < 0.4 ? '3,3' : 'none') // Dashed for weak connections

    // Create nodes
    const node = g.append('g')
      .attr('class', 'nodes')
      .selectAll('g')
      .data(nodes)
      .enter().append('g')
      .attr('class', 'node')
      .style('cursor', 'pointer')
      .call(d3.drag<SVGGElement, NetworkNode>()
        .on('start', dragstarted)
        .on('drag', dragged)
        .on('end', dragended)
      )

    // Add circles to nodes
    node.append('circle')
      .attr('r', d => getNodeSize(d))
      .attr('fill', d => getNodeColor(d))
      .attr('stroke', '#fff')
      .attr('stroke-width', 2)
      .style('transition', 'all 0.3s ease')

    // Add labels to nodes
    node.append('text')
      .text(d => d.topic.display_name)
      .attr('font-size', '10px')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('fill', '#374151')
      .style('pointer-events', 'none')
      .style('font-weight', d => d.selected ? 'bold' : 'normal')

    // Add click handler
    node.on('click', (event, d) => {
      event.stopPropagation()
      
      // Check if we can select more topics
      const canSelectMore = selectedTopics.length < maxSelections
      const isSelected = selectedTopics.includes(d.topic.topic_key)
      
      if (isSelected || canSelectMore) {
        onTopicToggle(d.topic.topic_key)
      }
    })

    // Add hover effects
    node.on('mouseover', (event, d) => {
      // Highlight connected nodes
      const connectedNodes = new Set<string>()
      links.forEach(link => {
        if (link.source === d.id || (typeof link.source === 'object' && link.source.id === d.id)) {
          connectedNodes.add(typeof link.target === 'string' ? link.target : link.target.id)
        }
        if (link.target === d.id || (typeof link.target === 'object' && link.target.id === d.id)) {
          connectedNodes.add(typeof link.source === 'string' ? link.source : link.source.id)
        }
      })

      // Update node appearances
      node.select('circle')
        .attr('opacity', n => n.id === d.id || connectedNodes.has(n.id) ? 1 : 0.3)
      
      // Update link appearances with better contrast
      link.attr('opacity', l => {
        const sourceId = typeof l.source === 'string' ? l.source : l.source.id
        const targetId = typeof l.target === 'string' ? l.target : l.target.id
        return sourceId === d.id || targetId === d.id ? 0.7 : 0.05
      })
      .attr('stroke-width', l => {
        const sourceId = typeof l.source === 'string' ? l.source : l.source.id
        const targetId = typeof l.target === 'string' ? l.target : l.target.id
        const isConnected = sourceId === d.id || targetId === d.id
        return isConnected ? 3 : 1
      })
    })

    node.on('mouseout', () => {
      // Reset appearances to default styling
      node.select('circle').attr('opacity', 1)
      link.attr('opacity', d => {
        // Restore original opacity based on strength
        if (d.strength > 0.6) return 0.4
        if (d.strength > 0.4) return 0.25
        return 0.15
      })
      .attr('stroke-width', d => {
        // Restore original stroke width
        if (d.strength > 0.6) return 2
        if (d.strength > 0.4) return 1.5
        return 1
      })
    })

    // Update simulation
    simulation.on('tick', () => {
      link
        .attr('x1', d => (d.source as NetworkNode).x!)
        .attr('y1', d => (d.source as NetworkNode).y!)
        .attr('x2', d => (d.target as NetworkNode).x!)
        .attr('y2', d => (d.target as NetworkNode).y!)

      node
        .attr('transform', d => `translate(${d.x},${d.y})`)
    })

    // Drag functions
    function dragstarted(event: d3.D3DragEvent<SVGGElement, NetworkNode, NetworkNode>) {
      if (!event.active) simulation.alphaTarget(0.3).restart()
      event.subject.fx = event.subject.x
      event.subject.fy = event.subject.y
      event.sourceEvent.stopPropagation() // Prevent zoom when dragging nodes
    }

    function dragged(event: d3.D3DragEvent<SVGGElement, NetworkNode, NetworkNode>) {
      event.subject.fx = event.x
      event.subject.fy = event.y
    }

    function dragended(event: d3.D3DragEvent<SVGGElement, NetworkNode, NetworkNode>) {
      if (!event.active) simulation.alphaTarget(0)
      event.subject.fx = null
      event.subject.fy = null
    }

    // Add reset zoom functionality
    const resetZoom = () => {
      svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity)
    }

    // Store reset function for external access
    ;(svg.node() as any).resetZoom = resetZoom

    // Cleanup
    return () => {
      simulation.stop()
    }
  }, [topics, selectedTopics, dimensions, onTopicToggle, maxSelections, countsLoading, relationshipsLoading, getTopicCount, relationships])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const rect = svgRef.current.parentElement?.getBoundingClientRect()
        if (rect) {
          setDimensions({
            width: rect.width,
            height: Math.min(rect.height, 500)
          })
        }
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <div className="flex items-center justify-between">
          <div className="text-center flex-1">
            <h3 className="text-lg font-semibold text-slate-900">Research Network</h3>
            <p className="text-sm text-slate-600 mt-1">
              Click topics to select • Drag to explore • Scroll to zoom • Hover to see connections
            </p>
            {selectedTopics.length > 0 && (
              <p className="text-sm text-blue-600 mt-2">
                {selectedTopics.length} of {maxSelections} topics selected
              </p>
            )}
          </div>
          <button
            onClick={() => {
              const svg = svgRef.current
              if (svg && (svg as any).resetZoom) {
                (svg as any).resetZoom()
              }
            }}
            className="ml-4 px-3 py-1 text-xs bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-md transition-colors"
          >
            Reset Zoom
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-slate-200 p-4" style={{ height: '400px' }}>
        {(countsLoading || relationshipsLoading) ? (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              <div className="text-slate-500 mt-4">Loading network data...</div>
            </div>
          </div>
        ) : (
          <svg
            ref={svgRef}
            width={dimensions.width}
            height={dimensions.height}
            style={{ width: '100%', height: '100%' }}
          />
        )}
      </div>
      
      <div className="mt-4 flex justify-center space-x-6 text-xs text-slate-500">
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span>Environmental</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-orange-500 rounded-full"></div>
          <span>Social</span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <span>Solutions</span>
        </div>
      </div>
    </div>
  )
}