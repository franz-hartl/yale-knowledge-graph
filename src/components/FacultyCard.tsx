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
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-6 hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
      <div className="flex items-start justify-between mb-5">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-slate-900 tracking-tight">
            {faculty.first_name} {faculty.last_name}
          </h3>
          <p className="text-slate-600 mb-2 font-medium">
            {faculty.job_title || faculty.academic_rank}
          </p>
          <p className="text-sm text-slate-500">
            {faculty.department && faculty.school 
              ? `${faculty.department} • ${faculty.school}`
              : faculty.department || faculty.school
            }
          </p>
        </div>
        
        <div className="flex items-center space-x-3">
          <div className="text-right">
            <div className="text-sm font-bold text-emerald-600">
              {Math.round(faculty.relevance_score * 20)}% match
            </div>
            <div className="text-xs text-slate-500">
              relevance
            </div>
          </div>
          
          {faculty.expertise_breadth && faculty.expertise_breadth >= 4 && (
            <div className="bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full text-xs font-semibold">
              Interdisciplinary
            </div>
          )}
        </div>
      </div>

      {/* Topic Matches */}
      {faculty.topic_matches.length > 0 && (
        <div className="mb-5">
          <h4 className="text-sm font-bold text-slate-700 mb-3">
            Matching Topics
          </h4>
          <div className="space-y-3">
            {faculty.topic_matches.slice(0, 3).map((match) => (
              <div key={match.topic} className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">
                  {topics[match.topic] || match.topic}
                </span>
                <div className="flex items-center space-x-3">
                  <div className="w-20 bg-slate-200 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-2 rounded-full"
                      style={{ width: `${(match.score / 5) * 100}%` }}
                    />
                  </div>
                  <span className="text-xs font-semibold text-slate-500 w-6 text-right">
                    {match.score}/5
                  </span>
                </div>
              </div>
            ))}
            {faculty.topic_matches.length > 3 && (
              <div className="text-xs text-slate-500 font-medium">
                +{faculty.topic_matches.length - 3} more topics
              </div>
            )}
          </div>
        </div>
      )}

      {/* Research Areas */}
      <div className="mb-5">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-600 font-medium">Research Areas</span>
          <span className="font-bold text-slate-900">
            {faculty.expertise_breadth || 0} active {(faculty.expertise_breadth || 0) !== 1 ? 'areas' : 'area'}
          </span>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onViewProfile(faculty)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-6 py-3 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
        >
          View Profile
        </button>
        
        {faculty.website && (
          <a
            href={faculty.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
          >
            Website →
          </a>
        )}
      </div>
    </div>
  )
}