import React from 'react';
import './App.css';

function App() {
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
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">
            Find Faculty by Research Topics
          </h2>
          <p className="text-gray-600 mb-8">
            Select 1-3 research topics to discover faculty with related expertise
          </p>
          
          <div className="bg-white rounded-lg shadow p-6">
            <p className="text-gray-500">
              Application is being set up. Please check back soon!
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;
