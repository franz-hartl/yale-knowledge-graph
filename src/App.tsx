import React, { useState } from 'react';
import './App.css';
import { TopicExpertiseLandscape } from './components/TopicExpertiseLandscape';
import { FacultyResults } from './components/FacultyResults';
import { FacultyProfile } from './components/FacultyProfile';
import { useResearchTopics } from './hooks/useResearchTopics';
import { useFacultySearch } from './hooks/useFacultySearch';
import { FacultyWithRelevance } from './types';

function App() {
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyWithRelevance | null>(null);
  
  const { topics, loading: topicsLoading, error: topicsError } = useResearchTopics();
  const { results, loading: searchLoading, error: searchError } = useFacultySearch(selectedTopics);

  const handleTopicToggle = (topicKey: string) => {
    setSelectedTopics(prev => {
      if (prev.includes(topicKey)) {
        return prev.filter(t => t !== topicKey);
      } else if (prev.length < 3) {
        return [...prev, topicKey];
      }
      return prev;
    });
  };

  const handleViewProfile = (faculty: FacultyWithRelevance) => {
    setSelectedFaculty(faculty);
  };

  const handleCloseProfile = () => {
    setSelectedFaculty(null);
  };

  if (topicsLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <div className="text-gray-500 mt-4">Loading application...</div>
        </div>
      </div>
    );
  }

  if (topicsError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-lg mb-2">Error loading application</div>
          <div className="text-gray-500 text-sm">{topicsError}</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Yale Knowledge Graph Explorer</h1>
              <p className="mt-2 text-slate-600 text-lg">Discover faculty expertise and potential collaborators</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-slate-500 font-medium">Yale Planetary Solutions</p>
            </div>
          </div>
        </div>
      </header>

      {/* Search Summary Header */}
      {selectedTopics.length > 0 && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <span className="text-sm font-semibold text-blue-900">
                  Showing {results.length} faculty matching:
                </span>
                <div className="flex flex-wrap gap-2">
                  {selectedTopics.map(topicKey => {
                    const topic = topics.find(t => t.topic_key === topicKey);
                    return (
                      <span
                        key={topicKey}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-blue-900 shadow-sm border border-blue-200"
                      >
                        {topic?.display_name || topicKey}
                        <button
                          onClick={() => handleTopicToggle(topicKey)}
                          className="ml-2 text-blue-600 hover:text-blue-800 transition-colors"
                        >
                          ×
                        </button>
                      </span>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={() => setSelectedTopics([])}
                className="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors"
              >
                Clear all
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col gap-8">
          {/* Top Panel - Topic Expertise Landscape */}
          <div className="w-full bg-white rounded-xl shadow-lg border border-slate-200 p-6">
            <TopicExpertiseLandscape
              topics={topics}
              selectedTopics={selectedTopics}
              onTopicToggle={handleTopicToggle}
              maxSelections={3}
            />
          </div>

          {/* Bottom Panel - Faculty Results */}
          <div className="w-full max-h-[600px] overflow-y-auto">
            <FacultyResults
              results={results}
              loading={searchLoading}
              error={searchError}
              selectedTopics={selectedTopics}
              topics={topics}
              onViewProfile={handleViewProfile}
            />
          </div>
        </div>
      </main>

      {/* Faculty Profile Modal */}
      <FacultyProfile
        faculty={selectedFaculty}
        topics={topics}
        onClose={handleCloseProfile}
      />
    </div>
  );
}

export default App;
