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
      {Object.entries(groupedTopics).map(([category, categoryTopics]) => (
        <div key={category} className="space-y-4">
          <h4 className="font-bold text-slate-900 text-sm uppercase tracking-wider">
            {getCategoryTitle(category)}
          </h4>
          <div className="space-y-3">
            {categoryTopics.map((topic) => {
              const isSelected = selectedTopics.includes(topic.topic_key)
              const isDisabled = !isSelected && !canSelectMore

              return (
                <button
                  key={topic.topic_key}
                  onClick={() => onTopicToggle(topic.topic_key)}
                  disabled={isDisabled}
                  className={`
                    w-full text-left p-4 rounded-lg border transition-all duration-200
                    ${isSelected
                      ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-md ring-1 ring-blue-500/20'
                      : isDisabled
                      ? 'border-slate-200 bg-slate-50 text-slate-400 cursor-not-allowed'
                      : 'border-slate-200 bg-white text-slate-900 hover:border-slate-300 hover:bg-slate-50 cursor-pointer hover:shadow-sm'
                    }
                  `}
                >
                  <div className="flex items-start space-x-3">
                    <div
                      className={`
                        w-5 h-5 rounded-full border-2 flex-shrink-0 mt-0.5 transition-all
                        ${isSelected
                          ? 'border-blue-500 bg-blue-500'
                          : 'border-slate-300'
                        }
                      `}
                    >
                      {isSelected && (
                        <div className="w-full h-full rounded-full bg-white transform scale-50" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold leading-tight">
                        {topic.display_name}
                      </p>
                      {topic.description && (
                        <p className="text-xs text-slate-500 mt-1 leading-tight">
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