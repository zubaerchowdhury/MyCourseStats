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
  addDays,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
  isSameMonth,
  differenceInCalendarDays,
  differenceInCalendarWeeks,
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

  // Initialize currentMonth (0 index) based on searchParams or default
  const getInitialMonth = () => {
    if (!semesterDates) return new Date(); // Default to current date if no semester info
    // Start view from the month of the enrollment start date
    return startOfMonth(semesterDates.enrollmentStartDate);
  };

  const getColorForPercentage = (value: number) => {
    //value from 0 to 1
    let hue = ((1 - value) * 120).toString(10);
    return `hsl(${hue},100%,32%)`;
  };

  const [currentMonth, setCurrentMonth] = useState(getInitialMonth());
  // Keep the raw courseStats data
  const [rawCourseStats, setRawCourseStats] = useState<number[][] | null>(null);

  // Add custom text size CSS
  useEffect(() => {
    // Add this once when component mounts
    const style = document.createElement("style");
    style.innerHTML = `
    .text-2xs {
      font-size: 0.65rem;
      line-height: 0.75rem;
    }
  `;
    document.head.appendChild(style);

    // Clean up when component unmounts
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  // Effect to update rawCourseStats when courseStats prop changes
  useEffect(() => {
    // Update rawCourseStats when courseStats prop changes
    if (courseStats && courseStats.length >= 3) {
      setRawCourseStats(courseStats);
    } else {
      setRawCourseStats(null); // Reset if data is invalid
    }
    // Recalculate initial month if semester/year changes (via searchParams)
    setCurrentMonth(getInitialMonth());
  }, [courseStats, semester, year]); // Depend on courseStats and params

  const handlePrevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
  const handleNextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));

  // Prepare calendar grid data within the component body, reacting to state changes
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 }); // Start grid on Monday
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 }); // End grid on Sunday
  const allDays = eachDayOfInterval({ start: calendarStart, end: calendarEnd });

  const weeks: Week[] = [];
  if (rawCourseStats && semesterDates) {
    const [
      filledPercentages, // Daily data
      _dailyChangePercent, // Not used in this logic directly for daily display. Assuming filledPercentages is needed.
      totalWeeklyPercentageChanges, // Weekly cumulative data
    ] = rawCourseStats;

    const { enrollmentStartDate, classesEndDate } = semesterDates;
    const endDatePlusOne = addDays(classesEndDate, 1); // Include the last day of classes
    const startWeekOfSemester = startOfWeek(enrollmentStartDate, {
      weekStartsOn: 1,
    });

    let currentWeekDays: (CalendarDay | null)[] = [];

    allDays.forEach((date, index) => {
      let dailyValue: number | null = null;

      // Check if the date is within the valid semester range
      if (date >= enrollmentStartDate && date <= endDatePlusOne) {
        const dayIndex =
          differenceInCalendarDays(date, enrollmentStartDate) - 1;
        if (dayIndex >= 0 && dayIndex < filledPercentages.length) {
          dailyValue = filledPercentages[dayIndex];
        }
      }

      currentWeekDays.push({
        date,
        daily: dailyValue,
      });

      // If it's Sunday (end of the week in our grid) or the last day overall
      if (getAdjustedDay(date) === 6 || index === allDays.length - 1) {
        let cumulativeValue: number | null = null;
        const startOfWeekForCalc = startOfWeek(date, { weekStartsOn: 1 });

        // Check if this week overlaps with the semester's active weeks
        // A week is relevant if its start is on or after the semester's start week
        // and it contains days within the enrollment-to-class-end period.
        const isWeekRelevant = currentWeekDays.some(
          (d) => d && d.date >= enrollmentStartDate && d.date <= classesEndDate
        );

        if (isWeekRelevant && startOfWeekForCalc >= startWeekOfSemester) {
          const weekIndex =
            differenceInCalendarWeeks(startOfWeekForCalc, startWeekOfSemester, {
              weekStartsOn: 1,
            }) - 1;

          if (
            weekIndex >= 0 &&
            weekIndex < totalWeeklyPercentageChanges.length
          ) {
            cumulativeValue = totalWeeklyPercentageChanges[weekIndex];
          }
        }

        weeks.push({
          days: [...currentWeekDays], // Push a copy
          cumulative: cumulativeValue,
        });
        currentWeekDays = []; // Reset for the next week
      }
    });
  } else {
    // Handle case where data is not available - generate empty weeks structure
    let currentWeekDays: (CalendarDay | null)[] = [];
    allDays.forEach((date, index) => {
      currentWeekDays.push({ date, daily: null });
      if (getAdjustedDay(date) === 6 || index === allDays.length - 1) {
        weeks.push({ days: [...currentWeekDays], cumulative: null });
        currentWeekDays = [];
      }
    });
  }

  return (
		<div className="w-full mx-auto p-2 sm:p-4">
			<div className="flex flex-col md:flex-row md:items-start gap-4 md:gap-8">
				<div className="flex-1 overflow-x-auto">
					<div className="flex items-center justify-center gap-4 sm:gap-8 mb-4">
						<button
							onClick={handlePrevMonth}
							className="p-1 sm:p-2 hover:bg-gray-100 rounded-full"
							aria-label="Previous month"
						>
							<ChevronLeft className="h-4 w-4 sm:h-5 sm:w-5" />
						</button>
						<h2 className="text-base sm:text-lg font-bold min-w-[120px] sm:min-w-[160px] text-center">
							{format(currentMonth, "MMMM yyyy")}
						</h2>
						<button
							onClick={handleNextMonth}
							className="p-1 sm:p-2 hover:bg-gray-100 rounded-full"
							aria-label="Next month"
						>
							<ChevronRight className="h-4 w-4 sm:h-5 sm:w-5" />
						</button>
					</div>
	
					<div className="min-w-[600px] md:min-w-0"> {/* Allow horizontal scroll on mobile */}
						<div className="grid grid-cols-8 text-center text-xs sm:text-sm font-semibold mb-2">
							{[
								"Mon",
								"Tue",
								"Wed",
								"Thu",
								"Fri",
								"Sat",
								"Sun",
								"Weekly Change",
							].map((day) => (
								<div
									key={day}
									className={`py-1 sm:py-2 ${
										day === "Sat"
											? "text-[#1E90FF]"
											: day === "Sun"
											? "text-[#FF0800]"
											: "text-gray-600"
									}`}
								>
									{day}
								</div>
							))}
						</div>
	
						<div className="flex flex-col gap-1 sm:gap-2">
							{weeks.map((week, weekIdx) => (
								<div key={weekIdx} className="grid grid-cols-8 gap-1 sm:gap-2">
									{week.days.map((day, idx) => (
										<div
											key={idx}
											className="h-12 sm:h-16 flex flex-col items-center justify-center border rounded-lg transition-colors duration-200"
											style={{
												backgroundColor: !isSameMonth(day!.date, currentMonth)
													? "rgb(229,231,235)"
													: isDateInSemester(semester, year, day!.date)
													? getSemesterColorByDate(semester, year, day!.date)
													: "white",
												color: !isSameMonth(day!.date, currentMonth)
													? "rgb(107,114,128)"
													: "black",
											}}
										>
											{day && (
												<>
													<span className="font-semibold text-xs sm:text-sm">
														{format(day.date, "d")}
													</span>
													{day.daily !== null ? (
														<span
															className="text-3xs sm:text-sm font-medium"
															style={{
																color: getColorForPercentage(day.daily / 100),
															}}
														>
															{`${day.daily.toFixed(1)}%`}
														</span>
													) : (
														<span className="text-2xs sm:text-xs text-gray-400">--</span>
													)}
												</>
											)}
										</div>
									))}
									<div className="h-12 sm:h-16 flex flex-col items-center justify-center border rounded-lg bg-blue-100">
										<span className="text-blue-700 text-3xs sm:text-xs font-bold">
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
				</div>
				
				{/* Legend section - stacks vertically on mobile */}
				<div className="mt-6 md:mt-28 flex flex-col gap-3 md:gap-4 md:min-w-[200px]">
					<div className="text-sm font-medium mb-1">Legend</div>
					<div className="flex items-center">
						<span className="text-xs mr-1 italic">𝐗%</span>
						<span className="text-xs sm:text-sm text-gray-600"> Seats filled</span>
					</div>
					<div className="grid grid-cols-2 md:grid-cols-1 gap-2 md:gap-3">
						<div className="flex items-center">
							<div
								className="w-3 h-3 sm:w-4 sm:h-4 rounded mr-1 sm:mr-2"
								style={{
									backgroundColor: getSemesterColor("enrollmentStartDate"),
								}}
							></div>
							<span className="text-xs sm:text-sm text-gray-600">Enrollment Start</span>
						</div>
						<div className="flex items-center">
							<div
								className="w-3 h-3 sm:w-4 sm:h-4 rounded mr-1 sm:mr-2"
								style={{ backgroundColor: getSemesterColor("classesBeginDate") }}
							></div>
							<span className="text-xs sm:text-sm text-gray-600">Classes Begin</span>
						</div>
						<div className="flex items-center">
							<div
								className="w-3 h-3 sm:w-4 sm:h-4 rounded mr-1 sm:mr-2"
								style={{
									backgroundColor: getSemesterColor("deadlineAddCourseDate"),
								}}
							></div>
							<span className="text-xs sm:text-sm text-gray-600">
								Add Deadline
							</span>
						</div>
						<div className="flex items-center">
							<div
								className="w-3 h-3 sm:w-4 sm:h-4 rounded mr-1 sm:mr-2"
								style={{
									backgroundColor: getSemesterColor(
										"deadlineDropCourseWithoutWDate"
									),
								}}
							></div>
							<span className="text-xs sm:text-sm text-gray-600">
								Drop Without 'W'
							</span>
						</div>
						<div className="flex items-center">
							<div
								className="w-3 h-3 sm:w-4 sm:h-4 rounded mr-1 sm:mr-2"
								style={{
									backgroundColor: getSemesterColor(
										"deadlineDropCourseWithWDate"
									),
								}}
							></div>
							<span className="text-xs sm:text-sm text-gray-600">
								Drop With 'W'
							</span>
						</div>
						<div className="flex items-center">
							<div
								className="w-3 h-3 sm:w-4 sm:h-4 rounded mr-1 sm:mr-2"
								style={{ backgroundColor: getSemesterColor("classesEndDate") }}
							></div>
							<span className="text-xs sm:text-sm text-gray-600">Classes End</span>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

export default Calendar;
