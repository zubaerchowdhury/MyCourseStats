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
import { useSearch, getSearchFiltersStrings } from "../context/SearchContext";
import { Course, CourseSection, CourseContainer } from "../types/CourseTypes";

export const theme = createTheme({
  palette: {
    primary: {
      main: "#4F46E5",
    },
    secondary: {
      main: "#5ce6e7",
    },
  },
  typography: {
    fontFamily:
      'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif',
  },
});

// --- Helper Functions ---
// Add a helper for single time formatting (used in multiple meetings table)
const formatSingleTime = (date: Date | undefined): string => {
  if (!date) return "TBA";
  return date.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
};
// Add a helper for single date range formatting (used in multiple meetings table)
const formatSingleDateRange = (
  start: Date | undefined,
  end: Date | undefined
): string => {
  if (!start || !end) return "TBA";
  const options: Intl.DateTimeFormatOptions = {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  };
  return `${start.toLocaleDateString(
    undefined,
    options
  )} - ${end.toLocaleDateString(undefined, options)}`;
};
// Modify formatTime to handle array case differently if needed in summary
const formatTime = (date: Date | Date[] | undefined): string => {
  if (!date) return "TBA";
  if (Array.isArray(date)) return "Multiple"; // Keep summary simple
  return (date as Date).toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
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
  const options: Intl.DateTimeFormatOptions = {
    month: "2-digit",
    day: "2-digit",
    year: "numeric",
  };
  return `${(start as Date).toLocaleDateString(undefined, options)} - ${(
    end as Date
  ).toLocaleDateString(undefined, options)}`;
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

  const { filters } = useSearch();

  const fetchCourses = async () => {
    setLoading(true);
    setError(null);
    setCurrentSearchVars(
      searchParams.get("semester") || filters.semester || "",
      parseInt(searchParams.get("year") || filters.year?.toString() || "")
    );

    try {
      let paramsString: string;
      if (
        searchParams.has("semester") &&
        searchParams.has("year") &&
        searchParams.has("subjectCode")
      ) {
        paramsString = searchParams.toString();
      } else if (filters.semester && filters.year && filters.subjectCode) {
        paramsString = new URLSearchParams(
          getSearchFiltersStrings(filters)
        ).toString();
      } else if (searchParams.size > 0) {
        throw new Error("URL parameters are missing required fields");
      } else {
        setFilteredCourses([]);
        setLoading(false);
        return;
      }
      const baseUrl = "http://localhost:5184/api/Courses/course-search";
      const response = await fetch(`${baseUrl}?${paramsString}`);

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

  // --- Render Logic ---
  return (
    <ThemeProvider theme={theme}>
      <Container maxWidth="lg" sx={{ mb: 4 }}>
        {" "}
        {/* Use MUI Container */}
        {/* Header Section */}
        <Box sx={{ py: 4 }}>
          <button
            onClick={handleBackToHome}
            className="flex items-center text-indigo-600 hover:text-indigo-800 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" />
            <span>Back to Home</span>
          </button>
          <div className="mt-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Search Results</h1>
          </div>
          <Paper elevation={2} sx={{ p: 3 }}>
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
                  {/* ... Course Header ... */}
                  <Box
                    sx={{
                      p: 2,
                      borderBottom: 1,
                      borderColor: "divider",
                      bgcolor: "white",
                      color: "grey.900",
                      borderTopLeftRadius: "4px",
                      borderTopRightRadius: "4px",
                    }}
                  >
                    <Typography variant="h6" component="h2">
                      {course.name} |{" "}
                      <Typography
                        variant="h6"
                        component="span"
                        //fontWeight="bold"
                        color="grey.700"
                      >
                        {course.subjectCode} {course.catalogNumber}
                      </Typography>
                    </Typography>
                  </Box>

                  <Box>
                    {/* Optional: Header Row for Sections */}
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
                            // Updated styling from temp.tsx
                            bgcolor: "grey.50",
                            "&.Mui-expanded": {
                              bgcolor: "grey.100",
                            },
                            "&:hover": {
                              bgcolor: "grey.200",
                            },
                            // Keep original alignment style
                            "& .MuiAccordionSummary-content": {
                              alignItems: "center",
                            },
                          }}
                        >
                          <Grid
                            container
                            spacing={1}
                            sx={{
                              display: { md: "flex" },
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
                        <AccordionDetails sx={{ bgcolor: "grey.50", p: 3 }}>
                          {/* === Multiple Meeting Pattern Section (Conditional) === */}
                          {section.multipleMeetings &&
                            Array.isArray(section.startDate) && (
                              <Box sx={{ mb: 3 }}>
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
                                <Paper variant="outlined">
                                  {/* Header Row - Use size prop */}
                                  <Grid
                                    container
                                    spacing={1}
                                    sx={{
                                      p: 1,
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
                                  {/* Data Rows */}
                                  {(section.startDate as Date[]).map(
                                    (_, index) => (
                                      <Grid
                                        container
                                        spacing={1}
                                        key={index}
                                        sx={{
                                          p: 1,
                                          typography: "body2",
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
                                            (section.endDate as Date[])?.[index]
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
                                          {Array.isArray(section.days?.[index])
                                            ? (
                                                section.days?.[
                                                  index
                                                ] as string[]
                                              )
                                                .map((d) => d.substring(0, 2))
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
                                            (section.timeEnd as Date[])?.[index]
                                          )}
                                        </Grid>
                                        <Grid size={{ xs: 2 }}>
                                          {section.classroom?.[index] || "TBA"}
                                        </Grid>
                                      </Grid>
                                    )
                                  )}
                                </Paper>
                              </Box>
                            )}
                          {/* === End Multiple Meeting Pattern Section === */}

                          <Grid container spacing={3}>
                            {/* Column 1: Information */}
                            <Grid size={{ xs: 12, md: 6 }}>
                              <Paper
                                elevation={0}
                                sx={{
                                  p: 2,
                                  bgcolor: "grey.195",
                                  borderRadius: 2,
                                  height: "100%",
                                }}
                              >
                                <Typography
                                  variant="subtitle2"
                                  gutterBottom
                                  color="text.secondary"
                                >
                                  INFORMATION
                                </Typography>
                                <Grid container spacing={1}>
                                  <Grid size={{ xs: 4 }}>
                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                    >
                                      Class Number:
                                    </Typography>
                                  </Grid>
                                  <Grid size={{ xs: 8 }}>
                                    <Typography variant="body2">
                                      {section.classNumber}
                                    </Typography>
                                  </Grid>
                                  <Grid size={{ xs: 4 }}>
                                    <Typography
                                      variant="body2"
                                      fontWeight="medium"
                                    >
                                      Session:
                                    </Typography>
                                  </Grid>
                                  <Grid size={{ xs: 8 }}>
                                    <Typography variant="body2">
                                      {section.session || "N/A"}
                                    </Typography>
                                  </Grid>
                                </Grid>
                              </Paper>
                            </Grid>

                            {/* Column 2: Details & Availability */}
                            <Grid size={{ xs: 12, md: 6 }}>
                              {/* Conditionally hide fields if multiple meetings */}
                              {!section.multipleMeetings && (
                                <Paper
                                elevation={0}
                                sx={{
                                  p: 2,
                                  bgcolor: "grey.195",
                                  borderRadius: 2,
                                  height: "80%",
                                }}
                              >
                                  <Typography
                                    variant="subtitle2"
                                    gutterBottom
                                    color="text.secondary"
                                  >
                                    DETAILS
                                  </Typography>
                                  <Grid container spacing={1} sx={{ mb: 2 }}>
                                    <Grid size={{ xs: 4 }}>
                                      <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                      >
                                        Instructor:
                                      </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 8 }}>
                                      <Typography variant="body2">
                                        {formatInstructors(section.instructor)}
                                      </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 4 }}>
                                      <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                      >
                                        Dates:
                                      </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 8 }}>
                                      <Typography variant="body2">
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
                                      >
                                        Meets:
                                      </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 8 }}>
                                      <Typography variant="body2">
                                        {formatDays(section.days)}{" "}
                                        {formatTime(section.timeStart)} -{" "}
                                        {formatTime(section.timeEnd)}
                                      </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 4 }}>
                                      <Typography
                                        variant="body2"
                                        fontWeight="medium"
                                      >
                                        Room:
                                      </Typography>
                                    </Grid>
                                    <Grid size={{ xs: 8 }}>
                                      <Typography variant="body2">
                                        {formatClassroom(section.classroom)}
                                      </Typography>
                                    </Grid>
                                  </Grid>
                                  </Paper>
                              )}

                              {/* Action Buttons */}
                              <Box
                                sx={{
                                  mt: 2,
                                  display: "flex",
                                  justifyContent: "flex-end",
                                  gap: 1,
                                }}
                              >
                                <Button
                                  variant="outlined"
                                  size="small"
                                  sx={{
                                    height: 40,
                                    px: 2,
                                    py: 1,
                                    borderRadius: "5px",
                                    fontSize: "1.25 rem", // 18px
                                    fontWeight: 450,
                                    textTransform: "none",
                                  }}
                                >
                                  Past Instructors
                                </Button>
                                <Link
                                  to={getCourseURL(section)}
                                  state={{ course: section }}
                                  target="_blank"
                                >
                                  <Button
                                    type="submit"
                                    variant="contained"
                                    sx={{
                                      height: 40,
                                      px: 2,
                                      py: 1,
                                      backgroundColor: "indigo.600",
                                      color: "white",
                                      borderRadius: "5px",
                                      fontSize: "1.25 rem", // 18px
                                      fontWeight: 450, // Thinner look
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
