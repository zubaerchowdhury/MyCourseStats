import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import Calendar from "../components/Calendar";
import { CourseSection } from "../types/CourseTypes";
import { getSemesterDates } from "../data/SemesterDates";

function CourseDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [courseStats, setCourseStats] = useState<number[][]>([]);
  const [courseSection, setCourseSection] = useState<CourseSection | null>(
    null
  );
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [sectionLoading, setSectionLoading] = useState<boolean>(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [calendarLoading, setCalendarLoading] = useState<boolean>(false);
  const location = useLocation();
  const section: CourseSection = location.state?.courseSection;

  const searchParamsHasAllVars = (): boolean => {
    return (
      searchParams.has("semester") &&
      searchParams.has("year") &&
      searchParams.has("classNumber")
    );
  };

  // Fetch the course section data
  useEffect(() => {
    const fetchEnrollmentRate = async () => {
      if (!searchParamsHasAllVars()) return;

      setCalendarLoading(true);
      try {
        const semester = searchParams.get("semester");
        const year = searchParams.get("year");
        const classNumber = searchParams.get("classNumber");

        // Fetch the enrollment rate data
        // Use the semester and year to get the correct dates
        const semesterDates = getSemesterDates(semester!, year!);
        if (!semesterDates) {
          throw new Error(
            "Enrollment data not available for the selected semester and year."
          );
        }
        const params = new URLSearchParams({
          semester: semester!,
          year: year!,
          classNumber: classNumber!,
          startingDate: semesterDates!.enrollmentStartDate.toISOString(),
          numDays: "100",
        });

        const response = await fetch(
          `http://localhost:5184/api/stats/enrollment-rate?${params.toString()}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // The response contains [filledPercentages, changedPercentages, averageChange]
        // We take the most recent filled percentage
        const stats: number[][] = data;
        setCourseStats(stats);
      } catch (error) {
        console.error("Failed to fetch enrollment rate:", error);
        setCourseStats([]);
        setCalendarError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
      } finally {
        setCalendarLoading(false);
      }
    };

    fetchEnrollmentRate();
  }, [searchParams]);

  // Fetch the course section data if it is not already set
  useEffect(() => {
    const fetchCourseSection = async () => {
      if (section) {
        // If the section is already set, no need to fetch it again
        setCourseSection(section);
        return;
      }

      setSectionLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5184/api/Courses/course-search?${section.id}`
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCourseSection(data);
      } catch (error) {
        console.error("Failed to fetch course section:", error);
        setSectionError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
      } finally {
        setSectionLoading(false);
      }
    };
    fetchCourseSection();
  }, [section]);

  const getEnrollmentDescription = (enrollmentProbability: number) => {
    if (enrollmentProbability >= 80 && enrollmentProbability <= 100) {
      return "Very High Chance: This course typically fills up quickly. Immediate registration is recommended.";
    } else if (enrollmentProbability >= 50) {
      return "Good Chance: The course has moderate demand. Registration within the next week is advised.";
    } else if (enrollmentProbability >= 20) {
      return "Poor Chance: You have little chance of securing a spot. Monitor the enrollment status.";
    } else if (enrollmentProbability >= 0) {
      return "Very Low Chance: The course is nearly full. Please consider waitlist options or alternative courses.";
    } else {
      return "Error: Invalid probability score.";
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {
        /*!section*/ false ? (
          <div className="text-center">
            <h2 className="text-2xl font-bold text-gray-900">
              Course not found
            </h2>
          </div>
        ) : (
          <div className="mt-8">
            <Calendar courseStats={courseStats} />
          </div>
        )
      }
    </div>
  );
}

export default CourseDetails;
