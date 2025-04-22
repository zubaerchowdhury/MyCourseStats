export interface SemesterDates {
	enrollmentStartDate: Date;
	classesBeginDate: Date;
	deadlineAddCourseDate: Date;
	deadlineDropCourseWithoutWDate: Date;
	deadlineDropCourseWithWDate: Date;
	classesEndDate: Date;
}

const SemesterDates: Record<string, SemesterDates> = {
	Spring2025: {
		enrollmentStartDate: new Date("2024-11-04"),
		classesBeginDate: new Date("2025-01-13"),
		deadlineAddCourseDate: new Date("2025-01-22"),
		deadlineDropCourseWithoutWDate: new Date("2025-01-29"),
		deadlineDropCourseWithWDate: new Date("2025-04-11"),
		classesEndDate: new Date("2025-04-28"),
	},
	Fall2025: {
		enrollmentStartDate: new Date("2025-03-31"),
		classesBeginDate: new Date("2025-08-18"),
		deadlineAddCourseDate: new Date("2025-08-27"),
		deadlineDropCourseWithoutWDate: new Date("2025-09-03"),
		deadlineDropCourseWithWDate: new Date("2025-11-07"),
		classesEndDate: new Date("2025-12-02"),
	},
}

export const getSemesterDates = (semester: string, year: string): SemesterDates | null => {
	const semesterKey = `${semester}${year}`;
	return SemesterDates[semesterKey] || null;
};

export const isDateInSemester = (semester: string, year: string, date: Date): boolean => {
	const semesterDates = getSemesterDates(semester, year);
	if (!semesterDates) {
		return false; // Default to false if semester dates are not found
	}

	for (const value of Object.values(semesterDates)) {
		if (value.getUTCDate() === date.getUTCDate() &&
			value.getUTCMonth() === date.getUTCMonth() &&
			value.getUTCFullYear() === date.getUTCFullYear()) {
			return true;
		}
	}
	return false; // Default to false if no matching date is found
};

const semesterColors: Record<keyof SemesterDates, string> = {
	enrollmentStartDate: "#CDFFD3",
	classesBeginDate: "#FFE4EB",
	deadlineAddCourseDate: "#FFFF9F",
	deadlineDropCourseWithoutWDate: "#FFDB00",
	deadlineDropCourseWithWDate: "#FDC8FF",
	classesEndDate: "#E0CFFF",
};

const defaultColor = "#FFFFFF"; // Default color for unknown keys

export const getSemesterColor = (key: keyof SemesterDates): string => {
	return semesterColors[key] || defaultColor; // Default to black if key is not found
}

export const getSemesterColorByDate = (semester: string, year: string, date: Date): string => {
	const semesterDates = getSemesterDates(semester, year);
	if (!semesterDates) {
		return defaultColor; // Default to black if semester dates are not found
	}

	for (const [key, value] of Object.entries(semesterDates)) {
		if (value.getUTCDate() === date.getUTCDate() &&
			value.getUTCMonth() === date.getUTCMonth() &&
			value.getUTCFullYear() === date.getUTCFullYear()) {
			return getSemesterColor(key as keyof SemesterDates);
		}
	}

	return defaultColor; // Default to black if no matching date is found
}