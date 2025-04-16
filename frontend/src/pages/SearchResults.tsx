import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  ArrowLeft,
  BookOpen,
  Users,
  Calendar,
  ChevronDown,
  Loader2,
} from "lucide-react";
import SearchForm from "../components/SearchForm";
import { useSearch } from "../context/SearchContext";

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
  const [searchSemester, setSearchSemester] = useState<string>("");
  const [searchYear, setSearchYear] = useState<number | undefined>(undefined);
  const [searchSubjectCode, setSearchSubjectCode] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedResults, setExpandedResults] = useState<
    Record<string, boolean>
  >({});
  const toggleExpand = (courseId: number) => {
    setExpandedResults((prev) => ({ ...prev, [courseId]: !prev[courseId] }));
  };
  const setCurrentSearchVars = (
    semester: string,
    year: number | undefined,
    subjectCode: string
  ) => {
    setSearchSemester(semester);
    setSearchYear(year);
    setSearchSubjectCode(subjectCode);
  };

  // Update filteredCourses when searchParams change
  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      setCurrentSearchVars(
        searchParams.get("semester") || "",
        parseInt(searchParams.get("year") || ""),
        searchParams.get("subjectCode") || ""
      );
      try {
        const baseUrl = "http://localhost:5184/api/Courses/course-search";
        const response = await fetch(`${baseUrl}?${searchParams.toString()}`);

        if (!response.ok && response.status !== 404) {
          if (response.status >= 500) {
            throw new Error("Server error, please try again later");
          }
          throw new Error("Failed to fetch courses data");
        }
        const data = await response.json();
        const transformedData: CourseSection[] = data.map(
          (container: CourseContainer) => {
            const course: CourseSection = container.courseWithOneMeeting
              ? (container.courseWithOneMeeting as CourseSection)
              : (container.courseWithMultipleMeetings as CourseSection);
            // Transform date strings to Date objects
            if (course.multipleMeetings) {
              course.timeStart = (course.timeStart as Date[]).map(
                (time) => new Date(time.toString())
              );
              course.timeEnd = (course.timeEnd as Date[]).map(
                (time) => new Date(time.toString())
              );
              course.startDate = (course.startDate as Date[]).map(
                (date) => new Date(date.toString())
              );
              course.endDate = (course.endDate as Date[]).map(
                (date) => new Date(date.toString())
              );
              return course;
            }
            const transformedCourse: CourseSection = {
              ...course,
              timeStart: new Date(course.timeStart.toString()),
              timeEnd: new Date(course.timeEnd.toString()),
              startDate: new Date(course.startDate.toString()),
              endDate: new Date(course.endDate.toString()),
            };
            return transformedCourse;
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

  const handleViewDetails = (course: CourseSection) => {
    const params = new URLSearchParams();
    params.append("semester", searchSemester);
    params.append("year", searchYear?.toString() || "");
    params.append("classNumber", course.classNumber.toString());
    navigate(`/course/${params.toString()}`);
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
        <div className="bg-white shadow rounded-lg p-6">
          <SearchForm />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-16">
            <Loader2 className="h-16 w-16 text-indigo-600 mx-auto animate-spin" />
            <p className="mt-4 text-gray-600">Loading courses...</p>
          </div>
        ) : error ? (
          <div className="text-center py-16">
            <p className="text-red-600 text-lg font-medium">{error}</p>
            <div className="mt-6">
              <button
                onClick={handleBackToHome}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Return to Home
              </button>
            </div>
          </div>
        ) : filteredCourses.length === 0 ? (
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
            {filteredCourses.map((course: CourseSection) => (
              <div
                key={course.classNumber}
                className="bg-white shadow rounded-lg p-6"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-start gap-2">
                    <button
                      onClick={() => toggleExpand(course.classNumber)}
                      className="mt-1 text-gray-400 hover:text-gray-600 focus:outline-none"
                      aria-label={
                        expandedResults[course.classNumber]
                          ? "Collapse details"
                          : "Expand details"
                      }
                    >
                      <ChevronDown
                        className={`h-5 w-5 transform transition-transform ${
                          expandedResults[course.classNumber]
                            ? "rotate-180"
                            : ""
                        }`}
                      />
                    </button>

                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {course.name} | {searchSubjectCode} {course.catalogNumber}
                      </h2>
                      {Array.isArray(course.instructor)
                        ? course.instructor.join(", ")
                        : course.instructor}
                    </div>
                  </div>
                </div>

                {expandedResults[course.classNumber] && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-4 mt-4">
                      <div className="flex items-center bg-gray-50 rounded-lg p-3">
                        <div>
                          <p className="text-xs text-gray-500">Class Number</p>
                          <p className="text-sm font-medium">
                            {course.classNumber}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Section Code
                          </p>
                          <p className="text-sm font-medium">
                            {course.sectionCode}
                          </p>
                          {!course.multipleMeetings && (
                            <>
                              <p className="text-xs text-gray-500 mt-1">Days</p>
                              <p className="text-sm font-medium">
                                {course.days.join(", ")}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Start Time - End Time
                              </p>
                              <p className="text-sm font-medium">
                                {(
                                  course.timeStart as Date
                                ).toLocaleTimeString()}{" "}
                                -{" "}
                                {(course.timeEnd as Date).toLocaleTimeString()}
                              </p>
                              <p className="text-xs text-gray-500 mt-1">
                                Start Date - End Date
                              </p>
                              <p className="text-sm font-medium">
                                {(
                                  course.startDate as Date
                                ).toLocaleDateString()}{" "}
                                -{" "}
                                {(course.endDate as Date).toLocaleDateString()}
                              </p>
                            </>
                          )}
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
                            {course.capacity} seats
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
                    onClick={() => handleViewDetails(course)}
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
