export interface Course {
  id: number;
  title: string;
  code: string;
  instructor: string;
  rating: number;
  reviews: number;
  description: string;
  schedule: string;
  credits: number;
  enrolledStudents: number;
  classSize: number;
}

export const mockCourses: Course[] = [
  {
    id: 1,
    title: 'Introduction to Computer Science',
    code: 'CS101',
    instructor: 'Dr. Jane Smith',
    rating: 4.8,
    reviews: 245,
    description: 'A foundational course covering the basics of computer science, algorithms, and programming concepts.',
    schedule: 'Mon, Wed, Fri 10:00 AM - 11:30 AM',
    credits: 3,
    enrolledStudents: 156,
    classSize: 200
  },
  {
    id: 2,
    title: 'Data Structures and Algorithms',
    code: 'CS201',
    instructor: 'Prof. Michael Johnson',
    rating: 4.5,
    reviews: 189,
    description: 'Learn about fundamental data structures and algorithm design techniques essential for efficient programming.',
    schedule: 'Tue, Thu 1:00 PM - 3:00 PM',
    credits: 4,
    enrolledStudents: 89,
    classSize: 120
  },
  {
    id: 3,
    title: 'Database Systems',
    code: 'CS305',
    instructor: 'Dr. Robert Chen',
    rating: 4.2,
    reviews: 156,
    description: 'Comprehensive overview of database design, implementation, and management systems.',
    schedule: 'Mon, Wed 2:00 PM - 3:30 PM',
    credits: 3,
    enrolledStudents: 134,
    classSize: 150
  }
];