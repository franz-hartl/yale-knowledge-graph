import React, { useState } from 'react'
import { ResearchTopic } from '../types'
import { useFacultyTopicCounts } from '../hooks/useFacultyTopicCounts'

interface TopicExpertiseLandscapeProps {
  topics: ResearchTopic[]
  selectedTopics: string[]
  onTopicToggle: (topicKey: string) => void
  maxSelections?: number
}

interface TopicWithStats {
  topic: ResearchTopic
  facultyCount: number
  selected: boolean
}

export const TopicExpertiseLandscape: React.FC<TopicExpertiseLandscapeProps> = ({
  topics,
  selectedTopics,
  onTopicToggle,
  maxSelections = 3
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const { getTopicCount, loading } = useFacultyTopicCounts()

  // Create topic stats
  const topicStats: TopicWithStats[] = topics.map(topic => ({
    topic,
    facultyCount: getTopicCount(topic.topic_key),
    selected: selectedTopics.includes(topic.topic_key)
  }))

  // Filter topics based on search
  const filteredTopics = topicStats.filter(stat => {
    if (!searchTerm.trim()) return true
    return stat.topic.display_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
           stat.topic.topic_key.toLowerCase().includes(searchTerm.toLowerCase())
  })

  // Group topics by category
  const topicsByCategory = {
    environmental: filteredTopics.filter(stat => stat.topic.category === 'environmental'),
    social: filteredTopics.filter(stat => stat.topic.category === 'social'),
    solutions: filteredTopics.filter(stat => stat.topic.category === 'solutions')
  }

  // Get color based on faculty count
  const getTopicColor = (facultyCount: number, selected: boolean) => {
    if (selected) return 'bg-blue-500 text-white'
    
    if (facultyCount >= 20) return 'bg-green-100 border-green-500 text-green-800'
    if (facultyCount >= 10) return 'bg-yellow-100 border-yellow-500 text-yellow-800'
    if (facultyCount >= 5) return 'bg-orange-100 border-orange-500 text-orange-800'
    return 'bg-red-100 border-red-500 text-red-800'
  }

  // Get size based on faculty count
  const getTopicSize = (facultyCount: number) => {
    if (facultyCount >= 20) return 'text-lg p-4'
    if (facultyCount >= 10) return 'text-base p-3'
    if (facultyCount >= 5) return 'text-sm p-2'
    return 'text-xs p-2'
  }

  const handleTopicClick = (topicKey: string) => {
    const canSelectMore = selectedTopics.length < maxSelections
    const isSelected = selectedTopics.includes(topicKey)
    
    if (isSelected || canSelectMore) {
      onTopicToggle(topicKey)
    }
  }

  const clearSearch = () => {
    setSearchTerm('')
  }

  if (loading) {
    return (
      <div className="w-full h-full flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-slate-500 mt-4">Loading topic data...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full">
      <div className="mb-6">
        <div className="text-center mb-4">
          <h3 className="text-lg font-semibold text-slate-900">Yale Expertise Landscape</h3>
          <p className="text-sm text-slate-600 mt-1">
            Explore faculty expertise across research topics • Click to select up to {maxSelections} topics
          </p>
          {selectedTopics.length > 0 && (
            <p className="text-sm text-blue-600 mt-2">
              {selectedTopics.length} of {maxSelections} topics selected
            </p>
          )}
        </div>
        
        {/* Search Input */}
        <div className="relative mb-4">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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
        </div>

        {/* Legend */}
        <div className="flex justify-center space-x-6 text-xs text-slate-500 mb-6">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-100 border border-green-500 rounded"></div>
            <span>High (20+ faculty)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-yellow-100 border border-yellow-500 rounded"></div>
            <span>Medium (10-19 faculty)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-100 border border-orange-500 rounded"></div>
            <span>Low (5-9 faculty)</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-red-100 border border-red-500 rounded"></div>
            <span>Minimal (1-4 faculty)</span>
          </div>
        </div>
      </div>

      {/* Topic Categories */}
      <div className="space-y-8">
        {/* Environmental Topics */}
        <div>
          <h4 className="text-md font-semibold text-slate-800 mb-4 flex items-center">
            <div className="w-3 h-3 bg-green-500 rounded-full mr-2"></div>
            Environmental Challenges
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {topicsByCategory.environmental.map((stat) => (
              <button
                key={stat.topic.topic_key}
                onClick={() => handleTopicClick(stat.topic.topic_key)}
                className={`
                  ${getTopicColor(stat.facultyCount, stat.selected)}
                  ${getTopicSize(stat.facultyCount)}
                  border-2 rounded-lg transition-all duration-200 hover:shadow-md
                  ${stat.selected ? 'ring-2 ring-blue-300' : ''}
                  ${selectedTopics.length >= maxSelections && !stat.selected ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                `}
                disabled={selectedTopics.length >= maxSelections && !stat.selected}
              >
                <div className="font-medium">{stat.topic.display_name}</div>
                <div className="text-xs mt-1 opacity-75">{stat.facultyCount} faculty</div>
              </button>
            ))}
          </div>
        </div>

        {/* Social Topics */}
        <div>
          <h4 className="text-md font-semibold text-slate-800 mb-4 flex items-center">
            <div className="w-3 h-3 bg-orange-500 rounded-full mr-2"></div>
            Social Challenges
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {topicsByCategory.social.map((stat) => (
              <button
                key={stat.topic.topic_key}
                onClick={() => handleTopicClick(stat.topic.topic_key)}
                className={`
                  ${getTopicColor(stat.facultyCount, stat.selected)}
                  ${getTopicSize(stat.facultyCount)}
                  border-2 rounded-lg transition-all duration-200 hover:shadow-md
                  ${stat.selected ? 'ring-2 ring-blue-300' : ''}
                  ${selectedTopics.length >= maxSelections && !stat.selected ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                `}
                disabled={selectedTopics.length >= maxSelections && !stat.selected}
              >
                <div className="font-medium">{stat.topic.display_name}</div>
                <div className="text-xs mt-1 opacity-75">{stat.facultyCount} faculty</div>
              </button>
            ))}
          </div>
        </div>

        {/* Solutions Topics */}
        <div>
          <h4 className="text-md font-semibold text-slate-800 mb-4 flex items-center">
            <div className="w-3 h-3 bg-purple-500 rounded-full mr-2"></div>
            Solutions & Approaches
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {topicsByCategory.solutions.map((stat) => (
              <button
                key={stat.topic.topic_key}
                onClick={() => handleTopicClick(stat.topic.topic_key)}
                className={`
                  ${getTopicColor(stat.facultyCount, stat.selected)}
                  ${getTopicSize(stat.facultyCount)}
                  border-2 rounded-lg transition-all duration-200 hover:shadow-md
                  ${stat.selected ? 'ring-2 ring-blue-300' : ''}
                  ${selectedTopics.length >= maxSelections && !stat.selected ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105'}
                `}
                disabled={selectedTopics.length >= maxSelections && !stat.selected}
              >
                <div className="font-medium">{stat.topic.display_name}</div>
                <div className="text-xs mt-1 opacity-75">{stat.facultyCount} faculty</div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}