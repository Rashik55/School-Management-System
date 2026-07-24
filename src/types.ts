export type UserRole = 'admin' | 'teacher' | 'student';

export interface UserProfile {
  uid: string;
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
  createdAt: string;
  phoneNumber?: string;
  address?: string;
  // Role specific fields
  rollNo?: string;
  employeeId?: string;
  classId?: string; // e.g., "Class 10-A"
  subject?: string; // for teachers
}

export interface Student {
  id: string; // matches uid in auth if registered, or generated
  name: string;
  email: string;
  rollNo: string;
  classId: string;
  parentName: string;
  parentContact: string;
  address: string;
  admissionDate: string;
  gender: string;
  feeStatus: 'paid' | 'unpaid' | 'pending';
}

export interface Teacher {
  id: string; // matches uid in auth if registered, or generated
  name: string;
  email: string;
  employeeId: string;
  subject: string;
  classTeacherOf?: string;
  contact: string;
  joinDate: string;
  gender: string;
}

export interface AttendanceRecord {
  id: string;
  date: string; // YYYY-MM-DD
  studentId: string;
  studentName: string;
  rollNo: string;
  classId: string;
  status: 'present' | 'absent' | 'late';
  markedBy: string; // Teacher name
}

export interface ExamResult {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  classId: string;
  subject: string;
  examName: string; // Midterm, Final, Unit Test, etc.
  marksObtained: number;
  maxMarks: number;
  grade: string;
  remarks: string;
  date: string;
}

export interface Assignment {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  classId: string;
  subject: string;
  teacherId: string;
  teacherName: string;
  createdAt: string;
  submissionsCount?: number;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  submittedAt: string;
  submissionText: string;
  attachmentUrl?: string;
  status: 'submitted' | 'graded';
  grade?: string;
  remarks?: string;
}

export interface SchoolNotice {
  id: string;
  title: string;
  content: string;
  date: string;
  target: 'all' | 'teachers' | 'students';
  author: string;
  important: boolean;
}

export interface SystemNotification {
  id: string;
  title: string;
  content: string;
  timeAgo: string;
  type: 'notice' | 'fee' | 'grade' | 'user' | 'system';
  role: 'all' | 'admin' | 'teacher' | 'student';
  read: boolean;
  createdAt: string;
}

export interface TimetablePeriod {
  id: string;
  day: 'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday';
  period: number; // 1, 2, 3, etc.
  time: string; // "09:00 AM - 09:45 AM"
  subject: string;
  classId: string;
  shift?: 'day' | 'morning' | 'evening';
  teacherName: string;
  room: string;
}

export interface FeeTransaction {
  id: string;
  studentId: string;
  studentName: string;
  rollNo: string;
  classId: string;
  amount: number;
  category: 'Tuition Fee' | 'Exam Fee' | 'Library Fee' | 'Sports Fee' | 'Other';
  dueDate: string;
  status: 'paid' | 'unpaid' | 'pending';
  paymentDate?: string;
  paymentMethod?: string;
  invoiceNo: string;
}

export interface SubjectCategory {
  category: string;
  subjects: string[];
}

export const NEPAL_SUBJECT_CATEGORIES: SubjectCategory[] = [
  {
    category: "Common / General Subjects",
    subjects: [
      "Nepali",
      "Compulsory Nepali",
      "English",
      "Compulsory English",
      "Mathematics",
      "Optional Mathematics",
      "Science",
      "Science & Technology",
      "Social Studies",
      "Social Studies & Life Skills",
      "Our Surroundings",
      "Health & Physical Education",
      "Creative Arts",
      "Local Subject",
      "Local Subject/Computer",
      "Computer Science/ICT"
    ]
  },
  {
    category: "Science Stream (Class 11-12)",
    subjects: [
      "Physics",
      "Chemistry",
      "Biology",
      "Computer Science",
      "Mathematics"
    ]
  },
  {
    category: "Management Stream (Class 11-12)",
    subjects: [
      "Accountancy",
      "Economics",
      "Business Studies"
    ]
  },
  {
    category: "Humanities Stream (Class 11-12)",
    subjects: [
      "Sociology",
      "Psychology",
      "Mass Communication",
      "Rural Development"
    ]
  },
  {
    category: "Education Stream (Class 11-12)",
    subjects: [
      "Education",
      "Child Development",
      "Curriculum Studies"
    ]
  },
  {
    category: "Law Stream (Class 11-12)",
    subjects: [
      "Jurisprudence",
      "Constitutional Law",
      "Legal Drafting"
    ]
  },
  {
    category: "Other Electives",
    subjects: [
      "Agriculture"
    ]
  }
];

export const CLASS_SUBJECTS_MAP: Record<string, string[]> = {
  "Class 1": ["Nepali", "English", "Mathematics", "Our Surroundings", "Creative Arts", "Health & Physical Education", "Local Subject"],
  "Class 2": ["Nepali", "English", "Mathematics", "Our Surroundings", "Creative Arts", "Health & Physical Education", "Local Subject"],
  "Class 3": ["Nepali", "English", "Mathematics", "Our Surroundings", "Science", "Social Studies", "Creative Arts", "Health & Physical Education", "Local Subject"],
  "Class 4": ["Nepali", "English", "Mathematics", "Science", "Social Studies", "Creative Arts", "Health & Physical Education", "Local Subject"],
  "Class 5": ["Nepali", "English", "Mathematics", "Science", "Social Studies", "Creative Arts", "Health & Physical Education", "Local Subject"],
  "Class 6": ["Nepali", "English", "Mathematics", "Science & Technology", "Social Studies", "Health & Physical Education", "Local Subject/Computer"],
  "Class 7": ["Nepali", "English", "Mathematics", "Science & Technology", "Social Studies", "Health & Physical Education", "Local Subject/Computer"],
  "Class 8": ["Nepali", "English", "Mathematics", "Science & Technology", "Social Studies", "Health & Physical Education", "Local Subject/Computer"],
  "Class 9": ["Compulsory Nepali", "English", "Mathematics", "Science & Technology", "Social Studies", "Health & Physical Education", "Computer Science", "Accountancy", "Agriculture", "Optional Mathematics"],
  "Class 10": ["Compulsory Nepali", "English", "Mathematics", "Science & Technology", "Social Studies", "Health & Physical Education", "Computer Science", "Accountancy", "Agriculture", "Optional Mathematics"],
  "Class 11": [
    "Compulsory English", "Nepali", "Social Studies & Life Skills", "Mathematics",
    "Physics", "Chemistry", "Biology", "Computer Science",
    "Accountancy", "Economics", "Business Studies",
    "Sociology", "Psychology", "Mass Communication", "Rural Development",
    "Education", "Child Development", "Curriculum Studies",
    "Jurisprudence", "Constitutional Law", "Legal Drafting"
  ],
  "Class 12": [
    "Compulsory English", "Nepali", "Social Studies & Life Skills", "Mathematics",
    "Physics", "Chemistry", "Biology", "Computer Science",
    "Accountancy", "Economics", "Business Studies",
    "Sociology", "Psychology", "Mass Communication", "Rural Development",
    "Education", "Child Development", "Curriculum Studies",
    "Jurisprudence", "Constitutional Law", "Legal Drafting"
  ]
};

export const ALL_NEPAL_SUBJECTS = Array.from(
  new Set(Object.values(CLASS_SUBJECTS_MAP).flat())
).sort();

export interface Book {
  id: string;
  title: string;
  author: string;
  isbn: string;
  category: string;
  quantity: number;
  available: number;
  location?: string; // e.g. "Shelf A-3"
}

export interface BookLoan {
  id: string;
  bookId: string;
  bookTitle: string;
  bookAuthor: string;
  studentId: string;
  studentName: string;
  studentRollNo: string;
  classId: string;
  borrowDate: string;
  dueDate: string;
  returnDate?: string;
  status: 'borrowed' | 'returned' | 'overdue';
}

