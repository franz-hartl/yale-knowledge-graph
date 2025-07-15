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
    <div className="bg-white rounded-xl shadow-lg border border-slate-200 p-8 hover:shadow-xl transition-all duration-300 hover:scale-[1.01] min-h-[300px] flex flex-col">
      {/* Header with name and match score */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex-1 min-w-0">
          <h3 className="text-2xl font-bold text-slate-900 tracking-tight leading-tight">
            {faculty.first_name} {faculty.last_name}
          </h3>
          <p className="text-slate-600 mb-3 font-medium text-lg">
            {faculty.job_title || faculty.academic_rank}
          </p>
          <p className="text-sm text-slate-500 font-medium">
            {faculty.department && faculty.school 
              ? `${faculty.department} • ${faculty.school}`
              : faculty.department || faculty.school
            }
          </p>
        </div>
        
        <div className="flex flex-col items-end space-y-2 ml-4">
          <div className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white px-4 py-2 rounded-full">
            <div className="text-lg font-bold">
              {Math.round(faculty.relevance_score * 20)}%
            </div>
            <div className="text-xs text-emerald-100">
              match
            </div>
          </div>
          
          {faculty.expertise_breadth && faculty.expertise_breadth >= 4 && (
            <div className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-xs font-semibold">
              Interdisciplinary
            </div>
          )}
        </div>
      </div>

      {/* Topic Matches - Main Content */}
      <div className="flex-1 mb-6">
        {faculty.topic_matches.length > 0 && (
          <div className="mb-6">
            <h4 className="text-base font-bold text-slate-700 mb-4">
              Matching Research Areas
            </h4>
            <div className="space-y-4">
              {faculty.topic_matches.slice(0, 2).map((match) => (
                <div key={match.topic} className="bg-slate-50 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-semibold text-slate-800">
                      {topics[match.topic] || match.topic}
                    </span>
                    <span className="text-xs font-bold text-slate-600">
                      {match.score}/5
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-3">
                    <div
                      className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-300"
                      style={{ width: `${(match.score / 5) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
              {faculty.topic_matches.length > 2 && (
                <div className="text-sm text-slate-500 font-medium bg-slate-50 rounded-lg p-3 text-center">
                  +{faculty.topic_matches.length - 2} more research areas
                </div>
              )}
            </div>
          </div>
        )}

        {/* Research Areas Summary */}
        <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-lg p-4 mb-6">
          <div className="flex items-center justify-between">
            <span className="text-slate-700 font-semibold">Total Research Areas</span>
            <span className="text-xl font-bold text-slate-900">
              {faculty.expertise_breadth || 0}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-200">
        <button
          onClick={() => onViewProfile(faculty)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-lg text-sm font-semibold hover:from-blue-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg hover:scale-105"
        >
          View Full Profile
        </button>
        
        {faculty.website && (
          <a
            href={faculty.website}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-600 hover:text-blue-800 text-sm font-semibold transition-colors hover:underline"
          >
            Visit Website →
          </a>
        )}
      </div>
    </div>
  )
}