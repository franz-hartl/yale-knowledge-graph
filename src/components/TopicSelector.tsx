import React from 'react'
import { ResearchTopic } from '../types'

interface TopicSelectorProps {
  topics: ResearchTopic[]
  selectedTopics: string[]
  onTopicToggle: (topicKey: string) => void
  maxSelections?: number
}

export const TopicSelector: React.FC<TopicSelectorProps> = ({
  topics,
  selectedTopics,
  onTopicToggle,
  maxSelections = 3
}) => {
  const groupedTopics = topics.reduce((acc, topic) => {
    if (!acc[topic.category]) {
      acc[topic.category] = []
    }
    acc[topic.category].push(topic)
    return acc
  }, {} as Record<string, ResearchTopic[]>)

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

  const canSelectMore = selectedTopics.length < maxSelections

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Select Research Topics
        </h3>
        <p className="text-sm text-gray-600">
          Choose up to {maxSelections} topics to find relevant faculty
        </p>
        {selectedTopics.length > 0 && (
          <p className="text-sm text-blue-600 mt-2">
            {selectedTopics.length} of {maxSelections} topics selected
          </p>
        )}
      </div>

      {Object.entries(groupedTopics).map(([category, categoryTopics]) => (
        <div key={category} className="space-y-3">
          <h4 className="font-medium text-gray-900 text-center">
            {getCategoryTitle(category)}
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {categoryTopics.map((topic) => {
              const isSelected = selectedTopics.includes(topic.topic_key)
              const isDisabled = !isSelected && !canSelectMore

              return (
                <button
                  key={topic.topic_key}
                  onClick={() => onTopicToggle(topic.topic_key)}
                  disabled={isDisabled}
                  className={`
                    relative p-3 rounded-lg border text-left transition-all
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-900'
                      : isDisabled
                      ? 'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                      : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300 hover:bg-gray-50 cursor-pointer'
                    }
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`
                        w-4 h-4 rounded-full border-2 flex-shrink-0 mt-0.5
                        ${isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-gray-300'
                        }
                      `}
                    >
                      {isSelected && (
                        <div className="w-full h-full rounded-full bg-white transform scale-50" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium leading-tight">
                        {topic.display_name}
                      </p>
                      {topic.description && (
                        <p className="text-xs text-gray-500 mt-1 leading-tight">
                          {topic.description}
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}