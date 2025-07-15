import React, { useState } from 'react';
import { TopicNetworkGraph } from './TopicNetworkGraph';
import { FacultyClusterGraph } from './FacultyClusterGraph';
import { EgoNetworkGraph } from './EgoNetworkGraph';
import { Faculty, ResearchTopic } from '../../types';

interface DataVisualizationsPageProps {
  faculty: Faculty[];
  topics: ResearchTopic[];
}

type ViewLevel = 'topic-network' | 'faculty-clusters' | 'ego-network';

interface ViewState {
  level: ViewLevel;
  selectedTopic?: string;
  selectedFaculty?: string;
}

export const DataVisualizationsPage: React.FC<DataVisualizationsPageProps> = ({
  faculty,
  topics
}) => {
  const [viewState, setViewState] = useState<ViewState>({
    level: 'topic-network'
  });

  const handleTopicSelect = (topicKey: string) => {
    setViewState({
      level: 'faculty-clusters',
      selectedTopic: topicKey
    });
  };

  const handleFacultySelect = (facultyEmail: string) => {
    setViewState({
      level: 'ego-network',
      selectedFaculty: facultyEmail
    });
  };

  const handleBackToTopics = () => {
    setViewState({
      level: 'topic-network'
    });
  };

  const handleBackToFaculty = () => {
    setViewState({
      level: 'faculty-clusters',
      selectedTopic: viewState.selectedTopic
    });
  };

  const getCurrentTopicName = () => {
    if (viewState.selectedTopic) {
      const topic = topics.find(t => t.topic_key === viewState.selectedTopic);
      return topic?.display_name || viewState.selectedTopic;
    }
    return '';
  };

  const getCurrentFacultyName = () => {
    if (viewState.selectedFaculty) {
      const facultyMember = faculty.find(f => f.email === viewState.selectedFaculty);
      return facultyMember ? `${facultyMember.first_name} ${facultyMember.last_name}` : '';
    }
    return '';
  };

  return (
    <div className="space-y-6">
      {/* Header with navigation breadcrumbs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Data Visualizations</h1>
            <p className="text-gray-600 mt-1">
              Interactive network graphs showing Yale faculty expertise and collaboration potential
            </p>
          </div>
          
          {/* Breadcrumb navigation */}
          <nav className="flex items-center space-x-2 text-sm">
            <button
              onClick={handleBackToTopics}
              className={`px-3 py-1 rounded transition-colors ${
                viewState.level === 'topic-network'
                  ? 'bg-blue-100 text-blue-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Topic Network
            </button>
            
            {viewState.level !== 'topic-network' && (
              <>
                <span className="text-gray-400">›</span>
                <button
                  onClick={handleBackToFaculty}
                  className={`px-3 py-1 rounded transition-colors ${
                    viewState.level === 'faculty-clusters'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {getCurrentTopicName()}
                </button>
              </>
            )}
            
            {viewState.level === 'ego-network' && (
              <>
                <span className="text-gray-400">›</span>
                <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded">
                  {getCurrentFacultyName()}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* Main visualization area */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {viewState.level === 'topic-network' && (
          <TopicNetworkGraph
            faculty={faculty}
            topics={topics}
            onTopicSelect={handleTopicSelect}
          />
        )}

        {viewState.level === 'faculty-clusters' && viewState.selectedTopic && (
          <FacultyClusterGraph
            faculty={faculty}
            topics={topics}
            selectedTopicKey={viewState.selectedTopic}
            onFacultySelect={handleFacultySelect}
          />
        )}

        {viewState.level === 'ego-network' && viewState.selectedFaculty && (
          <EgoNetworkGraph
            faculty={faculty}
            topics={topics}
            selectedFacultyEmail={viewState.selectedFaculty}
          />
        )}
      </div>

      {/* Instructions and help */}
      <div className="bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to Use</h3>
        <div className="space-y-2 text-sm text-blue-800">
          <div className="flex items-start space-x-2">
            <span className="font-medium">1.</span>
            <span>Start with the <strong>Topic Network</strong> to see connections between research areas</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium">2.</span>
            <span>Click on any topic to drill down to <strong>Faculty Clusters</strong> in that area</span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium">3.</span>
            <span>Click on individual faculty to see their <strong>Collaboration Network</strong></span>
          </div>
          <div className="flex items-start space-x-2">
            <span className="font-medium">4.</span>
            <span>Use the breadcrumbs to navigate between levels</span>
          </div>
        </div>
      </div>
    </div>
  );
};