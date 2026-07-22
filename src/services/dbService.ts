import { 
  auth as fireAuth, 
  db as fireDb, 
  isConfigured 
} from '../lib/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  signOut,
  updateProfile as fireUpdateProfile
} from 'firebase/auth';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where 
} from 'firebase/firestore';
import { 
  UserProfile, 
  Student, 
  Teacher, 
  AttendanceRecord, 
  ExamResult, 
  Assignment, 
  Submission, 
  SchoolNotice, 
  TimetablePeriod, 
  FeeTransaction,
  UserRole,
  SystemNotification,
  Book,
  BookLoan
} from '../types';

// ==========================================
// MOCK DATA SEEDING (For LocalStorage Fallback)
// ==========================================

const INITIAL_PROFILES: UserProfile[] = [
  {
    uid: 'admin-1',
    email: 'admin@school.com',
    name: 'Ram Shrestha',
    role: 'admin',
    createdAt: '2025-01-10',
    phoneNumber: '+977 9851012345',
    address: 'New Baneshwor, Kathmandu, Nepal'
  },
  {
    uid: 'admin-2',
    email: 'admin2@school.com',
    name: 'Sita Shrestha',
    role: 'admin',
    createdAt: '2025-01-12',
    phoneNumber: '+977 9851012346',
    address: 'Patan, Lalitpur, Nepal'
  },
  {
    uid: 'teacher-1',
    email: 'teacher@school.com',
    name: 'Hari Shrestha',
    role: 'teacher',
    createdAt: '2025-02-15',
    phoneNumber: '+977 9841098765',
    address: 'Jhamsikhel, Lalitpur, Nepal',
    employeeId: 'T-101',
    subject: 'Mathematics',
    classId: 'Class 10'
  },
  {
    uid: 'student-1',
    email: 'student@school.com',
    name: 'Krishna Gurung',
    role: 'student',
    createdAt: '2025-03-01',
    phoneNumber: '+977 9812345678',
    address: 'Lakeside, Pokhara, Nepal',
    rollNo: 'S-101',
    classId: 'Class 10'
  }
];

const INITIAL_TEACHERS: Teacher[] = [
  {
    id: 'teacher-1',
    name: 'Hari Shrestha',
    email: 'teacher@school.com',
    employeeId: 'T-101',
    subject: 'Mathematics',
    classTeacherOf: 'Class 10',
    contact: '+977 9841098765',
    joinDate: '2023-08-15',
    gender: 'Male'
  },
  {
    id: 'teacher-2',
    name: 'Prakash Shrestha',
    email: 'prakash@school.com',
    employeeId: 'T-102',
    subject: 'Physics',
    classTeacherOf: 'Class 11',
    contact: '+977 9813579246',
    joinDate: '2021-09-01',
    gender: 'Male'
  },
  {
    id: 'teacher-3',
    name: 'Sabina Shrestha',
    email: 'sabina@school.com',
    employeeId: 'T-103',
    subject: 'English',
    classTeacherOf: 'Class 10',
    contact: '+977 9802468135',
    joinDate: '2024-01-05',
    gender: 'Female'
  },
  {
    id: 'teacher-4',
    name: 'Deepak Bhele',
    email: 'deepak@school.com',
    employeeId: 'T-104',
    subject: 'Computer Science',
    classTeacherOf: 'Class 12',
    contact: '+977 9841123456',
    joinDate: '2022-07-20',
    gender: 'Male'
  },
  {
    id: 'teacher-5',
    name: 'Maya Bhele',
    email: 'maya@school.com',
    employeeId: 'T-105',
    subject: 'Chemistry',
    classTeacherOf: 'Class 9',
    contact: '+977 9860112233',
    joinDate: '2023-02-10',
    gender: 'Female'
  },
  {
    id: 'teacher-6',
    name: 'Ramesh Bhele',
    email: 'ramesh@school.com',
    employeeId: 'T-106',
    subject: 'Biology',
    classTeacherOf: 'Class 11',
    contact: '+977 9811223344',
    joinDate: '2022-05-15',
    gender: 'Male'
  },
  {
    id: 'teacher-7',
    name: 'Anita Bhele',
    email: 'anita@school.com',
    employeeId: 'T-107',
    subject: 'Social Studies',
    classTeacherOf: 'Class 9',
    contact: '+977 9845667788',
    joinDate: '2024-03-01',
    gender: 'Female'
  },
  {
    id: 'teacher-8',
    name: 'Suman Bhele',
    email: 'suman@school.com',
    employeeId: 'T-108',
    subject: 'Nepali',
    classTeacherOf: 'Class 12',
    contact: '+977 9809988776',
    joinDate: '2021-11-20',
    gender: 'Male'
  }
];

const INITIAL_STUDENTS: Student[] = [
  {
    id: 'student-1',
    name: 'Krishna Gurung',
    email: 'student@school.com',
    rollNo: 'S-101',
    classId: 'Class 10',
    parentName: 'Lal Bahadur Gurung',
    parentContact: '+977 9801234567',
    address: 'Lakeside-6, Pokhara, Nepal',
    admissionDate: '2024-09-01',
    gender: 'Male',
    feeStatus: 'pending'
  },
  {
    id: 'student-2',
    name: 'Binita Rai',
    email: 'binita@school.com',
    rollNo: 'S-102',
    classId: 'Class 10',
    parentName: 'Damber Rai',
    parentContact: '+977 9812345678',
    address: 'Jhamsikhel, Lalitpur, Nepal',
    admissionDate: '2024-09-01',
    gender: 'Female',
    feeStatus: 'paid'
  },
  {
    id: 'student-3',
    name: 'Rajesh Tamang',
    email: 'rajesh@school.com',
    rollNo: 'S-103',
    classId: 'Class 11',
    parentName: 'Prem Tamang',
    parentContact: '+977 9851000007',
    address: 'Baluwatar, Kathmandu, Nepal',
    admissionDate: '2023-09-01',
    gender: 'Male',
    feeStatus: 'paid'
  },
  {
    id: 'student-4',
    name: 'Nisha Magar',
    email: 'nisha@school.com',
    rollNo: 'S-104',
    classId: 'Class 10',
    parentName: 'Bhakta Magar',
    parentContact: '+977 9841234567',
    address: 'Chabil, Kathmandu, Nepal',
    admissionDate: '2024-09-02',
    gender: 'Female',
    feeStatus: 'unpaid'
  },
  {
    id: 'student-5',
    name: 'Bikash Thapa',
    email: 'bikash@school.com',
    rollNo: 'S-105',
    classId: 'Class 12',
    parentName: 'Surya Thapa',
    parentContact: '+977 9861234567',
    address: 'Sarangkot, Pokhara, Nepal',
    admissionDate: '2022-09-01',
    gender: 'Male',
    feeStatus: 'pending'
  },
  {
    id: 'student-6',
    name: 'Sushma Karki',
    email: 'sushma@school.com',
    rollNo: 'S-106',
    classId: 'Class 9',
    parentName: 'Mohan Karki',
    parentContact: '+977 9801122334',
    address: 'Koteshwor, Kathmandu, Nepal',
    admissionDate: '2025-01-10',
    gender: 'Female',
    feeStatus: 'paid'
  },
  {
    id: 'student-7',
    name: 'Roshan Adhikari',
    email: 'roshan@school.com',
    rollNo: 'S-107',
    classId: 'Class 10',
    parentName: 'Govinda Adhikari',
    parentContact: '+977 9849988776',
    address: 'Thamel, Kathmandu, Nepal',
    admissionDate: '2024-09-05',
    gender: 'Male',
    feeStatus: 'pending'
  },
  {
    id: 'student-8',
    name: 'Sarita Pandey',
    email: 'sarita@school.com',
    rollNo: 'S-108',
    classId: 'Class 11',
    parentName: 'Rameshwar Pandey',
    parentContact: '+977 9818877665',
    address: 'Sanepa, Lalitpur, Nepal',
    admissionDate: '2023-09-10',
    gender: 'Female',
    feeStatus: 'paid'
  },
  {
    id: 'student-9',
    name: 'Anil Joshi',
    email: 'anil@school.com',
    rollNo: 'S-109',
    classId: 'Class 9',
    parentName: 'Laxman Joshi',
    parentContact: '+977 9867766554',
    address: 'Bhakundole, Lalitpur, Nepal',
    admissionDate: '2025-01-15',
    gender: 'Male',
    feeStatus: 'unpaid'
  },
  {
    id: 'student-10',
    name: 'Pooja Maharjan',
    email: 'pooja@school.com',
    rollNo: 'S-110',
    classId: 'Class 10',
    parentName: 'Buddha Maharjan',
    parentContact: '+977 9806655443',
    address: 'Mangal Bazar, Patan, Nepal',
    admissionDate: '2024-09-01',
    gender: 'Female',
    feeStatus: 'paid'
  },
  {
    id: 'student-11',
    name: 'Kiran Lama',
    email: 'kiran@school.com',
    rollNo: 'S-111',
    classId: 'Class 12',
    parentName: 'Pasang Lama',
    parentContact: '+977 9845544332',
    address: 'Boudha, Kathmandu, Nepal',
    admissionDate: '2022-09-01',
    gender: 'Male',
    feeStatus: 'pending'
  },
  {
    id: 'student-12',
    name: 'Smriti Khadka',
    email: 'smriti@school.com',
    rollNo: 'S-112',
    classId: 'Class 9',
    parentName: 'Ganesh Khadka',
    parentContact: '+977 9814433221',
    address: 'Chabahil, Kathmandu, Nepal',
    admissionDate: '2025-01-20',
    gender: 'Female',
    feeStatus: 'paid'
  },
  {
    id: 'student-13',
    name: 'Santosh BK',
    email: 'santosh@school.com',
    rollNo: 'S-113',
    classId: 'Class 10',
    parentName: 'Man Bahadur BK',
    parentContact: '+977 9863322110',
    address: 'Kalanki, Kathmandu, Nepal',
    admissionDate: '2024-09-08',
    gender: 'Male',
    feeStatus: 'paid'
  },
  {
    id: 'student-14',
    name: 'Alisha Chaudhary',
    email: 'alisha@school.com',
    rollNo: 'S-114',
    classId: 'Class 11',
    parentName: 'Ram Kumar Chaudhary',
    parentContact: '+977 9802211009',
    address: 'Dhangadhi, Nepal',
    admissionDate: '2023-09-12',
    gender: 'Female',
    feeStatus: 'pending'
  },
  {
    id: 'student-15',
    name: 'Rohan Yadav',
    email: 'rohan@school.com',
    rollNo: 'S-115',
    classId: 'Class 12',
    parentName: 'Shambhu Yadav',
    parentContact: '+977 9841100998',
    address: 'Janakpur, Nepal',
    admissionDate: '2022-09-05',
    gender: 'Male',
    feeStatus: 'paid'
  },
  {
    id: 'student-16',
    name: 'Manisha Shah',
    email: 'manisha@school.com',
    rollNo: 'S-116',
    classId: 'Class 9',
    parentName: 'Rajendra Shah',
    parentContact: '+977 9810099887',
    address: 'Biratnagar, Nepal',
    admissionDate: '2025-01-22',
    gender: 'Female',
    feeStatus: 'paid'
  },
  {
    id: 'student-17',
    name: 'Suresh Basnet',
    email: 'suresh@school.com',
    rollNo: 'S-117',
    classId: 'Class 10',
    parentName: 'Dhruba Basnet',
    parentContact: '+977 9869988776',
    address: 'Bhaktapur, Nepal',
    admissionDate: '2024-09-10',
    gender: 'Male',
    feeStatus: 'unpaid'
  },
  {
    id: 'student-18',
    name: 'Gita Bhandari',
    email: 'gita@school.com',
    rollNo: 'S-118',
    classId: 'Class 11',
    parentName: 'Bishnu Bhandari',
    parentContact: '+977 9808877665',
    address: 'Butwal, Nepal',
    admissionDate: '2023-09-15',
    gender: 'Female',
    feeStatus: 'paid'
  },
  {
    id: 'student-19',
    name: 'Nabin Acharya',
    email: 'nabin@school.com',
    rollNo: 'S-119',
    classId: 'Class 12',
    parentName: 'Shyam Acharya',
    parentContact: '+977 9847766554',
    address: 'Pokhara, Nepal',
    admissionDate: '2022-09-10',
    gender: 'Male',
    feeStatus: 'paid'
  },
  {
    id: 'student-20',
    name: 'Asha Koirala',
    email: 'asha@school.com',
    rollNo: 'S-120',
    classId: 'Class 10',
    parentName: 'Madhav Koirala',
    parentContact: '+977 9816655443',
    address: 'Dharan, Nepal',
    admissionDate: '2024-09-12',
    gender: 'Female',
    feeStatus: 'pending'
  }
];

const INITIAL_NOTICES: SchoolNotice[] = [
  {
    id: 'notice-1',
    title: 'Annual Sports Meet 2026',
    content: 'The Annual Sports Meet is scheduled to be held from August 15th to August 18th. Register for track and field events with your sports class representatives before July 28th.',
    date: '2026-07-15',
    target: 'all',
    author: 'Principal Ram Shrestha',
    important: true
  },
  {
    id: 'notice-2',
    title: 'Midterm Grading Guidelines',
    content: 'Teachers are requested to submit draft midterm evaluations in the marks module by July 25th. Parent-Teacher meetings will follow on August 2nd.',
    date: '2026-07-18',
    target: 'teachers',
    author: 'Academic Council',
    important: true
  },
  {
    id: 'notice-3',
    title: 'Science Fair Project Submissions',
    content: 'Students of Class 10 and 11, please submit your final project abstracts for the Regional Science Fair to your science class instructors by July 30th.',
    date: '2026-07-19',
    target: 'students',
    author: 'Prakash Shrestha',
    important: false
  }
];

const INITIAL_NOTIFICATIONS: SystemNotification[] = [
  // Admin Notifications
  {
    id: 'notif-admin-1',
    title: 'New Student Enrolled',
    content: 'Krishna Gurung has been enrolled in Class 10.',
    timeAgo: '2 hours ago',
    type: 'user',
    role: 'admin',
    read: false,
    createdAt: '2026-07-20T19:30:00.000Z'
  },
  {
    id: 'notif-admin-2',
    title: 'Fee Invoice Paid',
    content: 'Binita Rai paid Tuition Fee invoice INV-2026-002 of NRs. 15000.',
    timeAgo: '1 day ago',
    type: 'fee',
    role: 'admin',
    read: false,
    createdAt: '2026-07-19T10:00:00.000Z'
  },
  {
    id: 'notif-admin-3',
    title: 'Notice Board Published',
    content: 'Summer Holiday Schedule announcement has been successfully published.',
    timeAgo: '2 days ago',
    type: 'notice',
    role: 'admin',
    read: true,
    createdAt: '2026-07-18T14:20:00.000Z'
  },

  // Teacher Notifications
  {
    id: 'notif-teacher-1',
    title: 'Midterm Evaluation Notice',
    content: 'Reminder: Midterm evaluations must be submitted by July 25th.',
    timeAgo: '5 hours ago',
    type: 'notice',
    role: 'teacher',
    read: false,
    createdAt: '2026-07-20T16:30:00.000Z'
  },
  {
    id: 'notif-teacher-2',
    title: 'Timetable Updated',
    content: 'Your Friday Class 10 timetable period 3 has been moved to Room 204.',
    timeAgo: '1 day ago',
    type: 'system',
    role: 'teacher',
    read: false,
    createdAt: '2026-07-19T09:15:00.000Z'
  },

  // Student Notifications
  {
    id: 'notif-student-1',
    title: 'Science Fair Project Due',
    content: 'Class 10 science project abstract is due in 10 days.',
    timeAgo: '4 hours ago',
    type: 'notice',
    role: 'student',
    read: false,
    createdAt: '2026-07-20T17:30:00.000Z'
  },
  {
    id: 'notif-student-2',
    title: 'Fee Invoice Generated',
    content: 'Invoice INV-2026-001 for NRs. 15000 is pending in your fee portal.',
    timeAgo: '1 day ago',
    type: 'fee',
    role: 'student',
    read: false,
    createdAt: '2026-07-19T08:00:00.000Z'
  },
  {
    id: 'notif-student-3',
    title: 'English Grade Released',
    content: 'You received an "A" on Assignment 1: Poetry Analysis.',
    timeAgo: '2 days ago',
    type: 'grade',
    role: 'student',
    read: true,
    createdAt: '2026-07-18T11:00:00.000Z'
  },

  // General Notification
  {
    id: 'notif-gen-1',
    title: 'Annual Sports Meet 2026',
    content: 'Registrations are open for track and field events. Enroll today!',
    timeAgo: '3 days ago',
    type: 'notice',
    role: 'all',
    read: false,
    createdAt: '2026-07-17T09:00:00.000Z'
  }
];

const INITIAL_TIMETABLE: TimetablePeriod[] = [
  // Class 10 Timetable
  { id: 't-1', day: 'Monday', period: 1, time: '08:30 AM - 09:15 AM', subject: 'Mathematics', classId: 'Class 10', teacherName: 'Hari Shrestha', room: 'Room 201' },
  { id: 't-2', day: 'Monday', period: 2, time: '09:15 AM - 10:00 AM', subject: 'Physics', classId: 'Class 10', teacherName: 'Prakash Shrestha', room: 'Science Lab' },
  { id: 't-3', day: 'Monday', period: 3, time: '10:15 AM - 11:00 AM', subject: 'English', classId: 'Class 10', teacherName: 'Sabina Shrestha', room: 'Room 201' },
  { id: 't-4', day: 'Monday', period: 4, time: '11:00 AM - 11:45 AM', subject: 'Computer Science', classId: 'Class 10', teacherName: 'Deepak Bhele', room: 'Computer Lab' },
  
  { id: 't-5', day: 'Tuesday', period: 1, time: '08:30 AM - 09:15 AM', subject: 'English', classId: 'Class 10', teacherName: 'Sabina Shrestha', room: 'Room 201' },
  { id: 't-6', day: 'Tuesday', period: 2, time: '09:15 AM - 10:00 AM', subject: 'Mathematics', classId: 'Class 10', teacherName: 'Hari Shrestha', room: 'Room 201' },
  { id: 't-7', day: 'Tuesday', period: 3, time: '10:15 AM - 11:00 AM', subject: 'Physics', classId: 'Class 10', teacherName: 'Prakash Shrestha', room: 'Science Lab' },
  
  { id: 't-8', day: 'Wednesday', period: 1, time: '08:30 AM - 09:15 AM', subject: 'Mathematics', classId: 'Class 10', teacherName: 'Hari Shrestha', room: 'Room 201' },
  { id: 't-9', day: 'Wednesday', period: 2, time: '09:15 AM - 10:00 AM', subject: 'Computer Science', classId: 'Class 10', teacherName: 'Deepak Bhele', room: 'Computer Lab' },
  { id: 't-10', day: 'Wednesday', period: 3, time: '10:15 AM - 11:00 AM', subject: 'English', classId: 'Class 10', teacherName: 'Sabina Shrestha', room: 'Room 201' }
];

const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'assign-1',
    title: 'Quadratic Equations Practice Set',
    description: 'Solve problems 1 to 15 from Chapter 4 of the textbook. Detail steps for finding roots using quadratic formulas.',
    dueDate: '2026-07-25',
    classId: 'Class 10',
    subject: 'Mathematics',
    teacherId: 'teacher-1',
    teacherName: 'Hari Shrestha',
    createdAt: '2026-07-15',
    submissionsCount: 1
  },
  {
    id: 'assign-2',
    title: 'Kinematics Lab Report',
    description: 'Write a comprehensive lab report detailing the gravity acceleration experiments. Include data spreadsheets and graph analyses.',
    dueDate: '2026-07-28',
    classId: 'Class 11',
    subject: 'Physics',
    teacherId: 'teacher-2',
    teacherName: 'Prakash Shrestha',
    createdAt: '2026-07-16',
    submissionsCount: 0
  },
  {
    id: 'assign-3',
    title: 'Merchant of Venice Character Analysis',
    description: 'Write a 1000-word critical analysis on Shylock’s character traits and motivations in Act III.',
    dueDate: '2026-07-30',
    classId: 'Class 10',
    subject: 'English',
    teacherId: 'teacher-3',
    teacherName: 'Sabina Shrestha',
    createdAt: '2026-07-19',
    submissionsCount: 0
  }
];

const INITIAL_SUBMISSIONS: Submission[] = [
  {
    id: 'sub-1',
    assignmentId: 'assign-1',
    studentId: 'student-1',
    studentName: 'Krishna Gurung',
    submittedAt: '2026-07-18 14:32',
    submissionText: 'I have attached my solutions. I have verified all the calculations using completing the square and the discriminant rules. The files are uploaded.',
    status: 'submitted'
  }
];

const INITIAL_RESULTS: ExamResult[] = [
  { id: 'res-1', studentId: 'student-1', studentName: 'Krishna Gurung', rollNo: 'S-101', classId: 'Class 10', subject: 'Mathematics', examName: 'Unit Test I', marksObtained: 24, maxMarks: 25, grade: 'A+', remarks: 'Exceptional math skills. Keep it up!', date: '2026-05-12' },
  { id: 'res-2', studentId: 'student-1', studentName: 'Krishna Gurung', rollNo: 'S-101', classId: 'Class 10', subject: 'English', examName: 'Unit Test I', marksObtained: 19, maxMarks: 25, grade: 'B+', remarks: 'Good essays, vocabulary can be polished.', date: '2026-05-14' },
  { id: 'res-3', studentId: 'student-2', studentName: 'Binita Rai', rollNo: 'S-102', classId: 'Class 10', subject: 'Mathematics', examName: 'Unit Test I', marksObtained: 22, maxMarks: 25, grade: 'A', remarks: 'Very methodical solutions.', date: '2026-05-12' },
  { id: 'res-4', studentId: 'student-3', studentName: 'Rajesh Tamang', rollNo: 'S-103', classId: 'Class 11', subject: 'Physics', examName: 'Unit Test I', marksObtained: 23, maxMarks: 25, grade: 'A+', remarks: 'Outstanding conceptual understanding.', date: '2026-05-13' }
];

const INITIAL_FEES: FeeTransaction[] = [
  { id: 'fee-1', studentId: 'student-1', studentName: 'Krishna Gurung', rollNo: 'S-101', classId: 'Class 10', amount: 15000, category: 'Tuition Fee', dueDate: '2026-07-30', status: 'pending', invoiceNo: 'INV-2026-001' },
  { id: 'fee-2', studentId: 'student-2', studentName: 'Binita Rai', rollNo: 'S-102', classId: 'Class 10', amount: 15000, category: 'Tuition Fee', dueDate: '2026-07-30', status: 'paid', paymentDate: '2026-07-10', paymentMethod: 'Credit Card', invoiceNo: 'INV-2026-002' },
  { id: 'fee-3', studentId: 'student-4', studentName: 'Nisha Magar', rollNo: 'S-104', classId: 'Class 10', amount: 15000, category: 'Tuition Fee', dueDate: '2026-07-30', status: 'unpaid', invoiceNo: 'INV-2026-003' },
  { id: 'fee-4', studentId: 'student-3', studentName: 'Rajesh Tamang', rollNo: 'S-103', classId: 'Class 11', amount: 15000, category: 'Tuition Fee', dueDate: '2026-07-30', status: 'paid', paymentDate: '2026-07-02', paymentMethod: 'Bank Transfer', invoiceNo: 'INV-2026-004' },
  { id: 'fee-5', studentId: 'student-1', studentName: 'Krishna Gurung', rollNo: 'S-101', classId: 'Class 10', amount: 1500, category: 'Exam Fee', dueDate: '2026-06-15', status: 'paid', paymentDate: '2026-06-10', paymentMethod: 'Cash', invoiceNo: 'INV-2026-005' }
];

const INITIAL_ATTENDANCE: AttendanceRecord[] = [
  { id: 'att-1', date: '2026-07-18', studentId: 'student-1', studentName: 'Krishna Gurung', rollNo: 'S-101', classId: 'Class 10', status: 'present', markedBy: 'Hari Shrestha' },
  { id: 'att-2', date: '2026-07-18', studentId: 'student-2', studentName: 'Binita Rai', rollNo: 'S-102', classId: 'Class 10', status: 'present', markedBy: 'Hari Shrestha' },
  { id: 'att-3', date: '2026-07-19', studentId: 'student-1', studentName: 'Krishna Gurung', rollNo: 'S-101', classId: 'Class 10', status: 'late', markedBy: 'Hari Shrestha' },
  { id: 'att-4', date: '2026-07-19', studentId: 'student-2', studentName: 'Binita Rai', rollNo: 'S-102', classId: 'Class 10', status: 'present', markedBy: 'Hari Shrestha' }
];

const INITIAL_BOOKS: Book[] = [
  { id: 'book-1', title: 'Concepts of Physics (Vol 1)', author: 'H.C. Verma', isbn: '978-8177091878', category: 'Physics', quantity: 5, available: 4, location: 'Shelf B-2' },
  { id: 'book-2', title: 'Fundamentals of Inorganic Chemistry', author: 'J.D. Lee', isbn: '978-0471125297', category: 'Chemistry', quantity: 3, available: 3, location: 'Shelf B-4' },
  { id: 'book-3', title: 'Introduction to Algorithms', author: 'Thomas H. Cormen', isbn: '978-0262033848', category: 'Computer Science', quantity: 4, available: 3, location: 'Shelf C-1' },
  { id: 'book-4', title: 'A Brief History of Time', author: 'Stephen Hawking', isbn: '978-0553380163', category: 'Science', quantity: 6, available: 6, location: 'Shelf A-1' },
  { id: 'book-5', title: 'Secondary Level Mathematics (Class 10)', author: 'D.R. Bajracharya', isbn: '978-9937012345', category: 'Mathematics', quantity: 8, available: 7, location: 'Shelf A-3' },
  { id: 'book-6', title: 'Muna Madan', author: 'Laxmi Prasad Devkota', isbn: '978-9937105021', category: 'Literature', quantity: 10, available: 9, location: 'Shelf D-1' },
  { id: 'book-7', title: 'The Great Gatsby', author: 'F. Scott Fitzgerald', isbn: '978-0743273565', category: 'Literature', quantity: 5, available: 5, location: 'Shelf D-3' },
];

const INITIAL_LOANS: BookLoan[] = [
  {
    id: 'loan-1',
    bookId: 'book-1',
    bookTitle: 'Concepts of Physics (Vol 1)',
    bookAuthor: 'H.C. Verma',
    studentId: 'student-1',
    studentName: 'Krishna Gurung',
    studentRollNo: 'S-101',
    classId: 'Class 10',
    borrowDate: '2026-07-10',
    dueDate: '2026-07-24',
    status: 'borrowed'
  },
  {
    id: 'loan-2',
    bookId: 'book-3',
    bookTitle: 'Introduction to Algorithms',
    bookAuthor: 'Thomas H. Cormen',
    studentId: 'student-2',
    studentName: 'Binita Rai',
    studentRollNo: 'S-102',
    classId: 'Class 10',
    borrowDate: '2026-07-01',
    dueDate: '2026-07-15',
    returnDate: '2026-07-14',
    status: 'returned'
  },
  {
    id: 'loan-3',
    bookId: 'book-5',
    bookTitle: 'Secondary Level Mathematics (Class 10)',
    bookAuthor: 'D.R. Bajracharya',
    studentId: 'student-1',
    studentName: 'Krishna Gurung',
    studentRollNo: 'S-101',
    classId: 'Class 10',
    borrowDate: '2026-06-15',
    dueDate: '2026-06-29',
    status: 'overdue'
  },
  {
    id: 'loan-4',
    bookId: 'book-6',
    bookTitle: 'Muna Madan',
    bookAuthor: 'Laxmi Prasad Devkota',
    studentId: 'student-3',
    studentName: 'Rajesh Tamang',
    studentRollNo: 'S-103',
    classId: 'Class 11',
    borrowDate: '2026-07-18',
    dueDate: '2026-08-01',
    status: 'borrowed'
  }
];

// Helper to initialize local storage data if not present or force update to version 4
const initializeLocalStorage = () => {
  const version = localStorage.getItem('sms_v4_nepal_names');
  if (!version) {
    localStorage.setItem('sms_profiles', JSON.stringify(INITIAL_PROFILES));
    localStorage.setItem('sms_teachers', JSON.stringify(INITIAL_TEACHERS));
    localStorage.setItem('sms_students', JSON.stringify(INITIAL_STUDENTS));
    localStorage.setItem('sms_notices', JSON.stringify(INITIAL_NOTICES));
    localStorage.setItem('sms_timetable', JSON.stringify(INITIAL_TIMETABLE));
    localStorage.setItem('sms_assignments', JSON.stringify(INITIAL_ASSIGNMENTS));
    localStorage.setItem('sms_submissions', JSON.stringify(INITIAL_SUBMISSIONS));
    localStorage.setItem('sms_results', JSON.stringify(INITIAL_RESULTS));
    localStorage.setItem('sms_fees', JSON.stringify(INITIAL_FEES));
    localStorage.setItem('sms_attendance', JSON.stringify(INITIAL_ATTENDANCE));
    localStorage.setItem('sms_notifications', JSON.stringify(INITIAL_NOTIFICATIONS));
    localStorage.setItem('sms_books', JSON.stringify(INITIAL_BOOKS));
    localStorage.setItem('sms_loans', JSON.stringify(INITIAL_LOANS));
    localStorage.setItem('sms_v4_nepal_names', 'true');
  }

  if (!localStorage.getItem('sms_passwords')) {
    const initialPasswords = {
      'admin@school.com': 'admin123',
      'teacher@school.com': 'teacher123',
      'student@school.com': 'student123'
    };
    localStorage.setItem('sms_passwords', JSON.stringify(initialPasswords));
  }
};

initializeLocalStorage();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentUser = fireAuth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
      tenantId: currentUser?.tenantId,
      providerInfo: currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ==========================================
// DB SERVICE DEFINITION
// ==========================================

export const dbService = {
  // Check if standard Firebase is enabled
  isFirebaseActive(): boolean {
    return isConfigured;
  },

  // ----------------------------------------
  // AUTHENTICATION SERVICES
  // ----------------------------------------
  
  async login(email: string, password: string): Promise<UserProfile> {
    if (isConfigured) {
      try {
        const userCredential = await signInWithEmailAndPassword(fireAuth, email, password);
        const uid = userCredential.user.uid;
        
        // Fetch profile from Firestore
        const profileRef = doc(fireDb, 'profiles', uid);
        const profileSnap = await getDoc(profileRef);
        
        if (profileSnap.exists()) {
          const profile = profileSnap.data() as UserProfile;
          localStorage.setItem('sms_active_user', JSON.stringify(profile));
          return profile;
        } else {
          // If no profile found in DB, search local profiles fallback or create default
          console.warn("User authenticated but profile not found in Firestore.");
          throw new Error("User profile not found. Contact administrator.");
        }
      } catch (err: any) {
        throw new Error(err.message || "Failed to sign in with Firebase");
      }
    } else {
      // Local fall-back authentication
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const profiles = JSON.parse(localStorage.getItem('sms_profiles') || '[]') as UserProfile[];
          const user = profiles.find(p => p.email.toLowerCase() === email.toLowerCase());
          
          if (!user) {
            reject(new Error("No account found with this email. Use admin@school.com, teacher@school.com or student@school.com for mock-testing."));
            return;
          }

          // Simple local password validation based on stored passwords
          const localPasswords = JSON.parse(localStorage.getItem('sms_passwords') || '{}') as Record<string, string>;
          const expectedPass = localPasswords[user.email.toLowerCase()] || 'password123';
          if (password !== expectedPass && password !== 'admin123' && password !== 'teacher123' && password !== 'student123') {
            reject(new Error("Invalid password."));
            return;
          }

          localStorage.setItem('sms_active_user', JSON.stringify(user));
          resolve(user);
        }, 500);
      });
    }
  },

  async signup(email: string, password: string, name: string, role: UserRole, additionalFields: Partial<UserProfile> = {}): Promise<UserProfile> {
    const uid = 'user-' + Math.random().toString(36).substr(2, 9);
    const newProfile: UserProfile = {
      uid,
      email,
      name,
      role,
      createdAt: new Date().toISOString().split('T')[0],
      ...additionalFields
    };

    if (isConfigured) {
      try {
        const userCredential = await createUserWithEmailAndPassword(fireAuth, email, password);
        const firebaseUid = userCredential.user.uid;
        await fireUpdateProfile(userCredential.user, { displayName: name });
        
        const dbProfile = { ...newProfile, uid: firebaseUid };
        
        // Write to Firestore
        await setDoc(doc(fireDb, 'profiles', firebaseUid), dbProfile);
        
        // Also seed relevant role tables if admin creates them
        if (role === 'student') {
          const studentDoc: Student = {
            id: firebaseUid,
            name,
            email,
            rollNo: additionalFields.rollNo || 'S-' + Math.floor(100 + Math.random() * 900),
            classId: additionalFields.classId || 'Class 10',
            parentName: additionalFields.name ? `Parent of ${name}` : 'Unknown',
            parentContact: additionalFields.phoneNumber || 'N/A',
            address: additionalFields.address || 'N/A',
            admissionDate: new Date().toISOString().split('T')[0],
            gender: 'Other',
            feeStatus: 'pending'
          };
          await setDoc(doc(fireDb, 'students', firebaseUid), studentDoc);
        } else if (role === 'teacher') {
          const teacherDoc: Teacher = {
            id: firebaseUid,
            name,
            email,
            employeeId: additionalFields.employeeId || 'T-' + Math.floor(100 + Math.random() * 900),
            subject: additionalFields.subject || 'General',
            contact: additionalFields.phoneNumber || 'N/A',
            joinDate: new Date().toISOString().split('T')[0],
            gender: 'Other'
          };
          await setDoc(doc(fireDb, 'teachers', firebaseUid), teacherDoc);
        }

        localStorage.setItem('sms_active_user', JSON.stringify(dbProfile));
        return dbProfile;
      } catch (err: any) {
        throw new Error(err.message || "Failed to register account in Firebase");
      }
    } else {
      // Local Auth signup fallback
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          const profiles = JSON.parse(localStorage.getItem('sms_profiles') || '[]') as UserProfile[];
          if (profiles.some(p => p.email.toLowerCase() === email.toLowerCase())) {
            reject(new Error("Email already registered."));
            return;
          }

          profiles.push(newProfile);
          localStorage.setItem('sms_profiles', JSON.stringify(profiles));

          // Save password in local storage passwords store
          const localPasswords = JSON.parse(localStorage.getItem('sms_passwords') || '{}');
          localPasswords[email.toLowerCase()] = password;
          localStorage.setItem('sms_passwords', JSON.stringify(localPasswords));

          // Also auto-add to local student or teacher collections
          if (role === 'student') {
            const students = JSON.parse(localStorage.getItem('sms_students') || '[]') as Student[];
            const newStudent: Student = {
              id: uid,
              name,
              email,
              rollNo: additionalFields.rollNo || 'S-' + Math.floor(100 + Math.random() * 900),
              classId: additionalFields.classId || 'Class 10',
              parentName: `Parent of ${name}`,
              parentContact: additionalFields.phoneNumber || '+977 9801234567',
              address: additionalFields.address || 'Kathmandu, Nepal',
              admissionDate: new Date().toISOString().split('T')[0],
              gender: 'Male',
              feeStatus: 'pending'
            };
            students.push(newStudent);
            localStorage.setItem('sms_students', JSON.stringify(students));
          } else if (role === 'teacher') {
            const teachers = JSON.parse(localStorage.getItem('sms_teachers') || '[]') as Teacher[];
            const newTeacher: Teacher = {
              id: uid,
              name,
              email,
              employeeId: additionalFields.employeeId || 'T-' + Math.floor(100 + Math.random() * 900),
              subject: additionalFields.subject || 'Mathematics',
              contact: additionalFields.phoneNumber || '+977 9801234567',
              joinDate: new Date().toISOString().split('T')[0],
              gender: 'Male'
            };
            teachers.push(newTeacher);
            localStorage.setItem('sms_teachers', JSON.stringify(teachers));
          }

          localStorage.setItem('sms_active_user', JSON.stringify(newProfile));
          resolve(newProfile);
        }, 500);
      });
    }
  },

  async logout(): Promise<void> {
    if (isConfigured) {
      await signOut(fireAuth);
    }
    localStorage.removeItem('sms_active_user');
  },

  getCurrentUser(): UserProfile | null {
    const userString = localStorage.getItem('sms_active_user');
    if (userString) {
      try {
        return JSON.parse(userString) as UserProfile;
      } catch {
        return null;
      }
    }
    return null;
  },

  async updateProfile(uid: string, updatedFields: Partial<UserProfile>): Promise<UserProfile> {
    if (isConfigured) {
      try {
        const ref = doc(fireDb, 'profiles', uid);
        await updateDoc(ref, updatedFields);
        const updatedSnap = await getDoc(ref);
        const fullProfile = updatedSnap.data() as UserProfile;
        
        // Sync local storage active session
        const active = this.getCurrentUser();
        if (active && active.uid === uid) {
          localStorage.setItem('sms_active_user', JSON.stringify(fullProfile));
        }
        return fullProfile;
      } catch (err: any) {
        throw new Error(err.message || "Failed to update profile in Firestore");
      }
    } else {
      return new Promise((resolve) => {
        const profiles = JSON.parse(localStorage.getItem('sms_profiles') || '[]') as UserProfile[];
        const idx = profiles.findIndex(p => p.uid === uid);
        if (idx !== -1) {
          profiles[idx] = { ...profiles[idx], ...updatedFields };
          localStorage.setItem('sms_profiles', JSON.stringify(profiles));
          
          const active = this.getCurrentUser();
          if (active && active.uid === uid) {
            const synced = { ...active, ...updatedFields };
            localStorage.setItem('sms_active_user', JSON.stringify(synced));
          }
          resolve(profiles[idx]);
        } else {
          resolve({ uid, email: '', name: '', role: 'student', createdAt: '', ...updatedFields } as UserProfile);
        }
      });
    }
  },

  // ----------------------------------------
  // STUDENTS CRUD SERVICES
  // ----------------------------------------
  async getStudents(): Promise<Student[]> {
    if (isConfigured) {
      const snap = await getDocs(collection(fireDb, 'students'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Student));
    } else {
      return JSON.parse(localStorage.getItem('sms_students') || '[]') as Student[];
    }
  },

  async addStudent(student: Omit<Student, 'id'>): Promise<Student> {
    const id = 'student-' + Math.random().toString(36).substr(2, 9);
    const fullStudent = { id, ...student };
    if (isConfigured) {
      await setDoc(doc(fireDb, 'students', id), student);
      
      // Also register a mock profile so they can login
      const profile: UserProfile = {
        uid: id,
        email: student.email,
        name: student.name,
        role: 'student',
        createdAt: new Date().toISOString().split('T')[0],
        rollNo: student.rollNo,
        classId: student.classId
      };
      await setDoc(doc(fireDb, 'profiles', id), profile);
      
      return fullStudent;
    } else {
      const list = await this.getStudents();
      list.push(fullStudent);
      localStorage.setItem('sms_students', JSON.stringify(list));

      // Register profile fallback
      const profiles = JSON.parse(localStorage.getItem('sms_profiles') || '[]') as UserProfile[];
      profiles.push({
        uid: id,
        email: student.email,
        name: student.name,
        role: 'student',
        createdAt: new Date().toISOString().split('T')[0],
        rollNo: student.rollNo,
        classId: student.classId
      });
      localStorage.setItem('sms_profiles', JSON.stringify(profiles));

      return fullStudent;
    }
  },

  async updateStudent(id: string, updated: Partial<Student>): Promise<Student> {
    if (isConfigured) {
      await updateDoc(doc(fireDb, 'students', id), updated);
      const snap = await getDoc(doc(fireDb, 'students', id));
      return { id, ...snap.data() } as Student;
    } else {
      const list = await this.getStudents();
      const idx = list.findIndex(s => s.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updated };
        localStorage.setItem('sms_students', JSON.stringify(list));
        
        // Sync profile table too
        const profiles = JSON.parse(localStorage.getItem('sms_profiles') || '[]') as UserProfile[];
        const pIdx = profiles.findIndex(p => p.uid === id);
        if (pIdx !== -1) {
          if (updated.name) profiles[pIdx].name = updated.name;
          if (updated.email) profiles[pIdx].email = updated.email;
          if (updated.rollNo) profiles[pIdx].rollNo = updated.rollNo;
          if (updated.classId) profiles[pIdx].classId = updated.classId;
          localStorage.setItem('sms_profiles', JSON.stringify(profiles));
        }

        return list[idx];
      }
      throw new Error("Student not found.");
    }
  },

  async deleteStudent(id: string): Promise<void> {
    if (isConfigured) {
      await deleteDoc(doc(fireDb, 'students', id));
      await deleteDoc(doc(fireDb, 'profiles', id));
    } else {
      const list = await this.getStudents();
      const filtered = list.filter(s => s.id !== id);
      localStorage.setItem('sms_students', JSON.stringify(filtered));

      const profiles = JSON.parse(localStorage.getItem('sms_profiles') || '[]') as UserProfile[];
      const filteredProfiles = profiles.filter(p => p.uid !== id);
      localStorage.setItem('sms_profiles', JSON.stringify(filteredProfiles));
    }
  },

  // ----------------------------------------
  // TEACHERS CRUD SERVICES
  // ----------------------------------------
  async getTeachers(): Promise<Teacher[]> {
    if (isConfigured) {
      const snap = await getDocs(collection(fireDb, 'teachers'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Teacher));
    } else {
      return JSON.parse(localStorage.getItem('sms_teachers') || '[]') as Teacher[];
    }
  },

  async addTeacher(teacher: Omit<Teacher, 'id'>): Promise<Teacher> {
    const id = 'teacher-' + Math.random().toString(36).substr(2, 9);
    const fullTeacher = { id, ...teacher };
    if (isConfigured) {
      await setDoc(doc(fireDb, 'teachers', id), teacher);
      
      // Also register a mock profile so they can login
      const profile: UserProfile = {
        uid: id,
        email: teacher.email,
        name: teacher.name,
        role: 'teacher',
        createdAt: new Date().toISOString().split('T')[0],
        employeeId: teacher.employeeId,
        subject: teacher.subject
      };
      await setDoc(doc(fireDb, 'profiles', id), profile);

      return fullTeacher;
    } else {
      const list = await this.getTeachers();
      list.push(fullTeacher);
      localStorage.setItem('sms_teachers', JSON.stringify(list));

      // Register profile fallback
      const profiles = JSON.parse(localStorage.getItem('sms_profiles') || '[]') as UserProfile[];
      profiles.push({
        uid: id,
        email: teacher.email,
        name: teacher.name,
        role: 'teacher',
        createdAt: new Date().toISOString().split('T')[0],
        employeeId: teacher.employeeId,
        subject: teacher.subject
      });
      localStorage.setItem('sms_profiles', JSON.stringify(profiles));

      return fullTeacher;
    }
  },

  async updateTeacher(id: string, updated: Partial<Teacher>): Promise<Teacher> {
    if (isConfigured) {
      await updateDoc(doc(fireDb, 'teachers', id), updated);
      const snap = await getDoc(doc(fireDb, 'teachers', id));
      return { id, ...snap.data() } as Teacher;
    } else {
      const list = await this.getTeachers();
      const idx = list.findIndex(t => t.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updated };
        localStorage.setItem('sms_teachers', JSON.stringify(list));

        // Sync profile table too
        const profiles = JSON.parse(localStorage.getItem('sms_profiles') || '[]') as UserProfile[];
        const pIdx = profiles.findIndex(p => p.uid === id);
        if (pIdx !== -1) {
          if (updated.name) profiles[pIdx].name = updated.name;
          if (updated.email) profiles[pIdx].email = updated.email;
          if (updated.employeeId) profiles[pIdx].employeeId = updated.employeeId;
          if (updated.subject) profiles[pIdx].subject = updated.subject;
          localStorage.setItem('sms_profiles', JSON.stringify(profiles));
        }

        return list[idx];
      }
      throw new Error("Teacher not found.");
    }
  },

  async deleteTeacher(id: string): Promise<void> {
    if (isConfigured) {
      await deleteDoc(doc(fireDb, 'teachers', id));
      await deleteDoc(doc(fireDb, 'profiles', id));
    } else {
      const list = await this.getTeachers();
      const filtered = list.filter(t => t.id !== id);
      localStorage.setItem('sms_teachers', JSON.stringify(filtered));

      const profiles = JSON.parse(localStorage.getItem('sms_profiles') || '[]') as UserProfile[];
      const filteredProfiles = profiles.filter(p => p.uid !== id);
      localStorage.setItem('sms_profiles', JSON.stringify(filteredProfiles));
    }
  },

  // ----------------------------------------
  // NOTICES CRUD SERVICES
  // ----------------------------------------
  async getNotices(): Promise<SchoolNotice[]> {
    if (isConfigured) {
      const snap = await getDocs(collection(fireDb, 'notices'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as SchoolNotice));
    } else {
      return JSON.parse(localStorage.getItem('sms_notices') || '[]') as SchoolNotice[];
    }
  },

  async addNotice(notice: Omit<SchoolNotice, 'id'>): Promise<SchoolNotice> {
    const id = 'notice-' + Math.random().toString(36).substr(2, 9);
    const fullNotice = { id, ...notice };
    
    // Add corresponding notification
    await this.addNotification({
      title: `Notice: ${notice.title}`,
      content: notice.content.substring(0, 100) + (notice.content.length > 100 ? '...' : ''),
      type: 'notice',
      role: notice.target === 'all' ? 'all' : notice.target === 'teachers' ? 'teacher' : 'student'
    });

    if (isConfigured) {
      await setDoc(doc(fireDb, 'notices', id), notice);
      return fullNotice;
    } else {
      const list = await this.getNotices();
      list.unshift(fullNotice); // most recent first
      localStorage.setItem('sms_notices', JSON.stringify(list));
      return fullNotice;
    }
  },

  async updateNotice(id: string, updated: Partial<SchoolNotice>): Promise<SchoolNotice> {
    if (isConfigured) {
      await updateDoc(doc(fireDb, 'notices', id), updated);
      const snap = await getDoc(doc(fireDb, 'notices', id));
      return { id, ...snap.data() } as SchoolNotice;
    } else {
      const list = await this.getNotices();
      const idx = list.findIndex(n => n.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updated };
        localStorage.setItem('sms_notices', JSON.stringify(list));
        return list[idx];
      }
      throw new Error("Notice not found.");
    }
  },

  async deleteNotice(id: string): Promise<void> {
    if (isConfigured) {
      await deleteDoc(doc(fireDb, 'notices', id));
    } else {
      const list = await this.getNotices();
      const filtered = list.filter(n => n.id !== id);
      localStorage.setItem('sms_notices', JSON.stringify(filtered));
    }
  },

  // ----------------------------------------
  // NOTIFICATIONS CRUD SERVICES
  // ----------------------------------------
  async getNotifications(role: UserRole): Promise<SystemNotification[]> {
    if (isConfigured) {
      try {
        const snap = await getDocs(collection(fireDb, 'notifications'));
        const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as SystemNotification));
        return all
          .filter(n => n.role === 'all' || n.role === role)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } catch (err) {
        console.error("Firebase load failed, falling back", err);
      }
    }
    
    const list = JSON.parse(localStorage.getItem('sms_notifications') || '[]') as SystemNotification[];
    return list.filter(n => n.role === 'all' || n.role === role);
  },

  async addNotification(notif: Omit<SystemNotification, 'id' | 'createdAt' | 'read' | 'timeAgo'>): Promise<SystemNotification> {
    const id = 'notif-' + Math.random().toString(36).substr(2, 9);
    const fullNotif: SystemNotification = {
      id,
      ...notif,
      read: false,
      timeAgo: 'Just now',
      createdAt: new Date().toISOString()
    };

    if (isConfigured) {
      try {
        await setDoc(doc(fireDb, 'notifications', id), fullNotif);
        return fullNotif;
      } catch (err) {
        console.error("Firebase add notification failed, falling back", err);
      }
    }

    const list = JSON.parse(localStorage.getItem('sms_notifications') || '[]') as SystemNotification[];
    list.unshift(fullNotif);
    localStorage.setItem('sms_notifications', JSON.stringify(list));
    return fullNotif;
  },

  async markNotificationAsRead(id: string): Promise<void> {
    if (isConfigured) {
      try {
        await updateDoc(doc(fireDb, 'notifications', id), { read: true });
        return;
      } catch (err) {
        console.error("Firebase update failed, falling back", err);
      }
    }

    const list = JSON.parse(localStorage.getItem('sms_notifications') || '[]') as SystemNotification[];
    const idx = list.findIndex(n => n.id === id);
    if (idx !== -1) {
      list[idx].read = true;
      localStorage.setItem('sms_notifications', JSON.stringify(list));
    }
  },

  async markAllNotificationsAsRead(role: UserRole): Promise<void> {
    if (isConfigured) {
      try {
        const snap = await getDocs(collection(fireDb, 'notifications'));
        const docsToUpdate = snap.docs.filter(d => {
          const data = d.data();
          return (data.role === 'all' || data.role === role) && !data.read;
        });
        for (const docToUpdate of docsToUpdate) {
          await updateDoc(doc(fireDb, 'notifications', docToUpdate.id), { read: true });
        }
        return;
      } catch (err) {
        console.error("Firebase update failed, falling back", err);
      }
    }

    const list = JSON.parse(localStorage.getItem('sms_notifications') || '[]') as SystemNotification[];
    const updated = list.map(n => {
      if (n.role === 'all' || n.role === role) {
        return { ...n, read: true };
      }
      return n;
    });
    localStorage.setItem('sms_notifications', JSON.stringify(updated));
  },

  async deleteNotification(id: string): Promise<void> {
    if (isConfigured) {
      try {
        await deleteDoc(doc(fireDb, 'notifications', id));
        return;
      } catch (err) {
        console.error("Firebase delete failed, falling back", err);
      }
    }

    const list = JSON.parse(localStorage.getItem('sms_notifications') || '[]') as SystemNotification[];
    const filtered = list.filter(n => n.id !== id);
    localStorage.setItem('sms_notifications', JSON.stringify(filtered));
  },

  async clearNotifications(role: UserRole): Promise<void> {
    if (isConfigured) {
      try {
        const snap = await getDocs(collection(fireDb, 'notifications'));
        const docsToDelete = snap.docs.filter(d => {
          const data = d.data();
          return data.role === 'all' || data.role === role;
        });
        for (const docToDelete of docsToDelete) {
          await deleteDoc(doc(fireDb, 'notifications', docToDelete.id));
        }
        return;
      } catch (err) {
        console.error("Firebase delete failed, falling back", err);
      }
    }

    const list = JSON.parse(localStorage.getItem('sms_notifications') || '[]') as SystemNotification[];
    const filtered = list.filter(n => n.role !== 'all' && n.role !== role);
    localStorage.setItem('sms_notifications', JSON.stringify(filtered));
  },

  // ----------------------------------------
  // ATTENDANCE MODULE
  // ----------------------------------------
  async getAttendance(classId: string, date: string): Promise<AttendanceRecord[]> {
    if (isConfigured) {
      const q = query(collection(fireDb, 'attendance'), where('classId', '==', classId), where('date', '==', date));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceRecord));
    } else {
      const list = JSON.parse(localStorage.getItem('sms_attendance') || '[]') as AttendanceRecord[];
      return list.filter(a => a.classId === classId && a.date === date);
    }
  },

  async saveAttendance(records: Omit<AttendanceRecord, 'id'>[]): Promise<void> {
    if (isConfigured) {
      for (const rec of records) {
        const id = `${rec.classId}_${rec.date}_${rec.studentId}`;
        await setDoc(doc(fireDb, 'attendance', id), rec);
      }
    } else {
      const list = JSON.parse(localStorage.getItem('sms_attendance') || '[]') as AttendanceRecord[];
      
      // Update or Insert
      for (const rec of records) {
        const idx = list.findIndex(a => a.classId === rec.classId && a.date === rec.date && a.studentId === rec.studentId);
        if (idx !== -1) {
          list[idx] = { ...list[idx], ...rec };
        } else {
          list.push({ id: 'att-' + Math.random().toString(36).substr(2, 9), ...rec });
        }
      }
      localStorage.setItem('sms_attendance', JSON.stringify(list));
    }
  },

  async getStudentAttendancePercentage(studentId: string): Promise<number> {
    let records: AttendanceRecord[] = [];
    if (isConfigured) {
      const q = query(collection(fireDb, 'attendance'), where('studentId', '==', studentId));
      const snap = await getDocs(q);
      records = snap.docs.map(d => d.data() as AttendanceRecord);
    } else {
      const list = JSON.parse(localStorage.getItem('sms_attendance') || '[]') as AttendanceRecord[];
      records = list.filter(a => a.studentId === studentId);
    }

    if (records.length === 0) return 100; // default perfect if no logs
    const presentCount = records.filter(r => r.status === 'present' || r.status === 'late').length;
    return Math.round((presentCount / records.length) * 100);
  },

  // ----------------------------------------
  // ASSIGNMENTS & SUBMISSIONS
  // ----------------------------------------
  async getAssignments(classId?: string): Promise<Assignment[]> {
    if (isConfigured) {
      let snap;
      if (classId) {
        const q = query(collection(fireDb, 'assignments'), where('classId', '==', classId));
        snap = await getDocs(q);
      } else {
        snap = await getDocs(collection(fireDb, 'assignments'));
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Assignment));
    } else {
      const list = JSON.parse(localStorage.getItem('sms_assignments') || '[]') as Assignment[];
      if (classId) {
        return list.filter(a => a.classId === classId);
      }
      return list;
    }
  },

  async addAssignment(assignment: Omit<Assignment, 'id'>): Promise<Assignment> {
    const id = 'assign-' + Math.random().toString(36).substr(2, 9);
    const fullAssignment = { id, ...assignment, submissionsCount: 0 };
    if (isConfigured) {
      await setDoc(doc(fireDb, 'assignments', id), fullAssignment);
      return fullAssignment;
    } else {
      const list = await this.getAssignments();
      list.push(fullAssignment);
      localStorage.setItem('sms_assignments', JSON.stringify(list));
      return fullAssignment;
    }
  },

  async deleteAssignment(id: string): Promise<void> {
    if (isConfigured) {
      await deleteDoc(doc(fireDb, 'assignments', id));
    } else {
      const list = await this.getAssignments();
      const filtered = list.filter(a => a.id !== id);
      localStorage.setItem('sms_assignments', JSON.stringify(filtered));
    }
  },

  async getSubmissions(assignmentId: string): Promise<Submission[]> {
    if (isConfigured) {
      const q = query(collection(fireDb, 'submissions'), where('assignmentId', '==', assignmentId));
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Submission));
    } else {
      const list = JSON.parse(localStorage.getItem('sms_submissions') || '[]') as Submission[];
      return list.filter(s => s.assignmentId === assignmentId);
    }
  },

  async submitAssignment(submission: Omit<Submission, 'id'>): Promise<Submission> {
    const id = 'sub-' + Math.random().toString(36).substr(2, 9);
    const fullSubmission = { id, ...submission };
    if (isConfigured) {
      await setDoc(doc(fireDb, 'submissions', id), fullSubmission);
      
      // Update submission count on assignment
      const assignDoc = doc(fireDb, 'assignments', submission.assignmentId);
      const snap = await getDoc(assignDoc);
      if (snap.exists()) {
        const count = (snap.data().submissionsCount || 0) + 1;
        await updateDoc(assignDoc, { submissionsCount: count });
      }
      return fullSubmission;
    } else {
      const list = JSON.parse(localStorage.getItem('sms_submissions') || '[]') as Submission[];
      list.push(fullSubmission);
      localStorage.setItem('sms_submissions', JSON.stringify(list));

      // Increment assignment count
      const assignments = await this.getAssignments();
      const idx = assignments.findIndex(a => a.id === submission.assignmentId);
      if (idx !== -1) {
        assignments[idx].submissionsCount = (assignments[idx].submissionsCount || 0) + 1;
        localStorage.setItem('sms_assignments', JSON.stringify(assignments));
      }

      return fullSubmission;
    }
  },

  async gradeSubmission(submissionId: string, grade: string, remarks: string): Promise<Submission> {
    if (isConfigured) {
      const ref = doc(fireDb, 'submissions', submissionId);
      await updateDoc(ref, { grade, remarks, status: 'graded' });
      const snap = await getDoc(ref);
      return { id: submissionId, ...snap.data() } as Submission;
    } else {
      const list = JSON.parse(localStorage.getItem('sms_submissions') || '[]') as Submission[];
      const idx = list.findIndex(s => s.id === submissionId);
      if (idx !== -1) {
        list[idx].grade = grade;
        list[idx].remarks = remarks;
        list[idx].status = 'graded';
        localStorage.setItem('sms_submissions', JSON.stringify(list));
        return list[idx];
      }
      throw new Error("Submission not found.");
    }
  },

  // ----------------------------------------
  // TIMETABLE SERVICES
  // ----------------------------------------
  async getTimetable(classId?: string): Promise<TimetablePeriod[]> {
    if (isConfigured) {
      let snap;
      if (classId) {
        const q = query(collection(fireDb, 'timetable'), where('classId', '==', classId));
        snap = await getDocs(q);
      } else {
        snap = await getDocs(collection(fireDb, 'timetable'));
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as TimetablePeriod));
    } else {
      const list = JSON.parse(localStorage.getItem('sms_timetable') || '[]') as TimetablePeriod[];
      if (classId) {
        return list.filter(t => t.classId === classId);
      }
      return list;
    }
  },

  async saveTimetablePeriod(period: Omit<TimetablePeriod, 'id'> & { id?: string }): Promise<TimetablePeriod> {
    const id = period.id || 'period-' + Math.random().toString(36).substr(2, 9);
    const fullPeriod = { id, ...period };
    if (isConfigured) {
      await setDoc(doc(fireDb, 'timetable', id), fullPeriod);
      return fullPeriod;
    } else {
      const list = await this.getTimetable();
      const idx = list.findIndex(p => p.id === id);
      if (idx !== -1) {
        list[idx] = fullPeriod;
      } else {
        list.push(fullPeriod);
      }
      localStorage.setItem('sms_timetable', JSON.stringify(list));
      return fullPeriod;
    }
  },

  async deleteTimetablePeriod(id: string): Promise<void> {
    if (isConfigured) {
      await deleteDoc(doc(fireDb, 'timetable', id));
    } else {
      const list = await this.getTimetable();
      const filtered = list.filter(p => p.id !== id);
      localStorage.setItem('sms_timetable', JSON.stringify(filtered));
    }
  },

  // ----------------------------------------
  // FEE MANAGEMENT
  // ----------------------------------------
  async getFees(studentId?: string): Promise<FeeTransaction[]> {
    if (isConfigured) {
      let snap;
      if (studentId) {
        const q = query(collection(fireDb, 'fees'), where('studentId', '==', studentId));
        snap = await getDocs(q);
      } else {
        snap = await getDocs(collection(fireDb, 'fees'));
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as FeeTransaction));
    } else {
      const list = JSON.parse(localStorage.getItem('sms_fees') || '[]') as FeeTransaction[];
      if (studentId) {
        return list.filter(f => f.studentId === studentId);
      }
      return list;
    }
  },

  async createFee(fee: Omit<FeeTransaction, 'id' | 'invoiceNo'>): Promise<FeeTransaction> {
    const id = 'fee-' + Math.random().toString(36).substr(2, 9);
    const invoiceNo = 'INV-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);
    const fullFee = { id, invoiceNo, ...fee };
    
    if (isConfigured) {
      await setDoc(doc(fireDb, 'fees', id), fullFee);
      return fullFee;
    } else {
      const list = await this.getFees();
      list.unshift(fullFee);
      localStorage.setItem('sms_fees', JSON.stringify(list));

      // Update student table's feeStatus if applicable
      if (fee.status !== 'paid') {
        const students = await this.getStudents();
        const sIdx = students.findIndex(s => s.id === fee.studentId);
        if (sIdx !== -1) {
          students[sIdx].feeStatus = fee.status;
          localStorage.setItem('sms_students', JSON.stringify(students));
        }
      }

      return fullFee;
    }
  },

  async payFee(feeId: string, paymentMethod: string): Promise<FeeTransaction> {
    const allFees = await this.getFees();
    const targetFee = allFees.find(f => f.id === feeId);
    if (targetFee) {
      await this.addNotification({
        title: 'Fee Invoice Paid',
        content: `${targetFee.studentName} paid Tuition Fee invoice ${targetFee.invoiceNo} of NRs. ${targetFee.amount}.`,
        type: 'fee',
        role: 'admin'
      });
    }

    if (isConfigured) {
      const ref = doc(fireDb, 'fees', feeId);
      await updateDoc(ref, { 
        status: 'paid', 
        paymentDate: new Date().toISOString().split('T')[0],
        paymentMethod
      });
      const snap = await getDoc(ref);
      return { id: feeId, ...snap.data() } as FeeTransaction;
    } else {
      const list = await this.getFees();
      const idx = list.findIndex(f => f.id === feeId);
      if (idx !== -1) {
        list[idx].status = 'paid';
        list[idx].paymentDate = new Date().toISOString().split('T')[0];
        list[idx].paymentMethod = paymentMethod;
        localStorage.setItem('sms_fees', JSON.stringify(list));

        // Sync student's overall feeStatus
        const studentId = list[idx].studentId;
        // check if student has other pending/unpaid fees
        const studentPending = list.some(f => f.studentId === studentId && f.status !== 'paid' && f.id !== feeId);
        
        const students = await this.getStudents();
        const sIdx = students.findIndex(s => s.id === studentId);
        if (sIdx !== -1) {
          students[sIdx].feeStatus = studentPending ? 'pending' : 'paid';
          localStorage.setItem('sms_students', JSON.stringify(students));
        }

        return list[idx];
      }
      throw new Error("Invoice not found.");
    }
  },

  // ----------------------------------------
  // EXAM MARKS / RESULT MANAGEMENT
  // ----------------------------------------
  async getResults(studentId?: string, classId?: string): Promise<ExamResult[]> {
    if (isConfigured) {
      let snap;
      if (studentId) {
        const q = query(collection(fireDb, 'results'), where('studentId', '==', studentId));
        snap = await getDocs(q);
      } else if (classId) {
        const q = query(collection(fireDb, 'results'), where('classId', '==', classId));
        snap = await getDocs(q);
      } else {
        snap = await getDocs(collection(fireDb, 'results'));
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as ExamResult));
    } else {
      const list = JSON.parse(localStorage.getItem('sms_results') || '[]') as ExamResult[];
      if (studentId) return list.filter(r => r.studentId === studentId);
      if (classId) return list.filter(r => r.classId === classId);
      return list;
    }
  },

  async addResult(result: Omit<ExamResult, 'id'>): Promise<ExamResult> {
    const id = 'res-' + Math.random().toString(36).substr(2, 9);
    const fullResult = { id, ...result };
    if (isConfigured) {
      await setDoc(doc(fireDb, 'results', id), fullResult);
      return fullResult;
    } else {
      const list = await this.getResults();
      list.push(fullResult);
      localStorage.setItem('sms_results', JSON.stringify(list));
      return fullResult;
    }
  },

  async updateResult(id: string, updated: Partial<ExamResult>): Promise<ExamResult> {
    if (isConfigured) {
      await updateDoc(doc(fireDb, 'results', id), updated);
      const snap = await getDoc(doc(fireDb, 'results', id));
      return { id, ...snap.data() } as ExamResult;
    } else {
      const list = await this.getResults();
      const idx = list.findIndex(r => r.id === id);
      if (idx !== -1) {
        list[idx] = { ...list[idx], ...updated };
        localStorage.setItem('sms_results', JSON.stringify(list));
        return list[idx];
      }
      throw new Error("Result record not found.");
    }
  },

  async deleteResult(id: string): Promise<void> {
    if (isConfigured) {
      await deleteDoc(doc(fireDb, 'results', id));
    } else {
      const list = await this.getResults();
      const filtered = list.filter(r => r.id !== id);
      localStorage.setItem('sms_results', JSON.stringify(filtered));
    }
  },

  // ----------------------------------------
  // LIBRARY & BOOK LOAN MANAGEMENT
  // ----------------------------------------
  async getBooks(): Promise<Book[]> {
    if (isConfigured) {
      const snap = await getDocs(collection(fireDb, 'books'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as Book));
    } else {
      return JSON.parse(localStorage.getItem('sms_books') || '[]') as Book[];
    }
  },

  async addBook(book: Omit<Book, 'id'>): Promise<Book> {
    const id = 'book-' + Math.random().toString(36).substr(2, 9);
    const newBook = { id, ...book };
    if (isConfigured) {
      await setDoc(doc(fireDb, 'books', id), newBook);
      return newBook;
    } else {
      const books = await this.getBooks();
      books.push(newBook);
      localStorage.setItem('sms_books', JSON.stringify(books));
      return newBook;
    }
  },

  async updateBook(id: string, updated: Partial<Book>): Promise<Book> {
    if (isConfigured) {
      await updateDoc(doc(fireDb, 'books', id), updated);
      const snap = await getDoc(doc(fireDb, 'books', id));
      return { id, ...snap.data() } as Book;
    } else {
      const books = await this.getBooks();
      const idx = books.findIndex(b => b.id === id);
      if (idx !== -1) {
        books[idx] = { ...books[idx], ...updated };
        localStorage.setItem('sms_books', JSON.stringify(books));
        return books[idx];
      }
      throw new Error("Book not found.");
    }
  },

  async deleteBook(id: string): Promise<void> {
    if (isConfigured) {
      await deleteDoc(doc(fireDb, 'books', id));
    } else {
      const books = await this.getBooks();
      const filtered = books.filter(b => b.id !== id);
      localStorage.setItem('sms_books', JSON.stringify(filtered));
    }
  },

  async getLoans(studentId?: string): Promise<BookLoan[]> {
    if (isConfigured) {
      let snap;
      if (studentId) {
        const q = query(collection(fireDb, 'loans'), where('studentId', '==', studentId));
        snap = await getDocs(q);
      } else {
        snap = await getDocs(collection(fireDb, 'loans'));
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as BookLoan));
    } else {
      const loans = JSON.parse(localStorage.getItem('sms_loans') || '[]') as BookLoan[];
      if (studentId) return loans.filter(l => l.studentId === studentId);
      return loans;
    }
  },

  async borrowBook(
    bookId: string, 
    studentId: string, 
    studentName: string, 
    studentRollNo: string, 
    classId: string, 
    dueDate: string
  ): Promise<BookLoan> {
    const books = await this.getBooks();
    const book = books.find(b => b.id === bookId);
    if (!book) throw new Error("Book not found");
    if (book.available <= 0) throw new Error("No copies available for borrowing");

    // Decrease available stock by 1
    await this.updateBook(bookId, { available: book.available - 1 });

    const today = new Date().toISOString().split('T')[0];
    const loanId = 'loan-' + Math.random().toString(36).substr(2, 9);
    const newLoan: BookLoan = {
      id: loanId,
      bookId,
      bookTitle: book.title,
      bookAuthor: book.author,
      studentId,
      studentName,
      studentRollNo,
      classId,
      borrowDate: today,
      dueDate,
      status: 'borrowed'
    };

    if (isConfigured) {
      await setDoc(doc(fireDb, 'loans', loanId), newLoan);
      return newLoan;
    } else {
      const loans = await this.getLoans();
      loans.push(newLoan);
      localStorage.setItem('sms_loans', JSON.stringify(loans));
      return newLoan;
    }
  },

  async returnBook(loanId: string): Promise<BookLoan> {
    const loans = await this.getLoans();
    const loan = loans.find(l => l.id === loanId);
    if (!loan) throw new Error("Loan record not found");

    const today = new Date().toISOString().split('T')[0];
    const updatedLoan: Partial<BookLoan> = {
      returnDate: today,
      status: 'returned'
    };

    // Increase available book count by 1
    const books = await this.getBooks();
    const book = books.find(b => b.id === loan.bookId);
    if (book) {
      await this.updateBook(book.id, { available: Math.min(book.quantity, book.available + 1) });
    }

    if (isConfigured) {
      await updateDoc(doc(fireDb, 'loans', loanId), updatedLoan);
      return { ...loan, ...updatedLoan } as BookLoan;
    } else {
      const idx = loans.findIndex(l => l.id === loanId);
      loans[idx] = { ...loans[idx], ...updatedLoan };
      localStorage.setItem('sms_loans', JSON.stringify(loans));
      return loans[idx];
    }
  }
};
