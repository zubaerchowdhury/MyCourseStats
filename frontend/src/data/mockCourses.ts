  export interface Course {
    _id: string;
    name: string;
    subjectName: string;
    subjectCode: string;
    catalogNumber: string;
    academicCareer: string;
    semester: string;
    year: number;
    sectionType: string;
    sectionCode: string;
    classNumber: number;
    session: string;
    days: string[]; // List of strings
    timeStart: Date;
    timeEnd: Date;
    classroom: string;
    instructor: string[]; // List of strings
    startDate: Date;
    endDate: Date;
    status: string;
    seatsAvailable: number;
    capacity: number;
    waitlistAvailable: number;
    waitlistCapacity: number;
    reservedSeatsAvailable: number;
    reservedSeatsCapacity: number;
    multipleMeetings: boolean;
    topic: string;
    dateTimeRetrieved: Date;
    notes: string;
  }
  
  export const mockCourses: Course[] = [
    {
      _id: "CS101-001-S25",
      name: "Introduction to Electrical and Computer Engineering",
      subjectName: "Electrical and Computer Engineering",
      subjectCode: "ECE",
      catalogNumber: "101",
      academicCareer: "Undergraduate",
      semester: "spring",
      year: 2025,
      sectionType: "Lecture",
      sectionCode: "001",
      classNumber: 12345,
      session: "Regular",
      days: ["Monday", "Wednesday", "Friday"],
      timeStart: new Date("2025-01-01T10:00:00"),
      timeEnd: new Date("2025-01-01T11:15:00"),
      classroom: "Science Building 101",
      instructor: ["Dr. Jane Smith", "Prof. Alan Johnson"],
      startDate: new Date("2025-01-15"),
      endDate: new Date("2025-05-05"),
      status: "Open",
      seatsAvailable: 44,
      capacity: 200,
      waitlistAvailable: 10,
      waitlistCapacity: 10,
      reservedSeatsAvailable: 0,
      reservedSeatsCapacity: 0,
      multipleMeetings: false,
      topic: "",
      dateTimeRetrieved: new Date("2024-04-13T08:30:00"),
      notes: "First-year students priority registration"
    },
    {
      _id: "MATH201-002-S25",
      name: "Calculus II",
      subjectName: "Mathematics",
      subjectCode: "MATH",
      catalogNumber: "201",
      academicCareer: "Undergraduate",
      semester: "spring",
      year: 2025,
      sectionType: "Lecture",
      sectionCode: "002",
      classNumber: 23456,
      session: "Regular",
      days: ["Tuesday", "Thursday"],
      timeStart: new Date("2025-01-01T14:00:00"),
      timeEnd: new Date("2025-01-01T15:30:00"),
      classroom: "Math Building 305",
      instructor: ["Dr. Michael Green"],
      startDate: new Date("2025-01-15"),
      endDate: new Date("2025-05-05"),
      status: "Waitlist",
      seatsAvailable: 0,
      capacity: 120,
      waitlistAvailable: 5,
      waitlistCapacity: 15,
      reservedSeatsAvailable: 0,
      reservedSeatsCapacity: 10,
      multipleMeetings: true,
      topic: "",
      dateTimeRetrieved: new Date("2024-04-13T08:30:00"),
      notes: "Requires Calculus I as prerequisite"
    }
  ]