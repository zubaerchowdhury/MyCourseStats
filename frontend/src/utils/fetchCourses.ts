import { SearchFilters, getSearchFiltersStrings } from "../context/SearchContext";

export interface CourseSection {
	name: string;
	catalogNumber: string;
	sectionType: string;
	sectionCode: string;
	classNumber: number;
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
  
interface CourseContainer {
	courseWithOneMeeting: CourseSection | null;
	courseWithMultipleMeetings: CourseSection | null;
}

export const fetchCourses = async (
	filters: SearchFilters
): Promise<CourseSection[]> => {
	const baseUrl = 'http://localhost:5184/api/Courses/course-search';
	const params = new URLSearchParams(getSearchFiltersStrings(filters));
	const response = await fetch(`${baseUrl}?${params.toString()}`);

	if (!response.ok && response.status !== 404) {
		throw new Error('Failed to fetch courses data');
	}
	const data = await response.json();
	const courses: CourseSection[] = data.map((container: CourseContainer) => {
		return container.courseWithOneMeeting || container.courseWithMultipleMeetings;
	});
	return courses;
};