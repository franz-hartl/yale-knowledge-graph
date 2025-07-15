import React, { useState } from 'react';
import './App.css';
import { TopicSelector } from './components/TopicSelector';
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Yale Knowledge Graph Explorer</h1>
              <p className="mt-2 text-gray-600">Discover faculty expertise and potential collaborators</p>
            </div>
            <div className="text-right">
              <p className="text-sm text-gray-500">Yale Planetary Solutions</p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="space-y-8">
          {/* Topic Selection */}
          <div className="bg-white rounded-lg shadow p-6">
            <TopicSelector
              topics={topics}
              selectedTopics={selectedTopics}
              onTopicToggle={handleTopicToggle}
              maxSelections={3}
            />
          </div>

          {/* Faculty Results */}
          <div>
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
