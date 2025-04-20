interface SemesterDates {
	enrollmentStartDate: Date;
	classesBeginDate: Date;
	deadlineAddCourseDate: Date;
	deadlineDropCourseWithoutWDate: Date;
	deadlineDropCourseWithWDate: Date;
	classesEndDate: Date;
}

const semesterDates: Record<string, SemesterDates> = {
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
	return semesterDates[semesterKey] || null;
};