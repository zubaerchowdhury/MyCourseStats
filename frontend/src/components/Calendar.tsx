import React, { useEffect, useState } from "react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [calendarData, setCalendarData] = useState<[number[], number[]]>([
    [],
    [],
  ]);

  const monthStr = format(currentMonth, "yyyy-MM");
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const allDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  useEffect(() => {
    
  }, [monthStr, courseStats]);

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  const [cumulativeWeekly, dailyPercent] = calendarData;
  const paddingDays = Array(getDay(monthStart)).fill(null);

  const weeks: Week[] = [];
  let currentWeek: (CalendarDay | null)[] = [];
  let cumulativeIndex = 0;

  paddingDays.forEach(() => currentWeek.push(null));

  allDays.forEach((date, i) => {
    currentWeek.push({
      date,
      daily: dailyPercent[i] ?? null,
    });

    if (getDay(date) === 6 || i === allDays.length - 1) {
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
      <div className="flex items-center justify-between mb-4">
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
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Weekly %"].map(
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
                  ${!day ? "bg-gray-50" : "bg-white hover:bg-gray-50"}
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
                      {day.daily !== null ? `${day.daily.toFixed(1)}%` : "--"}
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
  );
};

export default Calendar;
