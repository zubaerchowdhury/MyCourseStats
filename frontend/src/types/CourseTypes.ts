export interface Course {
  name: string;
  subjectCode: string;
  catalogNumber: string;
  sections: CourseSection[];
}

export interface CourseSection {
  // Existing fields
  name: string;
  subjectCode: string;
  catalogNumber: string;
  sectionType: string; // e.g., LEC, LAB
  sectionCode: string; // e.g., D, 1T
  session: string | null; // e.g., Regular Academic
  classNumber: number; // Unique identifier for the section instance
  capacity: number;
  multipleMeetings: boolean;
  classroom: string | string[];
  instructor: string[] | string[][];
  days: string[] | string[][];
  timeStart: Date | Date[];
  timeEnd: Date | Date[];
  startDate: Date | Date[];
  endDate: Date | Date[];
}

export interface CourseContainer {
  courseWithOneMeeting: CourseSection | null;
  courseWithMultipleMeetings: CourseSection | null;
}