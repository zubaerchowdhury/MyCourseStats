import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
} from "date-fns";

// Add this helper function after the imports
const getAdjustedDay = (date: Date): number => {
  const day = getDay(date);
  return day === 0 ? 6 : day - 1; // Convert Sunday (0) to 6, and other days to 0-5
};

interface CalendarDay {
  date: Date;
  daily: number | null;
}

interface Week {
  days: (CalendarDay | null)[];
  cumulative: number | null;
}

interface CalendarProps {
  courseStats: number[][];
}

/* Calendar for displaying enrollment percetages for a month with a added column rightmost for cumulative enrollment for the week */
const Calendar: React.FC<CalendarProps> = ({ courseStats }) => {
  const [searchParams] = useSearchParams();
  const semester = searchParams.get("semester");
  const year = searchParams.get("year");

  // Initialize currentMonth based on searchParams
  const getInitialMonth = () => {
    if (semester === "Spring" && year === "2025") {
      return new Date(2024, 10); // November is 10 (0-based month)
    } else if (semester === "Fall" && year === "2025") {
      return new Date(2025, 2); // March is 2 (0-based month)
    }
    return new Date();
  };

  const [currentMonth, setCurrentMonth] = useState(getInitialMonth());
  const [calendarData, setCalendarData] = useState<[number[], number[]]>([
    [],
    [],
  ]);

  const monthStr = format(currentMonth, "yyyy-MM");
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {}, [monthStr, courseStats]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const [cumulativeWeekly, dailyPercent] = calendarData;
  const paddingDays = Array(getAdjustedDay(monthStart)).fill(null);

  const weeks: Week[] = [];
  let currentWeek: (CalendarDay | null)[] = [];
  let cumulativeIndex = 0;

  paddingDays.forEach(() => currentWeek.push(null));

  allDays.forEach((date, i) => {
    currentWeek.push({
      date,
      daily: dailyPercent[i] ?? null,
    });

    if (getAdjustedDay(date) === 6 || i === allDays.length - 1) {
      // Fill remaining days in last week
      const remainingDays = 7 - currentWeek.length;
      for (let j = 0; j < remainingDays; j++) {
        currentWeek.push(null);
      }

      weeks.push({
        days: currentWeek,
        cumulative: cumulativeWeekly[cumulativeIndex++] ?? null,
      });
      currentWeek = [];
    }
  });

  return (
    <div className="w-full max-w-3xl mx-auto p-4">
      <div className="flex items-start gap-8">
        <div className="flex-1">
          <div className="flex items-start gap-8 mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold">
              {format(currentMonth, "MMMM yyyy")}
            </h2>
            <button
              onClick={handleNextMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Next month"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          <div className="grid grid-cols-8 text-center text-sm font-semibold text-gray-600 mb-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Weekly %"].map(
              (day) => (
                <div key={day} className="py-2">
                  {day}
                </div>
              )
            )}
          </div>

          <div className="flex flex-col gap-2">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="grid grid-cols-8 gap-2">
                {week.days.map((day, idx) => (
                  <div
                    key={idx}
                    className={`
                  h-16 flex flex-col items-center justify-center border rounded-lg
                  ${
                    // pickle color cell for Spring & Fall 2025 enrollment start date
                    !day
                      ? "bg-gray-50"
                      : format(day.date, "yyyy-MM-dd") === "2024-11-04" ||
                        format(day.date, "yyyy-MM-dd") === "2025-03-31"
                      ? "bg-[#C9E4C5]" // pickle color for enrollment start dates
                      : format(day.date, "yyyy-MM-dd") === "2025-01-22" ||
                        format(day.date, "yyyy-MM-dd") === "2025-08-27"
                      ? "bg-[#FF6B6B]" // poppy red color for additional dates
                      : "bg-white hover:bg-gray-50"
                  }
                  transition-colors duration-200
                `}
                  >
                    {day && (
                      <>
                        <span className="font-semibold text-sm">
                          {format(day.date, "d")}
                        </span>
                        <span
                          className={`text-xs ${
                            day.daily !== null
                              ? day.daily > 70
                                ? "text-green-600"
                                : day.daily > 40
                                ? "text-yellow-600"
                                : "text-red-600"
                              : "text-gray-400"
                          }`}
                        >
                          {day.daily !== null
                            ? `${day.daily.toFixed(1)}%`
                            : "--"}
                        </span>
                      </>
                    )}
                  </div>
                ))}
                <div className="h-16 flex flex-col items-center justify-center border rounded-lg bg-blue-50">
                  <span className="text-blue-600 text-sm font-bold">
                    {week.cumulative !== null
                      ? `${week.cumulative.toFixed(1)}%`
                      : "--"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
        {/* Legend section */}
        <div className="mt-28 flex flex-col gap-4 min-w-[200px]">
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#C9E4C5] rounded mr-2"></div>
            <span className="text-sm text-gray-600">Enrollment Start Date</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#FF6B6B] rounded mr-2"></div>
            <span className="text-sm text-gray-600">
              Last Day to Add a Course
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
