import React from 'react'
import { FacultyWithRelevance } from '../types'

interface FacultyCardProps {
  faculty: FacultyWithRelevance
  onViewProfile: (faculty: FacultyWithRelevance) => void
  topics: { [key: string]: string } // topic_key -> display_name mapping
}

export const FacultyCard: React.FC<FacultyCardProps> = ({ 
  faculty, 
  onViewProfile, 
  topics 
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900">
            {faculty.first_name} {faculty.last_name}
          </h3>
          <p className="text-sm text-gray-600 mb-1">
            {faculty.job_title || faculty.academic_rank}
          </p>
          <p className="text-sm text-gray-500">
            {faculty.department && faculty.school 
              ? `${faculty.department} • ${faculty.school}`
              : faculty.department || faculty.school
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          <div className="text-right">
            <div className="text-sm font-medium text-blue-600">
              {faculty.relevance_score.toFixed(1)}
            </div>
            <div className="text-xs text-gray-500">
              relevance
            </div>
          </div>
          
          {faculty.is_bridge_connector && (
            <div className="bg-purple-100 text-purple-800 px-2 py-1 rounded-full text-xs font-medium">
              Bridge Connector
            </div>
          )}
        </div>
      </div>

      {/* Topic Matches */}
      {faculty.topic_matches.length > 0 && (
        <div className="mb-4">
          <h4 className="text-sm font-medium text-gray-700 mb-2">
            Matching Topics
          </h4>
          <div className="space-y-2">
            {faculty.topic_matches.slice(0, 3).map((match) => (
              <div key={match.topic} className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {topics[match.topic] || match.topic}
                </span>
                <div className="flex items-center space-x-2">
                  <div className="w-16 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-500 h-2 rounded-full"
                      style={{ width: `${(match.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs text-gray-500 w-6 text-right">
                    {match.score}/5
                  </span>
                </div>
              </div>
            ))}
            {faculty.topic_matches.length > 3 && (
              <div className="text-xs text-gray-500">
                +{faculty.topic_matches.length - 3} more topics
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expertise Breadth */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-600">Expertise Breadth</span>
          <span className="font-medium">
            {faculty.expertise_breadth} topic{faculty.expertise_breadth !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onViewProfile(faculty)}
          className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          View Profile
        </button>
        
        {faculty.website && (
          <a
            href={faculty.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm"
          >
            Website →
          </a>
        )}
      </div>
    </div>
  )
}