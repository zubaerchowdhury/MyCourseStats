import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ArrowLeft, BookOpen } from "lucide-react"; // Keep lucide for specific icons if needed
// MUI Imports
import {
  Container,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import SearchForm from "../components/SearchForm";
import EventNoteIcon from "@mui/icons-material/EventNote"; // Icon for meeting pattern
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Course, CourseSection, CourseContainer } from "../types/CourseTypes";

const theme = createTheme({
  palette: {
    primary: {
      main: "#4F46E5",
    },
    secondary: {
      main: "#E1ECFB",
    },
  },
  typography: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  },
});

// --- Helper Functions ---
const timeFormatOptions: Intl.DateTimeFormatOptions = {
  hour: "numeric",
  minute: "2-digit",
  timeZone: "UTC",
};
const dateFormatOptions: Intl.DateTimeFormatOptions = {
  month: "2-digit",
  day: "2-digit",
  timeZone: "UTC",
};
// Add a helper for single time formatting (used in multiple meetings table)
const formatSingleTime = (date: Date | undefined): string => {
  if (!date) return "TBA";
  return date.toLocaleTimeString([], timeFormatOptions);
};
// Add a helper for single date range formatting (used in multiple meetings table)
const formatSingleDateRange = (
  start: Date | undefined,
  end: Date | undefined
): string => {
  if (!start || !end) return "TBA";

  return `${start.toLocaleDateString(
    undefined,
    dateFormatOptions
  )} - ${end.toLocaleDateString(undefined, dateFormatOptions)}`;
};
// Modify formatTime to handle array case differently if needed in summary
const formatTime = (date: Date | Date[] | undefined): string => {
  if (!date) return "TBA";
  if (Array.isArray(date)) return "Multiple"; // Keep summary simple
  return (date as Date).toLocaleTimeString([], timeFormatOptions);
};
// Modify formatTimeRange for summary
// This function is used to format the time range for the summary
const formatTimeRange = (
  start: Date | Date[] | undefined,
  end: Date | Date[] | undefined
): string => {
  if (!start || !end) return "TBA";
  if (Array.isArray(start) || Array.isArray(end)) return "Multiple"; // Keep summary simple

  return `${formatTime(start)} - ${formatTime(end)}`;
};
// Modify formatDateRange for summary
const formatDateRange = (
  start: Date | Date[] | undefined,
  end: Date | Date[] | undefined
): string => {
  if (!start || !end) return "TBA";
  if (Array.isArray(start) || Array.isArray(end)) return "Multiple"; // Keep summary simple
  return `${(start as Date).toLocaleDateString(
    undefined,
    dateFormatOptions
  )} - ${(end as Date).toLocaleDateString(undefined, dateFormatOptions)}`;
};
// Modify formatInstructors for summary
const formatInstructors = (
  instructor: string[] | string[][] | undefined
): string => {
  if (!instructor) return "Staff";
  if (Array.isArray(instructor)) {
    // Check if all instructors are the same in a flat list
    const flatInstructors = instructor.flat();
    const firstInstructor = flatInstructors[0];
    if (flatInstructors.every((inst) => inst === firstInstructor)) {
      return firstInstructor; // Show name if consistent
    }
    return "Multiple"; // Indicate multiple if names vary
  }
  return instructor;
};
// Modify formatDays for summary
const formatDays = (days: string[] | string[][] | undefined): string => {
  if (!days) return "TBA";
  if (Array.isArray(days)) {
    // Combine all unique days, sort them (optional), and format
    const uniqueDays = [...new Set(days.flat())];
		if (uniqueDays.length === 1 && uniqueDays[0] === "TBA") {
			return "TBA"; // Handle case where all are TBA
		}
		// Remove TBA from the list if present
		const tbaIndex = uniqueDays.indexOf("TBA");
		if (tbaIndex !== -1) {
			uniqueDays.splice(tbaIndex, 1);
		}
    // Basic sort order (e.g., Mo, Tu, We, Th, Fr, Sa, Su) - adjust if needed
    const dayOrder = ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];
    uniqueDays.sort(
      (a, b) =>
        dayOrder.indexOf(a.substring(0, 2)) -
        dayOrder.indexOf(b.substring(0, 2))
    );
    return uniqueDays.map((day) => day.substring(0, 2)).join("");
  }
  return "TBA"; // Should not happen based on interface
};
// Modify formatClassroom for summary
const formatClassroom = (classroom: string | string[] | undefined): string => {
  if (!classroom) return "TBA";
  if (Array.isArray(classroom)) {
    // Check if all classrooms are the same
    const firstClassroom = classroom[0];
    if (classroom.every((cr) => cr === firstClassroom)) {
      return firstClassroom; // Show room if consistent
    }
    return "Multiple"; // Indicate multiple if rooms vary
  }
  return classroom;
};

function SearchResults() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);
  const [searchSemester, setSearchSemester] = useState<string>("");
  const [searchYear, setSearchYear] = useState<number | undefined>(undefined);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Updated setCurrentSearchVars to include subjectCode
  const setCurrentSearchVars = (semester: string, year: number | undefined) => {
    setSearchSemester(semester);
    setSearchYear(year);
  };

	const paramsHasAllVars = (params?: URLSearchParams): boolean => {

    return (
			params &&
      params.has("semester") &&
      params.has("year") &&
      params.has("subjectCode")
    ) as boolean;
  };

  const fetchCourses = async (params?: URLSearchParams) => {
    setLoading(true);
    setError(null);
    setCurrentSearchVars(
      params?.get("semester") || searchParams.get("semester") || "",
      parseInt(params?.get("year") || "") || parseInt(searchParams.get("year") || "")
    );

    try {
      let paramsString: string;
      if (paramsHasAllVars(params)) {
        paramsString = params!.toString();
      } else if (paramsHasAllVars(searchParams)) {
        paramsString = searchParams.toString();
      } else if (searchParams.size > 0) {
        throw new Error("URL parameters are missing required fields");
      } else {
        setFilteredCourses([]);
        return;
      }
			const HOST = import.meta.env.VITE_API_URL || "/proxy";
      const response = await fetch(`${HOST}/api/Courses/course-search?${paramsString}`);

      if (!response.ok) {
        if (response.status === 404) {
          setFilteredCourses([]);
          return;
        }
        if (response.status >= 500) {
          throw new Error("Server error, please try again later");
        }
        throw new Error("Failed to fetch courses data");
      }

      const data = await response.json();
      let courses: Course[] = [];
      let curCourse: Course = {
        name: "",
        subjectCode: "",
        catalogNumber: "",
        sections: [],
      };
      data.forEach((container: CourseContainer) => {
        const courseSection: CourseSection = container.courseWithOneMeeting
          ? (container.courseWithOneMeeting as CourseSection)
          : (container.courseWithMultipleMeetings as CourseSection);
        // Transform date strings to Date objects
        if (courseSection.multipleMeetings) {
          courseSection.timeStart = (courseSection.timeStart as Date[]).map(
            (time) => new Date(time.toString())
          );
          courseSection.timeEnd = (courseSection.timeEnd as Date[]).map(
            (time) => new Date(time.toString())
          );
          courseSection.startDate = (courseSection.startDate as Date[]).map(
            (date) => new Date(date.toString())
          );
          courseSection.endDate = (courseSection.endDate as Date[]).map(
            (date) => new Date(date.toString())
          );
        } else {
          courseSection.timeStart = new Date(
            courseSection.timeStart.toString()
          );
          courseSection.timeEnd = new Date(courseSection.timeEnd.toString());
          courseSection.startDate = new Date(
            courseSection.startDate.toString()
          );
          courseSection.endDate = new Date(courseSection.endDate.toString());
        }
        // List is sorted by catalog number,
        // so we can check if the current section is the start of a different course
        if (curCourse.catalogNumber !== courseSection.catalogNumber) {
          if (curCourse.catalogNumber !== "") {
            courses.push(curCourse);
          }
          curCourse = {
            name: courseSection.name,
            subjectCode: courseSection.subjectCode,
            catalogNumber: courseSection.catalogNumber,
            sections: [],
          };
        }
        curCourse.sections.push(courseSection);
      });
      // Push the last course
      if (curCourse.catalogNumber !== "") {
        courses.push(curCourse);
      }
      // Set the filtered courses
      setFilteredCourses(courses);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  // --- Data Fetching useEffect ---
  useEffect(() => {
    fetchCourses();
  }, []); // Run only once on first render

  // --- Navigation Handlers ---
  const handleBackToHome = () => {
    navigate("/");
  };

  // Function to get the course URL with search params
  const getCourseURL = (section: CourseSection) => {
    const params = new URLSearchParams({
      semester: searchSemester,
      year: searchYear?.toString() || "",
      classNumber: section.classNumber.toString(),
    });
    return `/course?${params.toString()}`;
  };

  const actionButtons = (section: CourseSection) => {
    return (
      <Box
        sx={{
          mt: { xs: 1, sm: 2 },
          display: "flex",
          justifyContent: "flex-end",
          gap: 1,
        }}
      >
        <Link
          to={getCourseURL(section)}
          state={{ course: section }}
        >
          <Button
            type="submit"
            variant="contained"
            fullWidth={true}
            sx={{
              width: { xs: "100%", sm: "auto" },
              height: { xs: 36, sm: 40 },
              px: { xs: 1, sm: 2 },
              py: { xs: 0.5, sm: 1 },
              backgroundColor: "indigo.600",
              color: "white",
              borderRadius: "5px",
              fontSize: {
                xs: "0.75rem",
                sm: "0.875rem",
              },
              fontWeight: 450,
              "&:hover": {
                backgroundColor: "indigo.700",
              },
              textTransform: "none",
            }}
          >
            View Enrollment Details
          </Button>
        </Link>
      </Box>
    );
  };

  // --- Render Logic ---
  return (
    <ThemeProvider theme={theme}>
      <Container
        maxWidth="lg"
        sx={{
          mb: 4,
          px: { xs: 2, sm: 3 }, // Responsive padding
        }}
      >
        {/* Header Section */}
        <Box sx={{ py: { xs: 2, sm: 4 } }}>
          <button
            onClick={handleBackToHome}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to Home</span>
          </button>
          <div className="mt-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">
              Search Results
            </h1>
          </div>
          <Paper elevation={2} sx={{ p: { xs: 2, sm: 3 }, bgcolor: "grey.50" }}>
            {/* Search Form Wrapper */}
            <SearchForm onSearch={fetchCourses} />
          </Paper>
        </Box>
        {/* Results Section */}
        <Box>
          {loading ? (
            // ... Loading indicator ...
            <Box sx={{ display: "flex", justifyContent: "center", py: 8 }}>
              <CircularProgress size={60} />
              <Typography sx={{ ml: 2, alignSelf: "center" }}>
                Loading courses...
              </Typography>
            </Box>
          ) : error ? (
            // ... Error Alert ...
            <>
              <Alert severity="error" sx={{ mt: 2 }}>
                {error}
              </Alert>
              <button
                onClick={handleBackToHome}
                className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                <span>Back to Home</span>
              </button>
            </>
          ) : filteredCourses.length === 0 ? (
            // ... No Results ...
            <div className="text-center py-16">
              <div className="flex justify-center">
                <BookOpen className="h-16 w-16 text-gray-400" />
              </div>
              <h2 className="mt-4 text-2xl font-semibold text-gray-900">
                No courses found
              </h2>
              <p className="mt-2 text-gray-600">
                We couldn't find any courses matching your search criteria.
              </p>
              <div className="mt-6">
                <button
                  onClick={handleBackToHome}
                  className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Return to Home
                </button>
              </div>
            </div>
          ) : (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                gap: 3,
                borderRadius: "16px",
              }}
            >
              {filteredCourses.map((course) => (
                <Paper
                  key={`${course.subjectCode}-${course.catalogNumber}`}
                  elevation={3}
                >
                  {/* Course Header */}
                  <Box
                    sx={{
                      p: { xs: 1.5, sm: 2 },
                      borderBottom: 1,
                      borderColor: "divider",
                      bgcolor: "secondary.main",
                      color: "grey.900",
                      borderTopLeftRadius: "4px",
                      borderTopRightRadius: "4px",
                    }}
                  >
                    <Typography
                      variant="h6"
                      component="h2"
                      sx={{
                        fontSize: { xs: "0.9rem", sm: "1.25rem" },
                        lineHeight: { xs: 1.4, sm: 1.6 },
                        display: "flex",
                        flexDirection: { xs: "column", sm: "row" },
                        alignItems: { xs: "flex-start", sm: "center" },
                      }}
                    >
                      <span className="mr-1">{course.name}</span>
                      <Typography
                        variant="h6"
                        component="span"
                        color="grey.700"
                        sx={{
                          fontSize: { xs: "0.8rem", sm: "1.25rem" },
                          ml: { xs: 0, sm: 1 },
                        }}
                      >
                        | {course.subjectCode} {course.catalogNumber}
                      </Typography>
                    </Typography>
                  </Box>

                  <Box>
                    {/* Header Row for Sections */}
                    <Grid
                      container
                      spacing={1}
                      sx={{
                        p: 1,
                        borderBottom: 1,
                        borderColor: "divider",
                        display: { xs: "none", md: "flex" },
                        color: "text.secondary",
                        typography: "caption",
                        textAlign: "center",
                      }}
                    >
                      <Grid size={{ md: 2 }}>SECTION</Grid>
                      <Grid size={{ md: 2 }}>DAYS</Grid>
                      <Grid size={{ md: 1.85 }}>TIME</Grid>
                      <Grid size={{ md: 2 }}>ROOM</Grid>
                      <Grid size={{ md: 1.85 }}>INSTRUCTOR</Grid>
                      <Grid size={{ md: 2 }}>DATES</Grid>
                    </Grid>

                    {course.sections.map((section) => (
                      <Accordion
                        key={section.classNumber}
                        disableGutters
                        elevation={0}
                        square
                        sx={{
                          "&:not(:last-child)": {
                            borderBottom: 1,
                            borderColor: "divider",
                          },
                        }}
                      >
                        {/* --- Accordion Summary --- */}
                        <AccordionSummary
                          expandIcon={<ExpandMoreIcon />}
                          aria-controls={`section-${section.classNumber}-content`}
                          id={`section-${section.classNumber}-header`}
                          sx={{
                            bgcolor: "grey.50",
                            "&.Mui-expanded": {
                              bgcolor: "grey.100",
                            },
                            "&:hover": {
                              bgcolor: "grey.200",
                            },
                            "& .MuiAccordionSummary-content": {
                              alignItems: "center",
                              margin: { xs: "4px 0", sm: "12px 0" },
                            },
                          }}
                        >
                          {/* Mobile view */}
                          <Box
                            sx={{
                              display: { xs: "flex", md: "none" },
                              width: "100%",
                              flexDirection: "column",
                              gap: 0.5,
                            }}
                          >
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: "medium",
                                fontSize: "0.875rem",
                              }}
                            >
                              {section.sectionCode} - {section.sectionType}
                            </Typography>
                            <Box
                              sx={{
                                display: "flex",
                                justifyContent: "space-between",
                                fontSize: "0.75rem",
                              }}
                            >
                              <Typography variant="caption">
                                {formatDays(section.days)}
                              </Typography>
                              <Typography variant="caption">
                                {formatTimeRange(
                                  section.timeStart,
                                  section.timeEnd
                                )}
                              </Typography>
                            </Box>
                          </Box>

                          {/* Desktop view */}
                          <Grid
                            container
                            spacing={1}
                            sx={{
                              display: { xs: "none", md: "flex" },
                              typography: "body2",
                              textAlign: "center",
                              flexGrow: 1,
                            }}
                          >
                            <Grid size={{ md: 2 }}>
                              {section.sectionCode} - {section.sectionType}
                            </Grid>
                            <Grid size={{ md: 2 }}>
                              {formatDays(section.days)}
                            </Grid>
                            <Grid size={{ md: 2 }}>
                              {formatTimeRange(
                                section.timeStart,
                                section.timeEnd
                              )}
                            </Grid>
                            <Grid size={{ md: 2 }}>
                              {formatClassroom(section.classroom)}
                            </Grid>
                            <Grid size={{ md: 2 }}>
                              {formatInstructors(section.instructor)}
                            </Grid>
                            <Grid size={{ md: 2 }}>
                              {formatDateRange(
                                section.startDate,
                                section.endDate
                              )}
                            </Grid>
                          </Grid>
                        </AccordionSummary>

                        {/* --- Accordion Details --- */}
                        <AccordionDetails sx={{ bgcolor: "grey.100", p: 3 }}>
                          {/* === Multiple Meeting Pattern Section */}
                          {section.multipleMeetings &&
                            Array.isArray(section.startDate) && (
                              <Box sx={{ mb: 3, overflowX: "auto" }}>
                                <Typography
                                  variant="subtitle2"
                                  gutterBottom
                                  color="text.secondary"
                                  sx={{ display: "flex", alignItems: "center" }}
                                >
                                  <EventNoteIcon
                                    fontSize="small"
                                    sx={{ mr: 0.5 }}
                                  />{" "}
                                  MULTIPLE MEETING PATTERN
                                </Typography>
                                <Paper
                                  variant="outlined"
                                  sx={{
                                    minWidth: { xs: "600px", md: "100%" }, // Allow horizontal scroll on mobile
                                  }}
                                >
                                  {/* Header Row */}
                                  <Grid
                                    container
                                    spacing={1}
                                    sx={{
                                      p: { xs: 0.5, sm: 1 },
                                      bgcolor: "grey.200",
                                      typography: "caption",
                                      fontWeight: "medium",
                                      textAlign: "left",
                                    }}
                                  >
                                    <Grid size={{ xs: 2 }}>DATES</Grid>
                                    <Grid size={{ xs: 2 }}>INSTRUCTOR</Grid>
                                    <Grid size={{ xs: 2 }}>DAYS</Grid>
                                    <Grid size={{ xs: 2 }}>START</Grid>
                                    <Grid size={{ xs: 2 }}>END</Grid>
                                    <Grid size={{ xs: 2 }}>ROOM</Grid>
                                  </Grid>

                                  {/* Data Rows - Wrap in scrollable container */}
                                  <Box
                                    sx={{
                                      overflowX: "auto",
                                      minWidth: { xs: "600px", md: "100%" },
                                    }}
                                  >
                                    {(section.startDate as Date[]).map(
                                      (_, index) => (
                                        <Grid
                                          container
                                          spacing={1}
                                          key={index}
                                          sx={{
                                            p: { xs: 0.5, sm: 1 },
                                            typography: {
                                              xs: "caption",
                                              sm: "body2",
                                            },
                                            textAlign: "left",
                                            borderTop: index > 0 ? 1 : 0,
                                            borderColor: "divider",
                                          }}
                                        >
                                          <Grid size={{ xs: 2 }}>
                                            {formatSingleDateRange(
                                              (section.startDate as Date[])?.[
                                                index
                                              ],
                                              (section.endDate as Date[])?.[
                                                index
                                              ]
                                            )}
                                          </Grid>
                                          <Grid size={{ xs: 2 }}>
                                            {Array.isArray(
                                              section.instructor?.[index]
                                            )
                                              ? (
                                                  section.instructor?.[
                                                    index
                                                  ] as string[]
                                                ).join(", ")
                                              : section.instructor?.[index] ||
                                                "Staff"}
                                          </Grid>
                                          <Grid size={{ xs: 2 }}>
                                            {Array.isArray(
                                              section.days?.[index]
                                            )
                                              ? (
                                                  section.days?.[
                                                    index
                                                  ] as string[]
                                                )
                                                  .map((d) => {
																										if (d === "TBA") {
																											return d;
																										}
																										return d.substring(0, 2);
																									})
                                                  .join("")
                                              : "TBA"}
                                          </Grid>
                                          <Grid size={{ xs: 2 }}>
                                            {formatSingleTime(
                                              (section.timeStart as Date[])?.[
                                                index
                                              ]
                                            )}
                                          </Grid>
                                          <Grid size={{ xs: 2 }}>
                                            {formatSingleTime(
                                              (section.timeEnd as Date[])?.[
                                                index
                                              ]
                                            )}
                                          </Grid>
                                          <Grid size={{ xs: 2 }}>
                                            {section.classroom?.[index] ||
                                              "TBA"}
                                          </Grid>
                                        </Grid>
                                      )
                                    )}
                                  </Box>
                                </Paper>
                              </Box>
                            )}
                          {/* === End Multiple Meeting Pattern Section === */}

                          <Grid
                            container
                            spacing={
                              section.multipleMeetings ? 0 : { xs: 2, md: 3 }
                            }
                          >
                            {/* Column 1: Information */}
                            <Grid size={{ xs: 12, md: 6 }}>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: { xs: 1.5, sm: 2 },
                                  bgcolor: "grey.200",
                                  borderRadius: 2,
                                  height: "100%",
                                }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  gutterBottom
                                  color="text.secondary"
                                  sx={{
                                    fontSize: { xs: "0.7rem", sm: "0.875rem" },
                                  }}
                                >
                                  INFORMATION
                                </Typography>
                                {/* For larger screens: two column layout */}
                                <Grid
                                  container
                                  spacing={1}
                                  sx={{ display: { xs: "none", sm: "flex" } }}
                                >
                                  <Grid size={{ xs: 4 }}>
                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                      sx={{
                                        fontSize: {
                                          xs: "0.75rem",
                                          sm: "0.875rem",
                                        },
                                      }}
                                    >
                                      Class Number:
                                    </Typography>
                                  </Grid>
                                  <Grid size={{ xs: 8 }}>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontSize: {
                                          xs: "0.75rem",
                                          sm: "0.875rem",
                                        },
                                      }}
                                    >
                                      {section.classNumber}
                                    </Typography>
                                  </Grid>
                                  <Grid size={{ xs: 4 }}>
                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                      sx={{
                                        fontSize: {
                                          xs: "0.75rem",
                                          sm: "0.875rem",
                                        },
                                      }}
                                    >
                                      Session:
                                    </Typography>
                                  </Grid>
                                  <Grid size={{ xs: 8 }}>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontSize: {
                                          xs: "0.75rem",
                                          sm: "0.875rem",
                                        },
                                      }}
                                    >
                                      {section.session || "N/A"}
                                    </Typography>
                                  </Grid>
                                  <Grid size={{ xs: 4 }}>
                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                      sx={{
                                        fontSize: {
                                          xs: "0.75rem",
                                          sm: "0.875rem",
                                        },
                                      }}
                                    >
                                      Capacity:
                                    </Typography>
                                  </Grid>
                                  <Grid size={{ xs: 8 }}>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        fontSize: {
                                          xs: "0.75rem",
                                          sm: "0.875rem",
                                        },
                                      }}
                                    >
                                      {section.capacity || "N/A"} Total Seats
                                    </Typography>
                                  </Grid>
                                </Grid>

                                {/* For xs screens: stacked layout */}
                                <Box
                                  sx={{ display: { xs: "block", sm: "none" } }}
                                >
                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                    sx={{
                                      fontSize: "0.75rem",
                                      mt: 1,
                                    }}
                                  >
                                    Class Number:
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontSize: "0.75rem",
                                      mb: 1,
                                    }}
                                  >
                                    {section.classNumber}
                                  </Typography>

                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                    sx={{
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    Session:
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontSize: "0.75rem",
                                      mb: 1,
                                    }}
                                  >
                                    {section.session || "N/A"}
                                  </Typography>

                                  <Typography
                                    variant="body2"
                                    fontWeight="medium"
                                    sx={{
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    Capacity:
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      fontSize: "0.75rem",
                                    }}
                                  >
                                    {section.capacity || "N/A"} Total Seats
                                  </Typography>
                                </Box>
                              </Paper>
                            </Grid>

                            {/* Column 2: Details & Availability */}
                            <Grid size={{ xs: 12, md: 6 }}>
                              {/* Conditionally hide fields if multiple meetings */}
                              {!section.multipleMeetings ? (
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: { xs: 1.5, sm: 2 },
                                    bgcolor: "grey.200",
                                    borderRadius: 2,
                                    height: "100%",
                                  }}
                                >
                                  <Typography
                                    variant="subtitle2"
                                    gutterBottom
                                    color="text.secondary"
                                    sx={{
                                      fontSize: {
                                        xs: "0.7rem",
                                        sm: "0.875rem",
                                      },
                                    }}
                                  >
                                    DETAILS
                                  </Typography>

                                  {/* For larger screens: two column layout */}
                                  <Grid
                                    container
                                    spacing={1}
                                    sx={{
                                      mb: 2,
                                      display: { xs: "none", sm: "flex" },
                                    }}
                                  >
                                    <Grid size={{ xs: 4 }}>
                                      <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                        sx={{
                                          fontSize: {
                                            xs: "0.75rem",
                                            sm: "0.875rem",
                                          },
                                        }}
                                      >
                                        Instructor:
                                      </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 8 }}>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontSize: {
                                            xs: "0.75rem",
                                            sm: "0.875rem",
                                          },
                                        }}
                                      >
                                        {formatInstructors(section.instructor)}
                                      </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 4 }}>
                                      <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                        sx={{
                                          fontSize: {
                                            xs: "0.75rem",
                                            sm: "0.875rem",
                                          },
                                        }}
                                      >
                                        Dates:
                                      </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 8 }}>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontSize: {
                                            xs: "0.75rem",
                                            sm: "0.875rem",
                                          },
                                        }}
                                      >
                                        {formatDateRange(
                                          section.startDate,
                                          section.endDate
                                        )}
                                      </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 4 }}>
                                      <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                        sx={{
                                          fontSize: {
                                            xs: "0.75rem",
                                            sm: "0.875rem",
                                          },
                                        }}
                                      >
                                        Meets:
                                      </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 8 }}>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontSize: {
                                            xs: "0.75rem",
                                            sm: "0.875rem",
                                          },
                                        }}
                                      >
                                        {formatDays(section.days)}{" "}
                                        {formatTime(section.timeStart)} -{" "}
                                        {formatTime(section.timeEnd)}
                                      </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 4 }}>
                                      <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                        sx={{
                                          fontSize: {
                                            xs: "0.75rem",
                                            sm: "0.875rem",
                                          },
                                        }}
                                      >
                                        Room:
                                      </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 8 }}>
                                      <Typography
                                        variant="body2"
                                        sx={{
                                          fontSize: {
                                            xs: "0.75rem",
                                            sm: "0.875rem",
                                          },
                                        }}
                                      >
                                        {formatClassroom(section.classroom)}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                  {/* For xs screens: stacked layout */}
                                  <Box
                                    sx={{
                                      display: { xs: "block", sm: "none" },
                                      mb: 2,
                                    }}
                                  >
                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                      sx={{ fontSize: "0.75rem", mt: 1 }}
                                    >
                                      Instructor:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontSize: "0.75rem", mb: 1 }}
                                    >
                                      {formatInstructors(section.instructor)}
                                    </Typography>

                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                      sx={{ fontSize: "0.75rem" }}
                                    >
                                      Dates:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontSize: "0.75rem", mb: 1 }}
                                    >
                                      {formatDateRange(
                                        section.startDate,
                                        section.endDate
                                      )}
                                    </Typography>

                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                      sx={{ fontSize: "0.75rem" }}
                                    >
                                      Meets:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontSize: "0.75rem", mb: 1 }}
                                    >
                                      {formatDays(section.days)}{" "}
                                      {formatTime(section.timeStart)} -{" "}
                                      {formatTime(section.timeEnd)}
                                    </Typography>

                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                      sx={{ fontSize: "0.75rem" }}
                                    >
                                      Room:
                                    </Typography>
                                    <Typography
                                      variant="body2"
                                      sx={{ fontSize: "0.75rem" }}
                                    >
                                      {formatClassroom(section.classroom)}
                                    </Typography>
                                  </Box>
                                  {actionButtons(section)}
                                </Paper>
                              ) : (
                                <Paper
                                  elevation={0}
                                  sx={{
                                    p: { xs: 1.5, sm: 2 },
                                    bgcolor: "grey.200",
                                    height: "100%",
                                  }}
                                >
                                  <Grid
                                    container
                                    spacing={1}
                                    sx={{ mb: { xs: 4, sm: 10 } }}
                                  ></Grid>
                                  {actionButtons(section)}
                                </Paper>
                              )}
                            </Grid>
                          </Grid>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Box>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </Container>
    </ThemeProvider>
  );
}

export default SearchResults;
