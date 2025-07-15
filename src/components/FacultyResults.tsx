import React from 'react'
import { FacultyWithRelevance, ResearchTopic } from '../types'
import { FacultyCard } from './FacultyCard'

interface FacultyResultsProps {
  results: FacultyWithRelevance[]
  loading: boolean
  error: string | null
  selectedTopics: string[]
  topics: ResearchTopic[]
  onViewProfile: (faculty: FacultyWithRelevance) => void
}

export const FacultyResults: React.FC<FacultyResultsProps> = ({
  results,
  loading,
  error,
  selectedTopics,
  topics,
  onViewProfile
}) => {
  // Create a mapping from topic_key to display_name
  const topicMap = topics.reduce((acc, topic) => {
    acc[topic.topic_key] = topic.display_name
    return acc
  }, {} as { [key: string]: string })

  if (selectedTopics.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg">
          Select research topics above to find faculty
        </div>
        <div className="text-gray-400 text-sm mt-2">
          Choose up to 3 topics to discover potential collaborators
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <div className="text-gray-500 mt-4">Searching faculty...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-lg mb-2">Error loading results</div>
        <div className="text-gray-500 text-sm">{error}</div>
      </div>
    )
  }

  if (results.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-gray-500 text-lg mb-2">
          No faculty found for selected topics
        </div>
        <div className="text-gray-400 text-sm">
          Try selecting different topics or fewer topics
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Faculty Results
          </h2>
          <p className="text-gray-600 mt-1">
            Found {results.length} faculty member{results.length !== 1 ? 's' : ''} with expertise in:
          </p>
          <div className="flex flex-wrap gap-2 mt-2">
            {selectedTopics.map(topicKey => (
              <span
                key={topicKey}
                className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm"
              >
                {topicMap[topicKey] || topicKey}
              </span>
            ))}
          </div>
        </div>
        
        <div className="text-right">
          <div className="text-sm text-gray-500">
            Sorted by relevance
          </div>
          <div className="text-xs text-gray-400 mt-1">
            Interdisciplinary faculty highlighted
          </div>
        </div>
      </div>

      {/* Results Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {results.map((faculty) => (
          <FacultyCard
            key={faculty.id}
            faculty={faculty}
            onViewProfile={onViewProfile}
            topics={topicMap}
          />
        ))}
      </div>

      {/* Results Summary */}
      <div className="bg-gray-50 rounded-lg p-4">
        <h3 className="font-medium text-gray-900 mb-2">Results Summary</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div>
            <div className="text-gray-600">Total Faculty</div>
            <div className="text-lg font-semibold">{results.length}</div>
          </div>
          <div>
            <div className="text-gray-600">Interdisciplinary</div>
            <div className="text-lg font-semibold text-green-600">
              {results.filter(f => f.expertise_breadth && f.expertise_breadth >= 4).length}
            </div>
          </div>
          <div>
            <div className="text-gray-600">Avg. Match</div>
            <div className="text-lg font-semibold text-blue-600">
              {results.length > 0 
                ? Math.round((results.reduce((sum, f) => sum + f.relevance_score, 0) / results.length) * 20) + '%'
                : '0%'
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}