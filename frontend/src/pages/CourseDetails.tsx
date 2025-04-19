import { useState, useEffect } from "react";
import { useNavigate, useSearchParams, useLocation } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import Calendar from "../components/Calendar";
import { CourseSection } from "../types/CourseTypes";

function CourseDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [courseStats, setCourseStats] = useState<number[][]>([]);
  const location = useLocation();
  const section: CourseSection = location.state?.courseSection;

	const searchParamsHasAllVars = (): boolean => {
		return searchParams.has("semester") && searchParams.has("year") && searchParams.has("classNumber");
	};

  useEffect(() => {
    const fetchEnrollmentRate = async () => {
      if (!section && !searchParamsHasAllVars()) return;

      try {
        const params = new URLSearchParams({
          semester: searchParams.get("semester") || "",
          year: searchParams.get("year") || "",
          classNumber: section.classNumber.toString(),
          startingDate: new Date().toISOString(),
          numDays: "7",
        });

        const response = await fetch(
          `/api/stats/enrollment-rate?${params.toString()}`
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
      }
    };

    fetchEnrollmentRate();
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

  if (!section) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Course not found</h2>
          <button
            onClick={() => navigate("/search")}
            className="mt-4 text-indigo-600 hover:text-indigo-800"
          >
            Return to search
          </button>
        </div>
      </div>
    );
  }

  // TODO: Remove mock UI components and render course section from transformedCourse
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        <span>Back to Search</span>
      </button>

      <div className="mt-8">
        <Calendar courseStats={courseStats} />
      </div>
    </div>
  );
}

export default CourseDetails;
