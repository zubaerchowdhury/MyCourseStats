import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { Github, Twitter, Linkedin, Code2 } from 'lucide-react';
import { CourseProvider } from "./context/CourseContext";
import Home from './pages/Home';
import SearchResults from './pages/SearchResults';
import CourseDetails from './pages/CourseDetails';

function App() {
  return (
    <CourseProvider>
     <Router>
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
                 <a href="#" className="text-gray-600 hover:text-gray-900">Search by Schools</a>
               </div>
             </div>
           </div>
         </nav>

         <Routes>
           <Route path="/" element={<Home />} />
           <Route path="/search" element={<SearchResults />} />
           <Route path="/course/:id" element={<CourseDetails />} />
         </Routes>

         {/* Footer */}
         <footer className="bg-white border-t mt-auto">
           <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 md:flex md:items-center md:justify-between lg:px-8">
             <div className="mt-8 md:mt-0 md:order-1">
               <p className="text-center text-base text-gray-400">
                 &copy; 2025 MyCourseStats. All rights reserved.
               </p>
             </div>
           </div>
         </footer>
       </div>
     </Router>
    </CourseProvider>
  );
}

export default App;