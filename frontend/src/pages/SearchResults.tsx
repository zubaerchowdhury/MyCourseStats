import React, { useState, useMemo, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, ArrowLeft, BookOpen, Users, Calendar, ChevronDown } from "lucide-react";
import { mockCourses, Course } from "../data/mockCourses";
import { useCourses } from "../context/CourseContext";
import { X } from "lucide-react";

function SearchResults() {
  // Using mockCourses directly
  const courses = mockCourses; 
  const loading = false;
  const error = null;
  
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [updatedFilteredCourses, setFilteredCourses] = useState<Course[]>(mockCourses);

  const [expandedResults, setExpandedResults] = useState<Record<string, boolean>>({});
  const toggleExpand = (courseId: string) => {
    setExpandedResults((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  const [filters, setFilters] = useState({
    subjectCode: searchParams.get("subjectCode") || "",
    catalogNum: searchParams.get("catalogNum")
      ? Number(searchParams.get("catalogNum"))
      : undefined,
    semester: searchParams.get("semester") || "",
    year: searchParams.get("year")
      ? Number(searchParams.get("year"))
      : undefined,
  });

  const semesterYearOptions = [
    { value: "spring-2025", label: "Spring 2025" },
    { value: "fall-2025", label: "Fall 2025" },
  ];

  useEffect(() => {
    const filtered = courses.filter((course) => {
      const matchesSubject = filters.subjectCode
        ? course.subjectCode
            .toLowerCase()
            .includes(filters.subjectCode.toLowerCase())
        : true;
      const matchesCatalogNum = filters.catalogNum
        ? course.catalogNumber === filters.catalogNum
        : true;
      const matchesSemester = filters.semester
        ? course.semester.toLowerCase().includes(filters.semester.toLowerCase())
        : true;
      const matchesYear = filters.year ? course.year === filters.year : true;
      return (
        matchesSubject && matchesCatalogNum && matchesSemester && matchesYear
      );
    });
    setFilteredCourses(filtered);
  }, [filters, courses]);

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);

    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    setSearchParams(params);
  };

  const handleSearch = () => {
    // Required field validation
    if (!filters.subjectCode) {
      alert("Subject field is required to search");
      return;
    }
    
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value.toString());
    });
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({
      subjectCode: "",
      catalogNum: undefined,
      semester: "",
      year: undefined,
    });
    setSearchParams(new URLSearchParams());
  };

  const handleBackToHome = () => {
    navigate("/");
  };

  const handleViewDetails = (courseId: string) => {
    navigate(`/course/${courseId}`);
  };

  return (
    <div className="mb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <button
          onClick={handleBackToHome}
          className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-1" />
          <span>Back to Home</span>
        </button>
        <div className="mt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
        </div>
      </div>
      <div className="bg-white shadow rounded-lg p-6 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Semester
            </label>
            <select
              value={filters.semester}
              onChange={(e) => handleFilterChange("semester", e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Any</option>
              {semesterYearOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject <span className="text-red-500">*</span>
            </label>
            <select
              value={filters.subjectCode}
              onChange={(e) =>
                handleFilterChange("subjectCode", e.target.value)
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              <option value="">Any</option>
              <option value="ECE">ECE</option>
              <option value="BME">BME</option>
              <option value="MTH">MTH</option>
              <option value="CHM">CHM</option>
              <option value="MATH">MATH</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Catalog Number
            </label>
            <input
              type="number"
              value={filters.catalogNum || ""}
              onChange={(e) =>
                handleFilterChange(
                  "catalogNum",
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              placeholder="e.g. 101"
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
        </div>
        
        <div className="mt-4 flex justify-between">
          <button
            onClick={handleSearch}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            <Search className="h-4 w-4 mr-1" />
            Search
          </button>
          
          {Object.values(filters).some((value) => value) && (
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 flex items-center"
            >
              <X className="h-4 w-4 mr-1" />
              Clear Filters
            </button>
          )}
        </div>
      </div>
      <div className="space=y-6">
        {updatedFilteredCourses.length === 0 ? (
          <div className="text-center py-16">
            <div className="flex justify-center">
              <BookOpen className="h-16 w-16 text-gray-400" />
            </div>
            <h2 className="mt-4 text-2xl font-semibold text-gray-900">
              No courses found
            </h2>
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
        ) : (
          <div className="space-y-4">
            {updatedFilteredCourses.map((course) => (
              <div key={course._id} className="bg-white shadow rounded-lg p-6">
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    <button 
                      onClick={() => toggleExpand(course._id)}
                      className="mt-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      aria-label={expandedResults[course._id] ? "Collapse details" : "Expand details"}
                    >
                      <ChevronDown 
                        className={`h-5 w-5 transform transition-transform ${
                          expandedResults[course._id] ? 'rotate-180' : ''
                        }`} 
                      />
                    </button>

                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {course.name} | {course.subjectCode} {course.catalogNumber}
                      </h2>
                      <p className="text-sm text-gray-500 mt-1">
                        {Array.isArray(course.instructor) 
                          ? course.instructor.join(", ") 
                          : course.instructor}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      course.status === 'Open' ? 'bg-green-100 text-green-800' : 
                      course.status === 'Waitlist' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-red-100 text-red-800'
                    }`}>
                      {course.status}
                    </span>
                  </div>
                </div>
                
                {expandedResults[course._id] && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="flex items-center bg-gray-50 rounded-lg p-3">
                        <div className="bg-gray-100 rounded-full p-2 mr-2">
                          <Users className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Instructor</p>
                          <p className="text-sm font-medium">
                            {Array.isArray(course.instructor) 
                              ? course.instructor.join(", ") 
                              : course.instructor}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center bg-gray-50 rounded-lg p-3">
                        <div>
                          <p className="text-xs text-gray-500">Capacity</p>
                          <p className="text-sm font-medium">
                            {course.seatsAvailable} / {course.capacity} seats available
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center bg-gray-50 rounded-lg p-3">
                        <div className="bg-gray-100 rounded-full p-2 mr-2">
                          <Calendar className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Schedule</p>
                          <p className="text-sm font-medium">
                            {course.days.join(", ")} • {course.timeStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})} - {course.timeEnd.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center bg-gray-50 rounded-lg p-3">
                        <div className="bg-gray-100 rounded-full p-2 mr-2">
                          <BookOpen className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Capacity</p>
                          <p className="text-sm font-medium">
                            {course.seatsAvailable} / {course.capacity} seats available
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex justify-end">
                  <button className="bg-white border border-indigo-600 text-indigo-600 px-4 py-2 rounded-lg mr-3 hover:bg-indigo-50 transition-colors">
                    Past Instructors
                  </button>
                  <button
                    onClick={() => handleViewDetails(course._id)}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResults;
