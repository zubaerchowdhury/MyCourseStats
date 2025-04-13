import React, { useState, useMemo, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, ArrowLeft, BookOpen, Users, Calendar } from 'lucide-react';
import { mockCourses } from '../data/mockCourses';
import { useCourses } from "../context/CourseContext";
import { Course } from "../utils/fetchCourses";

function SearchResults() {
  const { courses = [], loading, error } = useCourses();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [updatedFilteredCourses, setFilteredCourses] = useState<Course[]>([]);

  const [filters, setFilters] = useState({
    subjectCode: searchParams.get('subjectCode') || '',
    catalogNum: searchParams.get('catalogNum') ? Number(searchParams.get('catalogNum')) : undefined,
    semester: searchParams.get('semester') || '',
    year: searchParams.get('year') ? Number(searchParams.get('year')) : undefined
  });

  const semesterYearOptions = [
    { value: 'spring-2025', label: 'Spring 2025' },
    { value: 'fall-2025', label: 'Fall 2025' },
  ];
  
  useEffect(() => {
    const filtered = courses.filter(course => {
      const matchesSubject = filters.subjectCode ? course.subjectCode.toLowerCase().includes(filters.subjectCode.toLowerCase()) : true;
      const matchesCatalogNum = filters.catalogNum ? course.catalogNumber === filters.catalogNum : true;
      const matchesSemester = filters.semester ? course.semester.toLowerCase().includes(filters.semester.toLowerCase()) : true;
      const matchesYear = filters.year ? course.year === filters.year : true;
      return matchesSubject && matchesCatalogNum && matchesSemester && matchesYear;
    });
    setFilteredCourses(filtered);
  }, [filters]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.append(key,value.toString());
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      subjectCode: '',
      catalogNum: undefined,
      semester: '',
      year: undefined
    });
    setSearchParams(new URLSearchParams());
  };

  const handleBackToHome = () => {
    navigate('/');
  };

  const handleViewDetails = (courseId: number) => {
    navigate(`/course/${courseId}`);
  };

  return (
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
            Search Results
          </h1>
          
          <div className="mt-4 sm:mt-0 relative w-full max-w-xs">
            <form onSubmit={handleFilterChange}>
              <input
                type="text"
                className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-indigo-600 focus:border-transparent shadow-sm text-sm placeholder-gray-500"
                placeholder="Refine your search..."
                value={handleFilterChange}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button 
                type="submit"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-indigo-600"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {filteredCourses.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {filteredCourses.map((course) => (
            <div key={course._id} className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow">
              <div className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">{course.name}</h2>
                    <p className="text-sm text-gray-500 mt-1">{course.subjectCode} • {course.instructor}</p>
                  </div>
                  <div className="flex items-center bg-indigo-50 px-3 py-1 rounded-full">
                  </div>
                </div>
                
                
                <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="bg-gray-100 rounded-full p-2 mr-3">
                        <Users className="h-5 w-5 text-gray-500" />
                      </div>
                      <span className="text-sm text-gray-600">{course.instructor}</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center">
                      <div className="bg-gray-100 rounded-full p-2 mr-3">
                        <Calendar className="h-5 w-5 text-gray-500" />
                      </div>
                    </div>
                    <span className="text-sm font-semibold text-indigo-600">{course.capacity}</span>
                  </div>
                </div>
                
                <div className="mt-6 flex justify-end">
                  <button className="bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg mr-3 hover:bg-indigo-50 transition-colors">
                    Add to Schedule
                  </button>
                  <button 
                    onClick={() => handleViewDetails(parseInt(course._id))}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <div className="flex justify-center">
            <BookOpen className="h-16 w-16 text-gray-400" />
          </div>
          <h2 className="mt-4 text-2xl font-semibold text-gray-900">No courses found</h2>
          <p className="mt-2 text-gray-600">
            We couldn't find any courses matching your search criteria.
          </p>
          <div className="mt-6">
            <button
              onClick={handleBackToHome}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Return to Home
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchResults;