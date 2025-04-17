import React, { useState } from "react";
import {
  useNavigate,
  useSearchParams,
  useLocation,
} from "react-router-dom";
import Calendar from "../components/Calendar";
import {
  ArrowLeft,
  Book,
  Users,
  Clock,
  Award,
  Check,
  Percent,
} from "lucide-react";

function CourseDetails() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
	const [courseStats, setCourseStats] = useState<number[][]>([]);
  const location = useLocation();
  const course = location.state?.course;

  // TODO: Use fetch to get the enrollment probability from the backend
  const enrollmentProbability = 85;

  const getEnrollmentDescription = (probability: number) => {
    if (probability >= 80 && probability <= 100) {
      return "Very High Chance: This course typically fills up quickly. Immediate registration is recommended.";
    } else if (probability >= 50) {
      return "Good Chance: The course has moderate demand. Registration within the next week is advised.";
    } else if (probability >= 20) {
      return "Poor Chance: You have little chance of securing a spot. Monitor the enrollment status.";
    } else if (probability >= 0) {
      return "Very Low Chance: The course is nearly full. Please consider waitlist options or alternative courses.";
    } else {
      return "Error: Invalid probability score.";
    }
  };

  if (!course) {
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
