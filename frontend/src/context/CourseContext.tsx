import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { Course, fetchCourses } from "../utils/fetchCourses";

// Define the shape of the context data
interface CourseContextType {
    courses: Course[];
    loading: boolean;
    error: string | null;
}

// Create the context
const CourseContext = createContext<CourseContextType | undefined>(undefined);

// Provider component
export const CourseProvider = ({ children }: { children: ReactNode }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const loadCourses = async () => {
            try {
                const data = await fetchCourses();
                setCourses(data);
                setLoading(false);
            } catch (err) {
                setError("Error fetching courses");
                setLoading(false);
            }
        };

        loadCourses();
    }, []);

    return (
        <CourseContext.Provider value={{ courses, loading, error }}>
            {children}
        </CourseContext.Provider>
    );
};

// Custom hook to use the course context
export const useCourses = () => {
    const context = useContext(CourseContext);
    if (!context) {
        throw new Error("useCourses must be used within a CourseProvider");
    }
    return context;
};
