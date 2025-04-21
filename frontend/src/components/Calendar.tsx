import React, { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useSearchParams } from "react-router-dom";
import {
  getSemesterDates,
  getSemesterColor,
  getSemesterColorByDate,
  isDateInSemester,
} from "../data/SemesterDates";
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
  const semester = searchParams.get("semester") || "";
  const year = searchParams.get("year") || "";
  const semesterDates = getSemesterDates(semester, year);

  // Initialize currentMonth (0 index) based on searchParams
  const getInitialMonth = () => {
    if (!semesterDates) return new Date();
    return semesterDates.enrollmentStartDate;
  };

  const getColorForPercentage = (value: number) => {
    //value from 0 to 1
    let hue = ((1 - value) * 120).toString(10);
    return `hsl(${hue},100%,32%)`;
  };

  const [currentMonth, setCurrentMonth] = useState(getInitialMonth());
  const [calendarData, setCalendarData] = useState<
    [number[], number[], number[]]
  >([[], [], []]);

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start from Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 }); // End on Sunday
  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  useEffect(() => {
    if (courseStats && courseStats.length >= 2) {
      const [
        filledPercentages,
        changedPercentages,
        averageWeeklyPercentageChanges,
      ] = courseStats;
      setCalendarData([
        filledPercentages,
        changedPercentages,
        averageWeeklyPercentageChanges,
      ]);
    }
  }, [currentMonth, courseStats]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const [dailyPercent, dailyChangePercent, cumulativeWeekly] = calendarData;

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
            {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun", "Average %/Day"].map(
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
                    className="h-16 flex flex-col items-center justify-center border rounded-lg transition-colors duration-200"
                    style={{
                      backgroundColor: !isSameMonth(day!.date, currentMonth)
                        ? "rgb(229,231,235)" // gray-200 for out-of-month
                        : isDateInSemester(semester, year, day!.date)
                        ? getSemesterColorByDate(semester, year, day!.date)
                        : "white",
                      color: !isSameMonth(day!.date, currentMonth)
                        ? "rgb(107,114,128)" // gray-500 for out-of-month text
                        : "black",
                    }}
                  >
                    {/* Display the date and percentage */}
                    {day && (
                      <>
                        <span className="font-semibold text-sm">
                          {format(day.date, "d")}
                        </span>
                        {day.daily !== null ? (
                          <span
                            className="text-xs font-medium" // Added font-medium for better visibility
                            style={{
                              color: getColorForPercentage(day.daily / 100),
                            }} // Apply color via inline style
                          >
                            {`${day.daily.toFixed(1)}%`}
                          </span>
                        ) : (
                          <span className="text-xs text-gray-400">--</span>
                        )}
                      </>
                    )}
                  </div>
                ))}
                <div className="h-16 flex flex-col items-center justify-center border rounded-lg bg-blue-100">
                  <span className="text-blue-700 text-xs font-bold">
                    {week.cumulative !== null
                      ? week.cumulative >= 0
                        ? `+${week.cumulative.toFixed(1)}%`
                        : `${week.cumulative.toFixed(1)}%`
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
            <div
              className="w-4 h-4 rounded mr-2"
              style={{
                backgroundColor: getSemesterColor("enrollmentStartDate"),
              }}
            ></div>
            <span className="text-sm text-gray-600">Enrollment Start Date</span>
          </div>
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded mr-2"
              style={{ backgroundColor: getSemesterColor("classesBeginDate") }}
            ></div>
            <span className="text-sm text-gray-600">Classes begin</span>
          </div>
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded mr-2"
              style={{
                backgroundColor: getSemesterColor("deadlineAddCourseDate"),
              }}
            ></div>
            <span className="text-sm text-gray-600">
              Deadline to Add a Course
            </span>
          </div>
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded mr-2"
              style={{
                backgroundColor: getSemesterColor(
                  "deadlineDropCourseWithoutWDate"
                ),
              }}
            ></div>
            <span className="text-sm text-gray-600">
              Deadline to Drop a Course without a 'W'
            </span>
          </div>
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded mr-2"
              style={{
                backgroundColor: getSemesterColor(
                  "deadlineDropCourseWithWDate"
                ),
              }}
            ></div>
            <span className="text-sm text-gray-600">
              Deadline to Drop a Course with a 'W'
            </span>
          </div>
          <div className="flex items-center">
            <div
              className="w-4 h-4 rounded mr-2"
              style={{ backgroundColor: getSemesterColor("classesEndDate") }}
            ></div>
            <span className="text-sm text-gray-600">Classes end @ 11:00PM</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
