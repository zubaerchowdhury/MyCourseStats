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
  startOfWeek,
  endOfWeek,
  isSameMonth,
} from "date-fns";

// adjusted getDay function to convert Sunday (0) to 6
const getAdjustedDay = (date: Date): number => {
  const day = getDay(date);
  return day === 0 ? 6 : day - 1;
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

  // Initialize currentMonth (0 index) based on searchParams
  const getInitialMonth = () => {
    if (semester === "Spring" && year === "2025") {
      return new Date(2024, 10);
    } else if (semester === "Fall" && year === "2025") {
      return new Date(2025, 2);
    }
    return new Date();
  };

  // Color the calendar cells based on the semester and year
  const getDateCellColor = (
    date: Date,
    semester: string | null,
    year: string | null
  ) => {
    const dateStr = format(date, "yyyy-MM-dd");

    /* enrollment start date, 
       deadline to add a course,
       classes begin,
       deadline to drop a course without a 'W', 
       deadline to drop a course with a 'W',
       classes end */
    if (semester === "Spring" && year === "2025") {
      if (dateStr === "2024-11-04") return "bg-[#C9E4C5]";
      if (dateStr === "2025-01-13") return "bg-[#FC8EAC]";
      if (dateStr === "2025-01-22") return "bg-[#FF6B6B]";
      if (dateStr === "2025-01-29") return "bg-[#FFDB00]";
      if (dateStr === "2025-04-11") return "bg-[#F28500]";
      if (dateStr === "2025-04-28") return "bg-[#9370DB]";
    } else if (semester === "Fall" && year === "2025") {
      if (dateStr === "2025-03-31") return "bg-[#C9E4C5]";
      if (dateStr === "2025-08-18") return "bg-[#FC8EAC]";
      if (dateStr === "2025-08-27") return "bg-[#FF6B6B]";
      if (dateStr === "2025-09-03") return "bg-[#FFDB00]";
      if (dateStr === "2025-11-07") return "bg-[#F28500]";
      if (dateStr === "2025-12-02") return "bg-[#9370DB]";
    }
    return "bg-white hover:bg-gray-50";
  };

  const [currentMonth, setCurrentMonth] = useState(getInitialMonth());
  const [calendarData, setCalendarData] = useState<[number[], number[]]>([
    [],
    [],
  ]);

  const monthStr = format(currentMonth, "yyyy-MM");
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start from Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 }); // End on Sunday
  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  useEffect(() => {
    if (courseStats && courseStats.length >= 2) {
      const [filledPercentages, changedPercentages] = courseStats;

      // For Spring 2025, start from November 4, 2024
      // For Fall 2025, start from March 31, 2025
      let startDate = new Date();
      if (semester === "Spring" && year === "2025") {
        startDate = new Date(2024, 10, 4); // November 4, 2024
      } else if (semester === "Fall" && year === "2025") {
        startDate = new Date(2025, 2, 31); // March 31, 2025
      }

      setCalendarData([filledPercentages, changedPercentages]);
    }
  }, [monthStr, courseStats, semester, year]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const [cumulativeWeekly, dailyPercent] = calendarData;

  //const paddingDays = Array(getAdjustedDay(monthStart)).fill(null);

  const weeks: Week[] = [];
  let currentWeek: (CalendarDay | null)[] = [];
  let cumulativeIndex = 0;

  //paddingDays.forEach(() => currentWeek.push(null));

  allDays.forEach((date, i) => {
    currentWeek.push({
      date,
      daily: dailyPercent[i] ?? null,
    });

    if (getAdjustedDay(date) === 6 || i === allDays.length - 1) {
      // Fill remaining days in last week
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
          <div className="flex items-center justify-center gap-8 mb-4">
            <button
              onClick={handlePrevMonth}
              className="p-2 hover:bg-gray-100 rounded-full"
              aria-label="Previous month"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <h2 className="text-lg font-bold min-w-[160px] text-center">
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

          <div className="grid grid-cols-8 text-center text-sm font-semibold mb-2">
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Weekly %"].map(
              (day) => (
                <div
                  key={day}
                  className={`py-2 ${
                    day === "Sat"
                      ? "text-[#1E90FF]"
                      : day === "Sun"
                      ? "text-[#FF0800]"
                      : "text-gray-600"
                  }`}
                >
                  {day}
                </div>
              )
            )}
          </div>

          <div className="flex flex-col gap-2">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="grid grid-cols-8 gap-2">
                {week.days.map((day, idx) => (
                  // Highlight the cell based on the semester and year
                  <div
                    key={idx}
                    className={`
                h-16 flex flex-col items-center justify-center border rounded-lg
                ${
                  !isSameMonth(day!.date, currentMonth)
                    ? "bg-gray-100 text-gray-400"
                    : getDateCellColor(day!.date, semester, year)
                }
                transition-colors duration-200
              `}
                  >
                    {/* Display the date and percentage */}
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
            <div className="w-4 h-4 bg-[#FC8EAC] rounded mr-2"></div>
            <span className="text-sm text-gray-600">Classes begin</span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#FF6B6B] rounded mr-2"></div>
            <span className="text-sm text-gray-600">
              Deadline to Add a Course
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#FFDB00] rounded mr-2"></div>
            <span className="text-sm text-gray-600">
              Deadline to Drop a Course without a 'W'
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#F28500] rounded mr-2"></div>
            <span className="text-sm text-gray-600">
              Deadline to Drop a Course with a 'W'
            </span>
          </div>
          <div className="flex items-center">
            <div className="w-4 h-4 bg-[#9370DB] rounded mr-2"></div>
            <span className="text-sm text-gray-600">Classes end @ 11:00PM</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
