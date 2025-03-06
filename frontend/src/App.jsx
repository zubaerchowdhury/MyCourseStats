import React, { useState } from 'react';
import { Github, Twitter, Linkedin, Search, Code2, ArrowLeft } from 'lucide-react';

function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Mock search results data
  const mockSearchResults = [
    {
      id: 1,
      title: 'Introduction to Computer Science',
      code: 'CS101',
      instructor: 'Dr. Jane Smith',
      rating: 4.8,
      reviews: 245,
      description: 'A foundational course covering the basics of computer science, algorithms, and programming concepts.',
      schedule: 'Mon, Wed, Fri 10:00 AM - 11:30 AM',
      credits: 3
    },
    {
      id: 2,
      title: 'Data Structures and Algorithms',
      code: 'CS201',
      instructor: 'Prof. Michael Johnson',
      rating: 4.5,
      reviews: 189,
      description: 'Learn about fundamental data structures and algorithm design techniques essential for efficient programming.',
      schedule: 'Tue, Thu 1:00 PM - 3:00 PM',
      credits: 4
    },
    {
      id: 3,
      title: 'Database Systems',
      code: 'CS305',
      instructor: 'Dr. Robert Chen',
      rating: 4.2,
      reviews: 156,
      description: 'Comprehensive overview of database design, implementation, and management systems.',
      schedule: 'Mon, Wed 2:00 PM - 3:30 PM',
      credits: 3
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsSearching(true);
    }
  };

  const handleBackToHome = () => {
    setIsSearching(false);
    setSearchQuery('');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Navigation */}
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center">
              <Code2 className="h-8 w-8 text-indigo-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">MyCourseStats</span>
            </div>
            <div className="hidden md:flex items-center space-x-8">
              <a href="#" className="text-gray-600 hover:text-gray-900">About</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Schedule Builder</a>
              <a href="#" className="text-gray-600 hover:text-gray-900">Test</a>
            </div>
          </div>
        </div>
      </nav>

      {!isSearching ? (
        /* Hero Section */
        <div className="relative bg-white overflow-hidden">
          <div className="max-w-7xl mx-auto">
            <div className="relative z-10 pb-8 bg-white sm:pb-16 md:pb-20 lg:max-w-2xl lg:w-full lg:pb-28 xl:pb-32">
              <main className="mt-10 mx-auto max-w-7xl px-4 sm:mt-12 sm:px-6 md:mt-16 lg:mt-20 lg:px-8 xl:mt-28">
                <div className="sm:text-center lg:text-left">
                  <h1 className="text-4xl tracking-tight font-extrabold text-gray-900 sm:text-5xl md:text-6xl">
                    <span className="block">Schedule smarter</span>
                    <span className="block text-indigo-600"></span>
                  </h1>
                  <p className="mt-3 text-base text-gray-500 sm:mt-5 sm:text-lg sm:max-w-xl sm:mx-auto md:mt-5 md:text-xl lg:mx-0">
                    We help ambitious businesses like yours generate more profits by building awareness, driving web traffic, connecting with customers, and growing overall sales.
                  </p>
                  <div className="mt-5 sm:mt-8 sm:flex sm:justify-center lg:justify-start">
                    <div className="w-full max-w-lg">
                      <form onSubmit={handleSearch}>
                        <div className="relative">
                          <input
                            type="text"
                            className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent shadow-sm text-base placeholder-gray-500"
                            placeholder="Search schools, courses..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                          />
                          <button 
                            type="submit"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
                          >
                            <Search className="h-5 w-5" />
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                </div>
              </main>
            </div>
          </div>
          <div className="lg:absolute lg:inset-y-0 lg:right-0 lg:w-1/2">
            <img
              className="h-56 w-full object-cover sm:h-72 md:h-96 lg:w-full lg:h-full"
              src="https://images.unsplash.com/photo-1551434678-e076c223a692?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=2850&q=80"
              alt="Team working on project"
            />
          </div>
        </div>
      ) : (
        /* Search Results Page */
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <button 
              onClick={handleBackToHome}
              className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4 mr-1" />
              <span>Back to Home</span>
            </button>
            
            <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-2xl font-bold text-gray-900">
                Search Results for "{searchQuery}"
              </h1>
              
              <div className="mt-4 sm:mt-0 relative w-full max-w-xs">
                <input
                  type="text"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent shadow-sm text-sm placeholder-gray-500"
                  placeholder="Refine your search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <button 
                  onClick={handleSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
                >
                  <Search className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {mockSearchResults.map((course) => (
              <div key={course.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">{course.title}</h2>
                      <p className="text-sm text-gray-500 mt-1">{course.code} • {course.instructor}</p>
                    </div>
                    <div className="flex items-center bg-indigo-50 px-3 py-1 rounded-full">
                      <span className="text-indigo-700 font-medium">{course.rating}</span>
                      <span className="text-gray-500 text-sm ml-1">({course.reviews} reviews)</span>
                    </div>
                  </div>
                  
                  <p className="mt-4 text-gray-600">{course.description}</p>
                  
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <div className="bg-gray-100 rounded-full p-2 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">{course.schedule}</span>
                    </div>
                    <div className="flex items-center">
                      <div className="bg-gray-100 rounded-full p-2 mr-3">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                        </svg>
                      </div>
                      <span className="text-sm text-gray-600">{course.credits} Credits</span>
                    </div>
                  </div>
                  
                  <div className="mt-6 flex justify-end">
                    <button className="bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg mr-3 hover:bg-indigo-50 transition-colors">
                      Add to Schedule
                    </button>
                    <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="bg-white border-t mt-auto">
        <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <Github className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <Twitter className="h-6 w-6" />
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-500">
              <Linkedin className="h-6 w-6" />
            </a>
          </div>
          <div className="mt-8 md:mt-0 md:order-1">
            <p className="text-center text-base text-gray-400">
              &copy; 2024 MyCourseStats. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;