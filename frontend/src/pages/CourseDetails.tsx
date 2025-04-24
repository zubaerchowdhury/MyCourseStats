import { useState, useEffect } from "react";
import { useSearchParams, useLocation } from "react-router-dom";
import Calendar from "../components/Calendar";
import { CourseSection, CourseContainer } from "../types/CourseTypes";
import { SemesterDates, getSemesterDates } from "../data/SemesterDates";
import { differenceInCalendarDays } from "date-fns";
import {
  Alert,
  AlertColor,
  Box,
  CircularProgress,
  Paper,
  Typography,
} from "@mui/material";
import { BookOpen } from "lucide-react";

function CourseDetails() {
  const location = useLocation();
  const section: CourseSection = location.state?.courseSection;
  const [searchParams] = useSearchParams();
  const [courseStats, setCourseStats] = useState<number[][]>([]);
  const [courseSection, setCourseSection] = useState<CourseSection | null>(
    null
  );
  const [semesterDates, setSemesterDates] = useState<SemesterDates | null>(
    null
  );

  const [pastInstructors, setPastInstructors] = useState<string[]>([]);
  const [sectionError, setSectionError] = useState<string | null>(null);
  const [sectionLoading, setSectionLoading] = useState<boolean>(false);
  const [calendarError, setCalendarError] = useState<string | null>(null);
  const [calendarLoading, setCalendarLoading] = useState<boolean>(false);
  const [instructorsError, setInstructorsError] = useState<string | null>(null);
  const [instructorsLoading, setInstructorsLoading] = useState<boolean>(false);

  // This variable is used to determine how many days it took to fill the course
  const [numDaysToFillCourse, setNumDaysToFillCourse] = useState<number>(0);

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
        const dates = getSemesterDates(semester!, year!);
        setSemesterDates(dates);
        if (!dates) {
          throw new Error(
            "Enrollment data not available for the selected semester and year."
          );
        }
        const params = new URLSearchParams({
          semester: semester!,
          year: year!,
          classNumber: classNumber!,
          startingDate: dates!.enrollmentStartDate.toISOString(),
          numDays: (
            differenceInCalendarDays(
              dates!.classesEndDate,
              dates!.enrollmentStartDate
            ) + 1
          ).toString(),
        });

        const response = await fetch(
          `http://localhost:5184/api/stats/enrollment-rate?${params.toString()}`
        );

        if (!response.ok) {
          if (response.status >= 500) {
            throw new Error(
              "Server error when fetching enrollment rate. Please try again later."
            );
          }
          if (response.status === 404) {
            return;
          }
          throw new Error("Failed to fetch enrollment rate data.");
        }

        const data = await response.json();

        // The response contains [filledPercentages, changedPercentages, averageChange]
        // We take the most recent filled percentage
        const stats: number[][] = data;
        setCourseStats(stats);
      } catch (error) {
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

      if (!searchParamsHasAllVars()) return;

      setSectionLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5184/api/Courses/course-search?${searchParams.toString()}`
        );

        if (!response.ok) {
          if (response.status >= 500) {
            throw new Error(
              "Server error when fetching course section. Please try again later."
            );
          }
          if (response.status === 404) {
            return;
          }
          throw new Error("Failed to fetch course section data.");
        }

        const data: CourseContainer[] = await response.json();
        const resultSection: CourseSection = (data[0].courseWithOneMeeting ||
          data[0].courseWithMultipleMeetings)!;
        setCourseSection(resultSection); // Assuming the first result is the desired course section
      } catch (error) {
        setSectionError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
      } finally {
        setSectionLoading(false);
      }
    };
    fetchCourseSection();
  }, [section, searchParams]);

  // Fetch the past instructors data
  useEffect(() => {
    const fetchPastInstructors = async () => {
      if (!courseSection) return;
      setInstructorsLoading(true);
      try {
        const response = await fetch(
          `http://localhost:5184/api/Courses/historical-instructors?${new URLSearchParams(
            {
              subjectCode: courseSection.subjectCode,
              catalogNumber: courseSection.catalogNumber,
            }
          ).toString()}`
        );

        if (!response.ok) {
          if (response.status >= 500) {
            throw new Error(
              "Server error when fetching past instructors. Please try again later."
            );
          }
          throw new Error("Failed to fetch past instructors data.");
        }

        const data: string[] = await response.json();
        setPastInstructors(data);
      } catch (error) {
        setInstructorsError(
          error instanceof Error ? error.message : "Unknown error occurred"
        );
      } finally {
        setInstructorsLoading(false);
      }
    };
    fetchPastInstructors();
  }, [courseSection]);

  // Calculate the number of days it took to fill the course
  useEffect(() => {
    if (!courseStats || courseStats.length === 0 || !semesterDates) {
      setNumDaysToFillCourse(-1); // No data available
      return;
    }

    const filledPercentages = courseStats[0];
    const filledDays = filledPercentages.findIndex(
      (percentage) => percentage >= 100
    );

    setNumDaysToFillCourse(filledDays + 1);
  }, [courseStats, semesterDates]);

  const getEnrollmentSummary = (numDaysToFillCourse: number) => {
    const fillString = (
      <>
        This course filled up in <b>{numDaysToFillCourse}</b> days.
      </>
    );
    let innerElement = null;
    let color = "";
    if (numDaysToFillCourse >= 31) {
      innerElement = (
        <>
          Low Demand: {fillString} You should be able to register without any
          issues.
        </>
      );
      color = "success";
    } else if (numDaysToFillCourse >= 8) {
      innerElement = (
        <>
          Moderate Demand: {fillString} Registration within the first week is
          advised.
        </>
      );
      color = "warning";
    } else if (numDaysToFillCourse >= 1) {
      innerElement = (
        <>
          High Demand: {fillString} Enroll immediately or check the calendar to
          see if more spots opened up.
        </>
      );
      color = "error";
    } else {
      innerElement = (
        <>
          Course never filled! You should be able to register without any
          issues.
        </>
      );
      color = "success";
    }
    return (
      <Alert severity={color as AlertColor} sx={{ mt: 2 }}>
        {innerElement}
      </Alert>
    );
  };

  return (
    <Box
      className="mx-auto px-3 sm:px-4 md:px-6 lg:px-8 py-4 sm:py-6 md:py-8"
      sx={{
        maxWidth: {
          xs: "100%",
          sm: "540px",
          md: "720px",
          lg: "960px",
          xl: "1140px",
        },
      }}
    >
      {sectionLoading || calendarLoading || instructorsLoading ? (
        // ... Loading indicator ...
        <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
          <CircularProgress size={60} />
          <Typography sx={{ ml: 2, alignSelf: "center" }}>
            Loading data...
          </Typography>
        </Box>
      ) : !courseSection && !sectionError && !calendarError ? (
        <Box className="text-center py-8 sm:py-12 md:py-16">
          <Box className="flex justify-center">
            <BookOpen className="h-12 w-12 sm:h-16 sm:w-16 text-gray-400" />
          </Box>
          <Typography
            variant="h4"
            component="h2"
            className="mt-4 font-semibold text-gray-900"
          >
            No courses found
          </Typography>
          <Typography variant="body1" className="mt-2 text-gray-600">
            We couldn't find any courses matching your search criteria.
          </Typography>
        </Box>
      ) : (
        <>
          {sectionError ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {sectionError}
            </Alert>
          ) : (
            courseSection && (
              <Box
                sx={{
                  p: { xs: 1.5, sm: 2 },
                  borderBottom: 1,
                  borderColor: "divider",
                  bgcolor: "white",
                  color: "grey.900",
                  borderTopLeftRadius: "4px",
                  borderTopRightRadius: "4px",
                }}
              >
                <Typography
                  variant="h6"
                  component="h2"
                  sx={{
                    fontSize: { xs: "1rem", sm: "1.25rem" },
                    display: { xs: "block", sm: "inline" },
                    mb: { xs: 1, sm: 0 },
                  }}
                >
                  {courseSection.name}
                  <Typography
                    variant="h6"
                    component="div"
                    color="grey.700"
                    sx={{
                      fontSize: { xs: "0.875rem", sm: "1.25rem" },
                      display: "block",
                      mt: { xs: 1, sm: 0 },
                    }}
                  >
                    {courseSection.subjectCode} {courseSection.catalogNumber} -{" "}
                    {courseSection.sectionCode} ({courseSection.classNumber})
                  </Typography>
                </Typography>
              </Box>
            )
          )}
          {calendarError ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {calendarError}
            </Alert>
          ) : (
            <div className="mt-8">
              {getEnrollmentSummary(numDaysToFillCourse)}
              <Calendar courseStats={courseStats} />
            </div>
          )}
          {instructorsError ? (
            <Alert severity="error" sx={{ mt: 2 }}>
              {instructorsError}
            </Alert>
          ) : (
            <>
              <div className="mt-4 mb-4">
                <Typography
                  variant="h5"
                  component="h2"
                  className="font-bold text-gray-900"
                  sx={{ fontSize: { xs: "1.25rem", sm: "1.5rem" }, mb: 2 }}
                >
                  Past Instructors
                </Typography>
              </div>
              <Paper
                elevation={2}
                sx={{ p: { xs: 2, sm: 3 }, bgcolor: "grey.50" }}
              >
                {pastInstructors.length > 0 ? (
                  <Box
                    component="ul"
                    sx={{
                      display: "grid",
                      gridTemplateColumns: {
                        xs: "1fr",
                        sm: "repeat(2, 1fr)",
                        md: "repeat(3, 1fr)",
                      },
                      gap: 2,
                      p: 0,
                      m: 0,
                      listStyle: "none",
                    }}
                  >
                    {pastInstructors.map((instructor, index) => (
                      <Typography
                        component="li"
                        key={index}
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontSize: { xs: "0.875rem", sm: "1rem" },
                        }}
                      >
                        {instructor}
                      </Typography>
                    ))}
                  </Box>
                ) : (
                  <Typography variant="body1" color="text.secondary">
                    No past instructors available for this course.
                  </Typography>
                )}
              </Paper>
            </>
          )}
        </>
      )}
    </Box>
  );
}

export default CourseDetails;
