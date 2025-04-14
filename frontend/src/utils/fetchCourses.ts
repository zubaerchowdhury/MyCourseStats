export interface Course {
    _id: string;
    name: string;
    subjectName: string;
    subjectCode: string;
    catalogNumber: number;
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

export async function fetchCourses(): Promise<Course[]> {
    try {
        const response: Response = await fetch('http://localhost:8000/api/courses', {
            method: 'GET',
        });

        if (!response.ok) {
            throw new Error('Error fetching course data from backend');
        }

        const rawData = await response.json(); // Response is in JSON format

        // Convert datetime fields from strings to Date objects
        const courses: Course[] = rawData.map((course: any) => ({
            ...course,
            _id:course._id.toString(),
            timeStart: new Date(course.timeStart),
            timeEnd: new Date(course.timeEnd),
            startDate: new Date(course.startDate),
            endDate: new Date(course.endDate),
            dateTimeRetrieved: new Date(course.dateTimeRetrieved),
        }));

        return courses;
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
}
