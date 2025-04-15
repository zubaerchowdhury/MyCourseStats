import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Users,
  Calendar,
  ChevronDown,
} from "lucide-react";
import SearchForm from "../components/SearchForm";

interface CourseSection {
  name: string;
  catalogNumber: string;
  sectionType: string;
  sectionCode: string;
  classNumber: number;
  capacity: number;
  multipleMeetings: boolean;
  classroom: string | string[];
  instructor: string[] | string[][];
  days: string[] | string[][];
  timeStart: Date | Date[];
  timeEnd: Date | Date[];
  startDate: Date | Date[];
  endDate: Date | Date[];
}

interface CourseContainer {
  courseWithOneMeeting: CourseSection | null;
  courseWithMultipleMeetings: CourseSection | null;
}

function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filteredCourses, setFilteredCourses] = useState<CourseSection[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedResults, setExpandedResults] = useState<
    Record<string, boolean>
  >({});
  const toggleExpand = (courseId: string) => {
    setExpandedResults((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
  };

  // Update filteredCourses when searchParams change
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const baseUrl = "http://localhost:5184/api/Courses/course-search";
        const response = await fetch(`${baseUrl}?${searchParams.toString()}`);

        if (!response.ok && response.status !== 404) {
          throw new Error("Failed to fetch courses data");
        }
        const data = await response.json();
        const transformedData: CourseSection[] = data.map(
          (container: CourseContainer) => {
            container.courseWithOneMeeting ||
              container.courseWithMultipleMeetings;
          }
        );
        setFilteredCourses(transformedData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error occurred");
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [searchParams]);

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
      <div className="bg-white shadow rounded-lg p-6">
        <SearchForm />
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {filteredCourses.length === 0 ? (
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
            {/* {filteredCourses.map((course) => (
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
                        <div>
                          <p className="text-xs text-gray-500">Class Number</p>
                          <p className="text-sm font-medium">
                            {course.classNumber}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Section Code</p>
                          <p className="text-sm font-medium">
                            {course.sectionCode}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Days</p>
                          <p className="text-sm font-medium">
                            {course.days.join(", ")}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Start Time - End Time</p>
                          <p className="text-sm font-medium">
                            {course.timeStart.toLocaleTimeString()} - {course.timeEnd.toLocaleTimeString()}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">Start Date - End Date</p>
                          <p className="text-sm font-medium">
                            {course.startDate.toLocaleDateString()} - {course.endDate.toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center bg-gray-50 rounded-lg p-3">
                        <div className="bg-gray-100 rounded-full p-2 mr-2">
                          <Users className="h-4 w-4 text-gray-500" />
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Classroom</p>
                          <p className="text-sm font-medium">
                            {course.classroom}
                          </p>
                          <p className="text-xs text-gray-500">Capacity</p>
                          <p className="text-sm font-medium">
                            {course.seatsAvailable} / {course.capacity} seats available
                          </p>
                          <p className="text-xs text-gray-500">Instructor</p>
                          <p className="text-sm font-medium">
                            {Array.isArray(course.instructor) 
                              ? course.instructor.join(", ") 
                              : course.instructor}
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
            ))} */}
          </div>
        )}
      </div>
    </div>
  );
}

export default SearchResults;