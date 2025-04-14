// src/types/courses.ts

export interface CourseMeeting {
    classroom: string;
    instructor: string[];
    days: string[];
    timeStart: string;
    timeEnd: string;
    startDate: string;
    endDate: string;
    name: string;
    catalogNumber: string;
    sectionType: string;
    sectionCode: string;
    classNumber: number;
    capacity: number;
    multipleMeetings: boolean;
  }
  
  export interface CourseData {
    courseWithOneMeeting: CourseMeeting;
    courseWithMultipleMeetings: CourseMeeting | null;
  }
  

  export const fetchCourses = async (
    semester: string,
    year: number,
    subjectCode: string,
    catalogNumber: string
  ): Promise<CourseData[]> => {
    const baseUrl = 'http://localhost:5184/api/Courses/course-search';
    const params = new URLSearchParams({
      semester,
      year: year.toString(),
      subjectCode,
      catalogNumber,
    });
  
    const response = await fetch(`${baseUrl}?${params.toString()}`);
  
    if (!response.ok) {
      throw new Error('Failed to fetch courses data');
    }
    return await response.json();
  };