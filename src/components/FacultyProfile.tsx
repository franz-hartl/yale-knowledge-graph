import React from 'react'
import { FacultyWithRelevance, ResearchTopic } from '../types'

interface FacultyProfileProps {
  faculty: FacultyWithRelevance | null
  topics: ResearchTopic[]
  onClose: () => void
}

export const FacultyProfile: React.FC<FacultyProfileProps> = ({
  faculty,
  topics,
  onClose
}) => {
  if (!faculty) return null

  // Create topic mapping
  const topicMap = topics.reduce((acc, topic) => {
    acc[topic.topic_key] = topic
    return acc
  }, {} as { [key: string]: ResearchTopic })

  // Get all topics with scores > 0
  const allTopicScores = Object.keys(topicMap).map(topicKey => ({
    topic: topicMap[topicKey],
    score: faculty[topicKey as keyof FacultyWithRelevance] as number || 0
  })).filter(item => item.score > 0).sort((a, b) => b.score - a.score)

  // Group by category
  const topicsByCategory = allTopicScores.reduce((acc, item) => {
    const category = item.topic.category
    if (!acc[category]) acc[category] = []
    acc[category].push(item)
    return acc
  }, {} as { [key: string]: typeof allTopicScores })

  const getCategoryTitle = (category: string) => {
    switch (category) {
      case 'environmental':
        return 'Environmental & Social Issues'
      case 'social':
        return 'Social Challenges'
      case 'solutions':
        return 'Solution Approaches'
      default:
        return category
    }
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {faculty.first_name} {faculty.last_name}
              </h2>
              <p className="text-lg text-gray-600 mt-1">
                {faculty.job_title || faculty.academic_rank}
              </p>
              <p className="text-gray-500 mt-1">
                {faculty.department && faculty.school 
                  ? `${faculty.department} • ${faculty.school}`
                  : faculty.department || faculty.school
                }
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl"
            >
              ×
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-blue-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-blue-600">
                {faculty.relevance_score.toFixed(1)}
              </div>
              <div className="text-sm text-blue-800">Relevance Score</div>
            </div>
            <div className="bg-purple-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-purple-600">
                {faculty.expertise_breadth}
              </div>
              <div className="text-sm text-purple-800">Research Topics</div>
            </div>
            <div className="bg-green-50 rounded-lg p-4 text-center">
              <div className="text-2xl font-bold text-green-600">
                {faculty.is_bridge_connector ? 'Yes' : 'No'}
              </div>
              <div className="text-sm text-green-800">Bridge Connector</div>
            </div>
          </div>

          {/* Contact Information */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Contact Information</h3>
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <span className="text-gray-500 w-16">Email:</span>
                <a 
                  href={`mailto:${faculty.email}`}
                  className="text-blue-600 hover:text-blue-800"
                >
                  {faculty.email}
                </a>
              </div>
              {faculty.website && (
                <div className="flex items-center space-x-3">
                  <span className="text-gray-500 w-16">Website:</span>
                  <a 
                    href={faculty.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    {faculty.website}
                  </a>
                </div>
              )}
              {faculty.net_id && (
                <div className="flex items-center space-x-3">
                  <span className="text-gray-500 w-16">Net ID:</span>
                  <span className="text-gray-700">{faculty.net_id}</span>
                </div>
              )}
            </div>
          </div>

          {/* Professional Details */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-3">Professional Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {faculty.track_type && (
                <div>
                  <span className="text-gray-500 text-sm">Track Type:</span>
                  <p className="text-gray-700">{faculty.track_type}</p>
                </div>
              )}
              {faculty.tenure_status && (
                <div>
                  <span className="text-gray-500 text-sm">Tenure Status:</span>
                  <p className="text-gray-700">{faculty.tenure_status}</p>
                </div>
              )}
              {faculty.hire_date && (
                <div>
                  <span className="text-gray-500 text-sm">Hire Date:</span>
                  <p className="text-gray-700">
                    {new Date(faculty.hire_date).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Research Interests by Category */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">Research Interests</h3>
            <div className="space-y-6">
              {Object.entries(topicsByCategory).map(([category, categoryTopics]) => (
                <div key={category}>
                  <h4 className="font-medium text-gray-800 mb-3">
                    {getCategoryTitle(category)}
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {categoryTopics.map((item) => (
                      <div key={item.topic.topic_key} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex-1">
                          <div className="font-medium text-gray-900">
                            {item.topic.display_name}
                          </div>
                          {item.topic.description && (
                            <div className="text-sm text-gray-500 mt-1">
                              {item.topic.description}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center space-x-3 ml-4">
                          <div className="w-20 bg-gray-200 rounded-full h-2">
                            <div
                              className="h-2 rounded-full"
                              style={{ 
                                width: `${(item.score / 5) * 100}%`,
                                backgroundColor: item.topic.color_hex
                              }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600 w-8 text-right">
                            {item.score}/5
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 p-4 flex justify-end">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-2 rounded-md hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}