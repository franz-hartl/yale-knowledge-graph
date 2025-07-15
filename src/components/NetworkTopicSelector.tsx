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
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 })
  const [searchTerm, setSearchTerm] = useState('')
  const [highlightedNodes, setHighlightedNodes] = useState<string[]>([])
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

    // Create force simulation with dynamic reorganization based on selections
    const simulation = d3.forceSimulation<NetworkNode>(nodes)
      .force('link', d3.forceLink<NetworkNode, NetworkLink>(links)
        .id(d => d.id)
        .distance(d => d.strength > 0.6 ? 50 : 100) // Adjust distances for cleaner layout
        .strength(d => d.strength * 0.7) // Reduce link strength for gentler clustering
      )
      .force('charge', d3.forceManyBody().strength(-120)) // Increase repulsion for better separation
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius((d: any) => getNodeSize(d as NetworkNode) + 8))
      
      // Dynamic forces that change based on selections
      .force('categoryX', d3.forceX<NetworkNode>(d => {
        // If topics are selected, bring selected topics more toward center
        if (selectedTopics.length > 0) {
          if (d.selected) {
            return width * 0.5 // Center selected topics
          }
          // Push non-selected topics slightly outward
          switch (d.topic.category) {
            case 'environmental': return width * 0.2
            case 'social': return width * 0.8
            case 'solutions': return width * 0.5
            default: return width * 0.5
          }
        }
        // Default positioning when no selections
        switch (d.topic.category) {
          case 'environmental': return width * 0.25
          case 'social': return width * 0.75
          case 'solutions': return width * 0.5
          default: return width * 0.5
        }
      }).strength(selectedTopics.length > 0 ? 0.4 : 0.3))
      
      .force('categoryY', d3.forceY<NetworkNode>(d => {
        // If topics are selected, bring selected topics more toward center
        if (selectedTopics.length > 0) {
          if (d.selected) {
            return height * 0.4 // Center selected topics vertically
          }
          // Push non-selected topics slightly outward
          switch (d.topic.category) {
            case 'environmental': return height * 0.25
            case 'social': return height * 0.25
            case 'solutions': return height * 0.75
            default: return height * 0.5
          }
        }
        // Default positioning when no selections
        switch (d.topic.category) {
          case 'environmental': return height * 0.35
          case 'social': return height * 0.35
          case 'solutions': return height * 0.65
          default: return height * 0.5
        }
      }).strength(selectedTopics.length > 0 ? 0.3 : 0.25))
      
      // Add selection-based attraction force
      .force('selection', d3.forceRadial<NetworkNode>(d => {
        if (selectedTopics.length > 0 && d.selected) {
          return 80 // Attract selected topics closer to center
        }
        return 0
      }, width / 2, height / 2).strength(d => d.selected ? 0.3 : 0))

    // Create links with dynamic styling based on selections
    const link = g.append('g')
      .attr('class', 'links')
      .selectAll('line')
      .data(links)
      .enter().append('line')
      .attr('stroke', d => {
        // Highlight connections involving selected topics
        if (selectedTopics.length > 0) {
          const sourceSelected = selectedTopics.includes(typeof d.source === 'string' ? d.source : d.source.id)
          const targetSelected = selectedTopics.includes(typeof d.target === 'string' ? d.target : d.target.id)
          if (sourceSelected || targetSelected) {
            return '#3B82F6' // Blue for connections to selected topics
          }
          return '#E5E7EB' // Gray for other connections
        }
        return '#E5E7EB' // Default gray
      })
      .attr('stroke-width', d => {
        // Thicker lines for connections to selected topics
        if (selectedTopics.length > 0) {
          const sourceSelected = selectedTopics.includes(typeof d.source === 'string' ? d.source : d.source.id)
          const targetSelected = selectedTopics.includes(typeof d.target === 'string' ? d.target : d.target.id)
          if (sourceSelected || targetSelected) {
            return d.strength > 0.6 ? 3 : 2
          }
        }
        // Default thickness based on strength
        if (d.strength > 0.6) return 2
        if (d.strength > 0.4) return 1.5
        return 1
      })
      .attr('opacity', d => {
        // Higher opacity for connections to selected topics
        if (selectedTopics.length > 0) {
          const sourceSelected = selectedTopics.includes(typeof d.source === 'string' ? d.source : d.source.id)
          const targetSelected = selectedTopics.includes(typeof d.target === 'string' ? d.target : d.target.id)
          if (sourceSelected || targetSelected) {
            return d.strength > 0.6 ? 0.7 : 0.5
          }
          return 0.1 // Dim other connections
        }
        // Default opacity based on strength
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

    // Add circles to nodes with enhanced selection styling
    node.append('circle')
      .attr('r', d => getNodeSize(d))
      .attr('fill', d => getNodeColor(d))
      .attr('stroke', d => {
        if (d.selected) return '#1E40AF' // Darker blue border for selected
        if (highlightedNodes.includes(d.id)) return '#F59E0B' // Orange border for search results
        if (selectedTopics.length > 0) {
          // Check if node is connected to selected topics
          const isConnected = links.some(link => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id
            const targetId = typeof link.target === 'string' ? link.target : link.target.id
            return (sourceId === d.id && selectedTopics.includes(targetId)) ||
                   (targetId === d.id && selectedTopics.includes(sourceId))
          })
          return isConnected ? '#3B82F6' : '#E5E7EB'
        }
        return '#fff'
      })
      .attr('stroke-width', d => {
        if (d.selected) return 3
        if (highlightedNodes.includes(d.id)) return 2 // Thicker border for search results
        if (selectedTopics.length > 0) {
          // Check if node is connected to selected topics
          const isConnected = links.some(link => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id
            const targetId = typeof link.target === 'string' ? link.target : link.target.id
            return (sourceId === d.id && selectedTopics.includes(targetId)) ||
                   (targetId === d.id && selectedTopics.includes(sourceId))
          })
          return isConnected ? 2 : 1
        }
        return 2
      })
      .attr('opacity', d => {
        if (d.selected) return 1
        if (highlightedNodes.includes(d.id)) return 1 // Full opacity for search results
        if (selectedTopics.length > 0) {
          // Check if node is connected to selected topics
          const isConnected = links.some(link => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id
            const targetId = typeof link.target === 'string' ? link.target : link.target.id
            return (sourceId === d.id && selectedTopics.includes(targetId)) ||
                   (targetId === d.id && selectedTopics.includes(sourceId))
          })
          return isConnected ? 0.9 : 0.4
        }
        if (highlightedNodes.length > 0 && !highlightedNodes.includes(d.id)) {
          return 0.3 // Dim non-matching nodes during search
        }
        return 1
      })
      .style('transition', 'all 0.3s ease')

    // Add labels to nodes with dynamic styling
    node.append('text')
      .text(d => d.topic.display_name)
      .attr('font-size', d => {
        if (d.selected) return '11px'
        if (selectedTopics.length > 0) {
          // Check if node is connected to selected topics
          const isConnected = links.some(link => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id
            const targetId = typeof link.target === 'string' ? link.target : link.target.id
            return (sourceId === d.id && selectedTopics.includes(targetId)) ||
                   (targetId === d.id && selectedTopics.includes(sourceId))
          })
          return isConnected ? '10px' : '9px'
        }
        return '10px'
      })
      .attr('text-anchor', 'middle')
      .attr('dy', '0.3em')
      .attr('fill', d => {
        if (d.selected) return '#1E40AF'
        if (highlightedNodes.includes(d.id)) return '#F59E0B' // Orange text for search results
        if (selectedTopics.length > 0) {
          // Check if node is connected to selected topics
          const isConnected = links.some(link => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id
            const targetId = typeof link.target === 'string' ? link.target : link.target.id
            return (sourceId === d.id && selectedTopics.includes(targetId)) ||
                   (targetId === d.id && selectedTopics.includes(sourceId))
          })
          return isConnected ? '#374151' : '#9CA3AF'
        }
        return '#374151'
      })
      .style('pointer-events', 'none')
      .style('font-weight', d => {
        if (d.selected) return 'bold'
        if (highlightedNodes.includes(d.id)) return 'medium' // Medium weight for search results
        if (selectedTopics.length > 0) {
          // Check if node is connected to selected topics
          const isConnected = links.some(link => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id
            const targetId = typeof link.target === 'string' ? link.target : link.target.id
            return (sourceId === d.id && selectedTopics.includes(targetId)) ||
                   (targetId === d.id && selectedTopics.includes(sourceId))
          })
          return isConnected ? 'medium' : 'normal'
        }
        return 'normal'
      })
      .style('opacity', d => {
        if (d.selected) return 1
        if (highlightedNodes.includes(d.id)) return 1 // Full opacity for search results
        if (selectedTopics.length > 0) {
          // Check if node is connected to selected topics
          const isConnected = links.some(link => {
            const sourceId = typeof link.source === 'string' ? link.source : link.source.id
            const targetId = typeof link.target === 'string' ? link.target : link.target.id
            return (sourceId === d.id && selectedTopics.includes(targetId)) ||
                   (targetId === d.id && selectedTopics.includes(sourceId))
          })
          return isConnected ? 1 : 0.6
        }
        if (highlightedNodes.length > 0 && !highlightedNodes.includes(d.id)) {
          return 0.4 // Dim non-matching labels during search
        }
        return 1
      })
      .style('transition', 'all 0.3s ease')

    // Add click handler with dynamic reorganization
    node.on('click', (event, d) => {
      event.stopPropagation()
      
      // Check if we can select more topics
      const canSelectMore = selectedTopics.length < maxSelections
      const isSelected = selectedTopics.includes(d.topic.topic_key)
      
      if (isSelected || canSelectMore) {
        onTopicToggle(d.topic.topic_key)
        
        // Trigger smooth reorganization
        setTimeout(() => {
          simulation.alpha(0.3).restart()
        }, 100)
      }
    })
    
    // Function to update visual states when selections change
    const updateSelectionStates = () => {
      // Update node appearances
      node.select('circle')
        .transition()
        .duration(300)
        .attr('stroke', d => {
          if (d.selected) return '#1E40AF'
          if (selectedTopics.length > 0) {
            const isConnected = links.some(link => {
              const sourceId = typeof link.source === 'string' ? link.source : link.source.id
              const targetId = typeof link.target === 'string' ? link.target : link.target.id
              return (sourceId === d.id && selectedTopics.includes(targetId)) ||
                     (targetId === d.id && selectedTopics.includes(sourceId))
            })
            return isConnected ? '#3B82F6' : '#E5E7EB'
          }
          return '#fff'
        })
        .attr('stroke-width', d => {
          if (d.selected) return 3
          if (selectedTopics.length > 0) {
            const isConnected = links.some(link => {
              const sourceId = typeof link.source === 'string' ? link.source : link.source.id
              const targetId = typeof link.target === 'string' ? link.target : link.target.id
              return (sourceId === d.id && selectedTopics.includes(targetId)) ||
                     (targetId === d.id && selectedTopics.includes(sourceId))
            })
            return isConnected ? 2 : 1
          }
          return 2
        })
        .attr('opacity', d => {
          if (d.selected) return 1
          if (selectedTopics.length > 0) {
            const isConnected = links.some(link => {
              const sourceId = typeof link.source === 'string' ? link.source : link.source.id
              const targetId = typeof link.target === 'string' ? link.target : link.target.id
              return (sourceId === d.id && selectedTopics.includes(targetId)) ||
                     (targetId === d.id && selectedTopics.includes(sourceId))
            })
            return isConnected ? 0.9 : 0.4
          }
          return 1
        })
      
      // Update link appearances
      link.transition()
        .duration(300)
        .attr('stroke', d => {
          if (selectedTopics.length > 0) {
            const sourceSelected = selectedTopics.includes(typeof d.source === 'string' ? d.source : d.source.id)
            const targetSelected = selectedTopics.includes(typeof d.target === 'string' ? d.target : d.target.id)
            if (sourceSelected || targetSelected) {
              return '#3B82F6'
            }
            return '#E5E7EB'
          }
          return '#E5E7EB'
        })
        .attr('opacity', d => {
          if (selectedTopics.length > 0) {
            const sourceSelected = selectedTopics.includes(typeof d.source === 'string' ? d.source : d.source.id)
            const targetSelected = selectedTopics.includes(typeof d.target === 'string' ? d.target : d.target.id)
            if (sourceSelected || targetSelected) {
              return d.strength > 0.6 ? 0.7 : 0.5
            }
            return 0.1
          }
          if (d.strength > 0.6) return 0.4
          if (d.strength > 0.4) return 0.25
          return 0.15
        })
        .attr('stroke-width', d => {
          if (selectedTopics.length > 0) {
            const sourceSelected = selectedTopics.includes(typeof d.source === 'string' ? d.source : d.source.id)
            const targetSelected = selectedTopics.includes(typeof d.target === 'string' ? d.target : d.target.id)
            if (sourceSelected || targetSelected) {
              return d.strength > 0.6 ? 3 : 2
            }
          }
          if (d.strength > 0.6) return 2
          if (d.strength > 0.4) return 1.5
          return 1
        })
      
      // Update text labels
      node.select('text')
        .transition()
        .duration(300)
        .attr('fill', d => {
          if (d.selected) return '#1E40AF'
          if (selectedTopics.length > 0) {
            const isConnected = links.some(link => {
              const sourceId = typeof link.source === 'string' ? link.source : link.source.id
              const targetId = typeof link.target === 'string' ? link.target : link.target.id
              return (sourceId === d.id && selectedTopics.includes(targetId)) ||
                     (targetId === d.id && selectedTopics.includes(sourceId))
            })
            return isConnected ? '#374151' : '#9CA3AF'
          }
          return '#374151'
        })
        .style('opacity', d => {
          if (d.selected) return 1
          if (selectedTopics.length > 0) {
            const isConnected = links.some(link => {
              const sourceId = typeof link.source === 'string' ? link.source : link.source.id
              const targetId = typeof link.target === 'string' ? link.target : link.target.id
              return (sourceId === d.id && selectedTopics.includes(targetId)) ||
                     (targetId === d.id && selectedTopics.includes(sourceId))
            })
            return isConnected ? 1 : 0.6
          }
          return 1
        })
      
      // Restart simulation to trigger force reorganization
      simulation.alpha(0.3).restart()
    }
    
    // Trigger updates when selections change
    if (selectedTopics.length > 0) {
      updateSelectionStates()
    }

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
  }, [topics, selectedTopics, dimensions, onTopicToggle, maxSelections, countsLoading, relationshipsLoading, getTopicCount, relationships, highlightedNodes])

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (svgRef.current) {
        const rect = svgRef.current.parentElement?.getBoundingClientRect()
        if (rect) {
          setDimensions({
            width: rect.width,
            height: Math.min(rect.height, 600)
          })
        }
      }
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Handle search functionality
  const handleSearch = (term: string) => {
    setSearchTerm(term)
    if (term.trim()) {
      const matches = topics.filter(topic => 
        topic.display_name.toLowerCase().includes(term.toLowerCase()) ||
        topic.topic_key.toLowerCase().includes(term.toLowerCase())
      ).map(topic => topic.topic_key)
      setHighlightedNodes(matches)
    } else {
      setHighlightedNodes([])
    }
  }

  const clearSearch = () => {
    setSearchTerm('')
    setHighlightedNodes([])
  }

  return (
    <div className="w-full h-full">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-4">
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
        
        {/* Search Input */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search topics..."
            className="w-full px-4 py-2 pl-10 pr-10 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          <svg
            className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
          {highlightedNodes.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 text-xs text-slate-600 bg-slate-50 px-3 py-1 rounded-md">
              {highlightedNodes.length} topic{highlightedNodes.length > 1 ? 's' : ''} found
            </div>
          )}
        </div>
      </div>
      
      <div className="bg-white rounded-lg border border-slate-200 p-4" style={{ height: '600px' }}>
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