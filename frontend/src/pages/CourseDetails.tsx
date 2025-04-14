import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Calendar,
  Book,
  Users,
  Clock,
  Award,
  Check,
  Percent,
} from "lucide-react";
import { useCourses } from "../context/CourseContext";

function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { courses } = useCourses();
  const course = courses.find((c) => c._id.toString() === id);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);

  // Mock time slots for the course
  // const timeSlots = [
  //   { id: 1, time: 'Mon, Wed, Fri 10:00 AM - 11:30 AM', available: true },
  //   { id: 2, time: 'Tue, Thu 1:00 PM - 2:30 PM', available: true },
  //   { id: 3, time: 'Mon, Wed 2:00 PM - 3:30 PM', available: false },
  //   { id: 4, time: 'Tue, Thu 3:00 PM - 4:30 PM', available: true },
  // ];

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors mb-8"
      >
        <ArrowLeft className="h-4 w-4 mr-1" />
        <span>Back to Search</span>
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <div className="flex justify-between items-start">
            <div className="flex items-baseline">
              <h1 className="text-3xl font-bold text-gray-900">
                {course.name}
              </h1>
              <span className="mx-2 text-gray-600">|</span>
              <p className="text-lg text-gray-600">{course.subjectCode}</p>
            </div>
            <div className="flex items-center bg-indigo-50 px-4 py-2 rounded-full"></div>
          </div>

          <div className="mt-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Users className="h-6 w-6 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Instructor</p>
                  <p className="text-base font-medium text-gray-900">
                    {course.instructor}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Calendar className="h-6 w-6 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Schedule</p>
                </div>
              </div>
              <span className="text-lg font-semibold text-indigo-600">
                {course.capacity}
              </span>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Book className="h-6 w-6 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Credits</p>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <Award className="h-6 w-6 text-indigo-600" />
                <div className="ml-4">
                  <p className="text-sm text-gray-500">Course Level</p>
                  <p className="text-base font-medium text-gray-900">
                    Undergraduate
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8"></div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Available Time Slots
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {timeSlots.map((slot) => (
                <button
                  key={slot.id}
                  onClick={() => setSelectedTimeSlot(slot.time)}
                  disabled={!slot.available}
                  className={`
                    p-4 rounded-lg border transition-all duration-200 flex items-center justify-between
                    ${
                      !slot.available
                        ? "bg-gray-100 border-gray-200 cursor-not-allowed"
                        : selectedTimeSlot === slot.time
                        ? "bg-indigo-50 border-indigo-600 text-indigo-700"
                        : "bg-white border-gray-200 hover:border-indigo-600 hover:bg-indigo-50"
                    }
                  `}
                >
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-3 text-gray-500" />
                    <span
                      className={`${
                        !slot.available ? "text-gray-400" : "text-gray-700"
                      }`}
                    >
                      {slot.time}
                    </span>
                  </div>
                  {selectedTimeSlot === slot.time && (
                    <Check className="h-5 w-5 text-indigo-600" />
                  )}
                  {!slot.available && (
                    <span className="text-sm text-gray-400">Full</span>
                  )}
                </button>
              ))}
            </div>
            {selectedTimeSlot && (
              <div className="mt-6 flex justify-end">
                <button
                  className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 transition-colors text-lg font-medium flex items-center"
                  onClick={() =>
                    alert(`Time slot selected: ${selectedTimeSlot}`)
                  }
                >
                  <Calendar className="h-5 w-5 mr-2" />
                  Add to Schedule
                </button>
              </div>
            )}
          </div>

          <div className="mt-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Enrollment Probability Score
            </h2>
            <div className="bg-gray-50 rounded-lg p-6">
              <div className="flex items-start justify-between">
                <div className="max-w-2xl">
                  <p className="text-gray-700 leading-relaxed">
                    {getEnrollmentDescription(enrollmentProbability)}
                  </p>
                </div>
                <div className="flex items-center ml-8">
                  <div
                    className={`
                    text-4xl font-bold flex items-center
                    ${
                      enrollmentProbability >= 80
                        ? "text-green-600"
                        : enrollmentProbability >= 50
                        ? "text-yellow-600"
                        : "text-red-600"
                    }
                  `}
                  >
                    {enrollmentProbability}
                    <Percent className="h-6 w-6 ml-1" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          {/* TODO: Add interactive month Calendar and probability of enrollment for each day below each date */}
        </div>
      </div>
    </div>
  );
}

export default CourseDetails;
