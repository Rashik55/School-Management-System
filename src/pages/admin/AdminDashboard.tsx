import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/dbService';
import { Student, Teacher, FeeTransaction, AttendanceRecord, ExamResult, UserProfile, NEPAL_SUBJECT_CATEGORIES, ALL_NEPAL_SUBJECTS, CLASS_SUBJECTS_MAP } from '../../types';
import { NoticeBoard } from '../../components/NoticeBoard';
import { TimetableGrid } from '../../components/TimetableGrid';
import { ProfileSettings } from '../../components/ProfileSettings';
import { LibraryView } from '../../components/LibraryView';
import { 
  Users, GraduationCap, ClipboardList, DollarSign, Award, Plus, Trash2, Edit3, 
  Search, Filter, CheckCircle, AlertTriangle, XCircle, FileText, ChevronRight, BookOpen
} from 'lucide-react';
import { Modal } from '../../components/Modal';

interface AdminDashboardProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  activeTab: string;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({ user, onUpdateUser, activeTab }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [fees, setFees] = useState<FeeTransaction[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filtering States
  const [studentSearch, setStudentSearch] = useState('');
  const [studentClassFilter, setStudentClassFilter] = useState('All');
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherSubjectFilter, setTeacherSubjectFilter] = useState('All');
  const [feeStatusFilter, setFeeStatusFilter] = useState('All');

  // Modals state
  const [isStudentModalOpen, setIsStudentModalOpen] = useState(false);
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  
  const [isTeacherModalOpen, setIsTeacherModalOpen] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<Teacher | null>(null);

  const [isFeeModalOpen, setIsFeeModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  // Student Form State
  const [studentName, setStudentName] = useState('');
  const [studentEmail, setStudentEmail] = useState('');
  const [studentRoll, setStudentRoll] = useState('');
  const [studentClass, setStudentClass] = useState('Class 10');
  const [parentName, setParentName] = useState('');
  const [parentContact, setParentContact] = useState('');
  const [studentAddress, setStudentAddress] = useState('');
  const [studentGender, setStudentGender] = useState('Male');
  const [studentFeeStatus, setStudentFeeStatus] = useState<'paid' | 'unpaid' | 'pending'>('pending');

  // Teacher Form State
  const [teacherName, setTeacherName] = useState('');
  const [teacherEmail, setTeacherEmail] = useState('');
  const [teacherEmpId, setTeacherEmpId] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('Mathematics');
  const [classTeacherOf, setClassTeacherOf] = useState('');
  const [teacherContact, setTeacherContact] = useState('');
  const [teacherGender, setTeacherGender] = useState('Female');

  // Fee Form State
  const [feeStudentId, setFeeStudentId] = useState('');
  const [feeAmount, setFeeAmount] = useState(1500);
  const [feeCategory, setFeeCategory] = useState<'Tuition Fee' | 'Exam Fee' | 'Library Fee' | 'Sports Fee' | 'Other'>('Tuition Fee');
  const [feeDueDate, setFeeDueDate] = useState('2026-08-31');

  // Result Form State
  const [resStudentId, setResStudentId] = useState('');
  const [resSubject, setResSubject] = useState('Mathematics');
  const [resExamName, setResExamName] = useState('Midterm Exam');
  const [resObtained, setResObtained] = useState(85);
  const [resMax, setResMax] = useState(100);
  const [resRemarks, setResRemarks] = useState('Excellent performance.');

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [sData, tData, fData, rData] = await Promise.all([
        dbService.getStudents(),
        dbService.getTeachers(),
        dbService.getFees(),
        dbService.getResults()
      ]);
      setStudents(sData);
      setTeachers(tData);
      setFees(fData);
      setResults(rData);

      // set default drop downs
      if (sData.length > 0) {
        setFeeStudentId(sData[0].id);
        setResStudentId(sData[0].id);
      }
    } catch (err) {
      console.error("Error fetching initial admin data:", err);
    } finally {
      setLoading(false);
    }
  };

  // ----------------------------------------
  // STUDENTS CRUD HANDLERS
  // ----------------------------------------
  const handleOpenAddStudent = () => {
    setEditingStudent(null);
    setStudentName('');
    setStudentEmail('');
    setStudentRoll('S-' + Math.floor(100 + Math.random() * 900));
    setStudentClass('Class 10');
    setParentName('');
    setParentContact('');
    setStudentAddress('');
    setStudentGender('Male');
    setStudentFeeStatus('pending');
    setIsStudentModalOpen(true);
  };

  const handleOpenEditStudent = (student: Student) => {
    setEditingStudent(student);
    setStudentName(student.name);
    setStudentEmail(student.email);
    setStudentRoll(student.rollNo);
    setStudentClass(student.classId);
    setParentName(student.parentName);
    setParentContact(student.parentContact);
    setStudentAddress(student.address);
    setStudentGender(student.gender);
    setStudentFeeStatus(student.feeStatus);
    setIsStudentModalOpen(true);
  };

  const handleSaveStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim() || !studentEmail.trim() || !studentRoll.trim()) return;

    try {
      if (editingStudent) {
        // Edit mode
        const updated = await dbService.updateStudent(editingStudent.id, {
          name: studentName,
          email: studentEmail,
          rollNo: studentRoll,
          classId: studentClass,
          parentName,
          parentContact,
          address: studentAddress,
          gender: studentGender,
          feeStatus: studentFeeStatus
        });
        setStudents(prev => prev.map(s => s.id === editingStudent.id ? updated : s));
      } else {
        // Add mode
        const added = await dbService.addStudent({
          name: studentName,
          email: studentEmail,
          rollNo: studentRoll,
          classId: studentClass,
          parentName,
          parentContact,
          address: studentAddress,
          admissionDate: new Date().toISOString().split('T')[0],
          gender: studentGender,
          feeStatus: studentFeeStatus
        });
        setStudents(prev => [...prev, added]);
      }
      setIsStudentModalOpen(false);
    } catch (err) {
      console.error("Error saving student:", err);
      alert("Failed to save student record.");
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this student and their login credentials?")) {
      try {
        await dbService.deleteStudent(id);
        setStudents(prev => prev.filter(s => s.id !== id));
      } catch (err) {
        console.error("Error deleting student:", err);
      }
    }
  };

  // ----------------------------------------
  // TEACHERS CRUD HANDLERS
  // ----------------------------------------
  const handleOpenAddTeacher = () => {
    setEditingTeacher(null);
    setTeacherName('');
    setTeacherEmail('');
    setTeacherEmpId('T-' + Math.floor(100 + Math.random() * 900));
    setTeacherSubject('Mathematics');
    setClassTeacherOf('');
    setTeacherContact('');
    setTeacherGender('Female');
    setIsTeacherModalOpen(true);
  };

  const handleOpenEditTeacher = (teacher: Teacher) => {
    setEditingTeacher(teacher);
    setTeacherName(teacher.name);
    setTeacherEmail(teacher.email);
    setTeacherEmpId(teacher.employeeId);
    setTeacherSubject(teacher.subject);
    setClassTeacherOf(teacher.classTeacherOf || '');
    setTeacherContact(teacher.contact);
    setTeacherGender(teacher.gender);
    setIsTeacherModalOpen(true);
  };

  const handleSaveTeacher = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!teacherName.trim() || !teacherEmail.trim() || !teacherEmpId.trim()) return;

    try {
      if (editingTeacher) {
        // Edit mode
        const updated = await dbService.updateTeacher(editingTeacher.id, {
          name: teacherName,
          email: teacherEmail,
          employeeId: teacherEmpId,
          subject: teacherSubject,
          classTeacherOf: classTeacherOf || undefined,
          contact: teacherContact,
          gender: teacherGender
        });
        setTeachers(prev => prev.map(t => t.id === editingTeacher.id ? updated : t));
      } else {
        // Add mode
        const added = await dbService.addTeacher({
          name: teacherName,
          email: teacherEmail,
          employeeId: teacherEmpId,
          subject: teacherSubject,
          classTeacherOf: classTeacherOf || undefined,
          contact: teacherContact,
          joinDate: new Date().toISOString().split('T')[0],
          gender: teacherGender
        });
        setTeachers(prev => [...prev, added]);
      }
      setIsTeacherModalOpen(false);
    } catch (err) {
      console.error("Error saving teacher:", err);
      alert("Failed to save teacher record.");
    }
  };

  const handleDeleteTeacher = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this teacher and their login credentials?")) {
      try {
        await dbService.deleteTeacher(id);
        setTeachers(prev => prev.filter(t => t.id !== id));
      } catch (err) {
        console.error("Error deleting teacher:", err);
      }
    }
  };

  // ----------------------------------------
  // FEES INVOICE CREATION HANDLERS
  // ----------------------------------------
  const handleCreateFeeInvoice = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = students.find(s => s.id === feeStudentId);
    if (!targetStudent) return;

    try {
      const added = await dbService.createFee({
        studentId: feeStudentId,
        studentName: targetStudent.name,
        rollNo: targetStudent.rollNo,
        classId: targetStudent.classId,
        amount: feeAmount,
        category: feeCategory,
        dueDate: feeDueDate,
        status: 'pending'
      });
      setFees(prev => [added, ...prev]);
      setIsFeeModalOpen(false);
      // Sync student table too
      setStudents(prev => prev.map(s => s.id === feeStudentId ? { ...s, feeStatus: 'pending' } : s));
    } catch (err) {
      console.error("Failed to generate invoice:", err);
    }
  };

  // ----------------------------------------
  // RESULT CREATION HANDLERS
  // ----------------------------------------
  const handleAddExamResult = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = students.find(s => s.id === resStudentId);
    if (!targetStudent) return;

    // determine simple letter grade
    const pct = (resObtained / resMax) * 100;
    let grade = 'F';
    if (pct >= 90) grade = 'A+';
    else if (pct >= 80) grade = 'A';
    else if (pct >= 70) grade = 'B';
    else if (pct >= 60) grade = 'C';
    else if (pct >= 50) grade = 'D';

    try {
      const added = await dbService.addResult({
        studentId: resStudentId,
        studentName: targetStudent.name,
        rollNo: targetStudent.rollNo,
        classId: targetStudent.classId,
        subject: resSubject,
        examName: resExamName,
        marksObtained: Number(resObtained),
        maxMarks: Number(resMax),
        grade,
        remarks: resRemarks,
        date: new Date().toISOString().split('T')[0]
      });
      setResults(prev => [...prev, added]);
      setIsResultModalOpen(false);
    } catch (err) {
      console.error("Failed to add results:", err);
    }
  };

  // Filter lists
  const filteredStudents = students.filter(s => {
    const matchesSearch = s.name.toLowerCase().includes(studentSearch.toLowerCase()) || 
                          s.rollNo.toLowerCase().includes(studentSearch.toLowerCase());
    const matchesClass = studentClassFilter === 'All' || s.classId === studentClassFilter;
    return matchesSearch && matchesClass;
  });

  const filteredTeachers = teachers.filter(t => {
    const matchesSearch = t.name.toLowerCase().includes(teacherSearch.toLowerCase()) || 
                          t.employeeId.toLowerCase().includes(teacherSearch.toLowerCase());
    const matchesSubject = teacherSubjectFilter === 'All' || t.subject === teacherSubjectFilter;
    return matchesSearch && matchesSubject;
  });

  const filteredFees = fees.filter(f => {
    const matchesStatus = feeStatusFilter === 'All' || f.status === feeStatusFilter.toLowerCase();
    return matchesStatus;
  });

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      
      {/* 1. OVERVIEW HUB */}
      {activeTab === 'dashboard' && (
        <>
          {/* Metrics Panel */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow duration-300">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Total Students</span>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none">{students.length}</p>
                <span className="text-[10px] text-indigo-500 font-semibold block">Actively Enrolled</span>
              </div>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl shrink-0">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow duration-300">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Faculty Members</span>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none">{teachers.length}</p>
                <span className="text-[10px] text-emerald-500 font-semibold block">Subject Instructors</span>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow duration-300">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Pending Invoices</span>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none">
                  {fees.filter(f => f.status === 'pending' || f.status === 'unpaid').length}
                </p>
                <span className="text-[10px] text-amber-500 font-semibold block">Awaiting Payments</span>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl shrink-0">
                <DollarSign className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md transition-shadow duration-300">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Average Grades</span>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none">A</p>
                <span className="text-[10px] text-rose-500 font-semibold block">School Standards</span>
              </div>
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl shrink-0">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Graphical Representation (SVG) & Notice board split */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            <div className="lg:col-span-7 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs">
              <h4 className="font-semibold text-gray-900 dark:text-white mb-1.5 text-base flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-500" /> Academic Statistics
              </h4>
              <p className="text-xs text-gray-400 dark:text-gray-500 mb-6">Distribution ratios of students by Class grade and Fee collection statuses.</p>
              
              {/* Custom SVG Distribution Chart */}
              <div className="h-64 flex flex-col justify-between">
                <div className="flex items-end justify-around h-48 border-b border-gray-100 dark:border-gray-800/80 pb-3">
                  {/* Class 10 */}
                  <div className="flex flex-col items-center w-16 group">
                    <div className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {students.filter(s => s.classId === 'Class 10').length}
                    </div>
                    <div 
                      style={{ height: `${Math.max(15, (students.filter(s => s.classId === 'Class 10').length / (students.length || 1)) * 140)}px` }}
                      className="w-10 bg-indigo-600 dark:bg-indigo-500 hover:bg-indigo-700 rounded-t-lg transition-all duration-500 shadow-md shadow-indigo-600/10"
                    ></div>
                    <span className="text-[10px] font-semibold text-gray-500 mt-2">Class 10</span>
                  </div>

                  {/* Class 11 */}
                  <div className="flex flex-col items-center w-16 group">
                    <div className="text-[10px] font-bold text-teal-600 dark:text-teal-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {students.filter(s => s.classId === 'Class 11').length}
                    </div>
                    <div 
                      style={{ height: `${Math.max(15, (students.filter(s => s.classId === 'Class 11').length / (students.length || 1)) * 140)}px` }}
                      className="w-10 bg-teal-600 dark:bg-teal-500 hover:bg-teal-700 rounded-t-lg transition-all duration-500 shadow-md shadow-teal-600/10"
                    ></div>
                    <span className="text-[10px] font-semibold text-gray-500 mt-2">Class 11</span>
                  </div>

                  {/* Class 12 */}
                  <div className="flex flex-col items-center w-16 group">
                    <div className="text-[10px] font-bold text-purple-600 dark:text-purple-400 opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                      {students.filter(s => s.classId === 'Class 12').length}
                    </div>
                    <div 
                      style={{ height: `${Math.max(15, (students.filter(s => s.classId === 'Class 12').length / (students.length || 1)) * 140)}px` }}
                      className="w-10 bg-purple-600 dark:bg-purple-500 hover:bg-purple-700 rounded-t-lg transition-all duration-500 shadow-md shadow-purple-600/10"
                    ></div>
                    <span className="text-[10px] font-semibold text-gray-500 mt-2">Class 12</span>
                  </div>
                </div>

                <div className="flex items-center justify-around text-xs text-gray-400 dark:text-gray-500 mt-1 font-medium">
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-indigo-600 rounded-xs inline-block"></span> Class 10</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-teal-600 rounded-xs inline-block"></span> Class 11</span>
                  <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 bg-purple-600 rounded-xs inline-block"></span> Class 12</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-6">
              <NoticeBoard userRole="admin" authorName={user.name} />
            </div>
          </div>
        </>
      )}

      {/* 2. STUDENTS TAB */}
      {activeTab === 'students' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Student Directory</h3>
            <button
              onClick={handleOpenAddStudent}
              className="flex items-center gap-1.5 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-xs shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4.5 h-4.5" /> Enrol Student
            </button>
          </div>

          {/* Filters Row */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 dark:text-gray-500">
                <Search className="w-4.5 h-4.5" />
              </span>
              <input
                type="text"
                placeholder="Search students by name or roll number..."
                value={studentSearch}
                onChange={e => setStudentSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-hidden text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={studentClassFilter}
                onChange={e => setStudentClassFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-950 dark:text-white text-sm font-semibold"
              >
                <option value="All">All Grades</option>
                <option value="Class 1">Class 1</option>
                <option value="Class 2">Class 2</option>
                <option value="Class 3">Class 3</option>
                <option value="Class 4">Class 4</option>
                <option value="Class 5">Class 5</option>
                <option value="Class 6">Class 6</option>
                <option value="Class 7">Class 7</option>
                <option value="Class 8">Class 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
            </div>
          </div>

          {/* Grid/Table Layout */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-150 dark:border-gray-800/80 bg-gray-50/30 dark:bg-slate-850/10">
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Roll No</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Student Name</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Class</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Contact / Email</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Fee Status</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {filteredStudents.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                      No student listings found matching searches.
                    </td>
                  </tr>
                ) : (
                  filteredStudents.map(student => (
                    <tr key={student.id} className="hover:bg-gray-50/40 dark:hover:bg-slate-850/10">
                      <td className="py-4 px-4 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {student.rollNo}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-900 dark:text-white">{student.name}</div>
                        <div className="text-xs text-gray-400">Parent: {student.parentName}</div>
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {student.classId}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <div className="text-gray-700 dark:text-gray-300">{student.email}</div>
                        <div className="text-xs text-gray-400">{student.parentContact}</div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          student.feeStatus === 'paid' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 border border-emerald-100/50' 
                            : student.feeStatus === 'pending'
                            ? 'bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 border border-amber-100/50'
                            : 'bg-rose-50 dark:bg-rose-950/20 text-rose-700 dark:text-rose-400 border border-rose-100/50'
                        }`}>
                          {student.feeStatus.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditStudent(student)}
                          className="p-1.5 rounded-lg border border-gray-150 dark:border-gray-800 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors inline-flex"
                          title="Edit Student Info"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteStudent(student.id)}
                          className="p-1.5 rounded-lg border border-gray-150 dark:border-gray-800 text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors inline-flex"
                          title="Delete Student"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 3. TEACHERS TAB */}
      {activeTab === 'teachers' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">Faculty Directory</h3>
            <button
              onClick={handleOpenAddTeacher}
              className="flex items-center gap-1.5 px-4.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-xs shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4.5 h-4.5" /> Hire Instructor
            </button>
          </div>

          {/* Filters */}
          <div className="flex flex-col sm:flex-row gap-3 mb-6">
            <div className="relative flex-1">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 dark:text-gray-500">
                <Search className="w-4.5 h-4.5" />
              </span>
              <input
                type="text"
                placeholder="Search teachers by name or Employee ID..."
                value={teacherSearch}
                onChange={e => setTeacherSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-hidden text-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-gray-400" />
              <select
                value={teacherSubjectFilter}
                onChange={e => setTeacherSubjectFilter(e.target.value)}
                className="px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-950 dark:text-white text-sm font-semibold"
              >
                <option value="All">All Subjects</option>
                {ALL_NEPAL_SUBJECTS.map(sub => (
                  <option key={sub} value={sub}>{sub}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-gray-150 dark:border-gray-800/80 bg-gray-50/30 dark:bg-slate-850/10">
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Emp ID</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Teacher Name</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Subject</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Class Teacher Of</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500">Contact / Email</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {filteredTeachers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400 text-sm">
                      No teacher listings found.
                    </td>
                  </tr>
                ) : (
                  filteredTeachers.map(teacher => (
                    <tr key={teacher.id} className="hover:bg-gray-50/40 dark:hover:bg-slate-850/10">
                      <td className="py-4 px-4 font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400">
                        {teacher.employeeId}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-900 dark:text-white">{teacher.name}</div>
                        <div className="text-xs text-gray-400">Joined: {teacher.joinDate}</div>
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {teacher.subject}
                      </td>
                      <td className="py-4 px-4 text-sm font-medium text-gray-600 dark:text-gray-400">
                        {teacher.classTeacherOf || 'N/A'}
                      </td>
                      <td className="py-4 px-4 text-sm">
                        <div className="text-gray-700 dark:text-gray-300">{teacher.email}</div>
                        <div className="text-xs text-gray-400">{teacher.contact}</div>
                      </td>
                      <td className="py-4 px-4 text-right space-x-2">
                        <button
                          onClick={() => handleOpenEditTeacher(teacher)}
                          className="p-1.5 rounded-lg border border-gray-150 dark:border-gray-800 text-gray-500 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-800 transition-colors inline-flex"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTeacher(teacher.id)}
                          className="p-1.5 rounded-lg border border-gray-150 dark:border-gray-800 text-gray-500 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-slate-800 transition-colors inline-flex"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4. ATTENDANCE TAB */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Attendance Summary</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Overall school attendance records</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {['Class 10', 'Class 11', 'Class 12'].map(cls => (
              <div key={cls} className="p-5 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/30 dark:bg-slate-850/15">
                <span className="text-xs font-semibold text-indigo-600 uppercase block mb-1.5">{cls}</span>
                <h4 className="text-xl font-bold text-gray-900 dark:text-white">96% Average Attendance</h4>
                <div className="w-full h-2 bg-gray-100 dark:bg-slate-800 rounded-full mt-3 overflow-hidden">
                  <div className="w-[96%] h-full bg-indigo-600 rounded-full"></div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-gray-400 mt-2 font-semibold">
                  <span>96% PRESENT</span>
                  <span>4% ABSENT</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 5. FEES INVOICING */}
      {activeTab === 'fees' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Fee Invoices Portal</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Generate and review student invoices</p>
            </div>

            <button
              onClick={() => setIsFeeModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-xs shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4.5 h-4.5" /> Generate Invoice
            </button>
          </div>

          {/* Filters */}
          <div className="flex items-center gap-2 mb-6">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Filter Status:</span>
            <select
              value={feeStatusFilter}
              onChange={e => setFeeStatusFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-900 dark:text-white text-xs font-semibold"
            >
              <option value="All">All Invoices</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Unpaid">Unpaid</option>
            </select>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-150 dark:border-gray-800/80 bg-gray-50/30 dark:bg-slate-850/10">
                  <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Invoice No</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Student Name</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Class</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Category</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Amount</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Due Date</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {filteredFees.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-450 dark:text-gray-600 text-sm">
                      No invoices found.
                    </td>
                  </tr>
                ) : (
                  filteredFees.map(fee => (
                    <tr key={fee.id} className="hover:bg-gray-50/40 dark:hover:bg-slate-850/10 text-xs md:text-sm">
                      <td className="py-4 px-4 font-mono font-semibold text-gray-750 dark:text-gray-300">
                        {fee.invoiceNo}
                      </td>
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-900 dark:text-white">{fee.studentName}</div>
                        <div className="text-[10px] text-gray-400">Roll: {fee.rollNo}</div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-600 dark:text-gray-400">{fee.classId}</td>
                      <td className="py-4 px-4 font-medium text-gray-700 dark:text-gray-300">{fee.category}</td>
                      <td className="py-4 px-4 font-extrabold text-gray-900 dark:text-white">NRs. {fee.amount}</td>
                      <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{fee.dueDate}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          fee.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : fee.status === 'pending'
                            ? 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                            : 'bg-rose-50 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400'
                        }`}>
                          {fee.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6. RESULTS / EXAM MARKS */}
      {activeTab === 'results' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Exam Results Hub</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Record and review global marks</p>
            </div>

            <button
              onClick={() => setIsResultModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-xs shrink-0 self-start sm:self-auto"
            >
              <Plus className="w-4.5 h-4.5" /> Log Exam Grade
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-150 dark:border-gray-800/80 bg-gray-50/30 dark:bg-slate-850/10">
                  <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Student Name</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Class</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Subject</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Exam Title</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Marks (Obt/Max)</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Grade</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-gray-400 text-sm">
                      No results logged currently.
                    </td>
                  </tr>
                ) : (
                  results.map(res => (
                    <tr key={res.id} className="hover:bg-gray-50/40 dark:hover:bg-slate-850/10 text-xs md:text-sm">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-gray-900 dark:text-white">{res.studentName}</div>
                        <div className="text-[10px] text-gray-405">Roll: {res.rollNo}</div>
                      </td>
                      <td className="py-4 px-4 font-semibold text-gray-600 dark:text-gray-400">{res.classId}</td>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300 font-medium">{res.subject}</td>
                      <td className="py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">{res.examName}</td>
                      <td className="py-4 px-4 text-gray-800 dark:text-gray-200">
                        <strong className="font-bold text-gray-950 dark:text-white">{res.marksObtained}</strong> / {res.maxMarks}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs rounded-sm">
                          {res.grade}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-500 dark:text-gray-400 max-w-[200px] truncate">{res.remarks}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 6.5. LIBRARY MODULE */}
      {activeTab === 'library' && (
        <LibraryView user={user} />
      )}

      {/* 7. REUSABLE CONFIG DETAILS */}
      {activeTab === 'timetable' && (
        <TimetableGrid userRole="admin" />
      )}

      {activeTab === 'notices' && (
        <NoticeBoard userRole="admin" authorName={user.name} />
      )}

      {activeTab === 'settings' && (
        <ProfileSettings user={user} onUpdate={onUpdateUser} />
      )}

      {/* ==========================================
          MODALS ZONE
          ========================================== */}
      
      {/* A. STUDENT CRUD MODAL */}
      <Modal
        isOpen={isStudentModalOpen}
        onClose={() => setIsStudentModalOpen(false)}
        title={editingStudent ? `Edit Student: ${editingStudent.name}` : "Enrol New Student"}
      >
        <form onSubmit={handleSaveStudent} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Student Name</label>
              <input
                type="text" required placeholder="e.g., Krishna Gurung"
                value={studentName} onChange={e => setStudentName(e.target.value)}
                className="w-full px-4.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Login Email</label>
              <input
                type="email" required placeholder="e.g., student@school.com"
                value={studentEmail} onChange={e => setStudentEmail(e.target.value)}
                className="w-full px-4.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Roll Number</label>
              <input
                type="text" required placeholder="S-502"
                value={studentRoll} onChange={e => setStudentRoll(e.target.value)}
                className="w-full px-4.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Class</label>
              <select
                value={studentClass} onChange={e => setStudentClass(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm"
              >
                <option value="Class 1">Class 1</option>
                <option value="Class 2">Class 2</option>
                <option value="Class 3">Class 3</option>
                <option value="Class 4">Class 4</option>
                <option value="Class 5">Class 5</option>
                <option value="Class 6">Class 6</option>
                <option value="Class 7">Class 7</option>
                <option value="Class 8">Class 8</option>
                <option value="Class 9">Class 9</option>
                <option value="Class 10">Class 10</option>
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Gender</label>
              <select
                value={studentGender} onChange={e => setStudentGender(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Parent Name</label>
              <input
                type="text" required placeholder="e.g., Lal Bahadur Gurung"
                value={parentName} onChange={e => setParentName(e.target.value)}
                className="w-full px-4.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Parent Contact</label>
              <input
                type="text" required placeholder="+977 9801234567"
                value={parentContact} onChange={e => setParentContact(e.target.value)}
                className="w-full px-4.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Residential Address</label>
            <input
              type="text" required placeholder="Street, City, State..."
              value={studentAddress} onChange={e => setStudentAddress(e.target.value)}
              className="w-full px-4.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Fee Enrollment Status</label>
            <select
              value={studentFeeStatus} onChange={e => setStudentFeeStatus(e.target.value as any)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm font-semibold text-indigo-600"
            >
              <option value="pending">Pending Registration</option>
              <option value="paid">Pre-paid Invoice</option>
              <option value="unpaid">Unpaid Invoice</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
            <button
              type="button" onClick={() => setIsStudentModalOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-850 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl"
            >
              Save Student Record
            </button>
          </div>
        </form>
      </Modal>

      {/* B. TEACHER CRUD MODAL */}
      <Modal
        isOpen={isTeacherModalOpen}
        onClose={() => setIsTeacherModalOpen(false)}
        title={editingTeacher ? `Edit Instructor: ${editingTeacher.name}` : "Hire New Instructor"}
      >
        <form onSubmit={handleSaveTeacher} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Teacher Name</label>
              <input
                type="text" required placeholder="e.g., Hari Shrestha"
                value={teacherName} onChange={e => setTeacherName(e.target.value)}
                className="w-full px-4.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Login Email</label>
              <input
                type="email" required placeholder="e.g., teacher@school.com"
                value={teacherEmail} onChange={e => setTeacherEmail(e.target.value)}
                className="w-full px-4.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Employee ID</label>
              <input
                type="text" required placeholder="T-101"
                value={teacherEmpId} onChange={e => setTeacherEmpId(e.target.value)}
                className="w-full px-4.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white font-mono"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Subject</label>
              <select
                value={teacherSubject} onChange={e => setTeacherSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white"
              >
                {NEPAL_SUBJECT_CATEGORIES.map(cat => (
                  <optgroup key={cat.category} label={cat.category}>
                    {cat.subjects.map(sub => (
                      <option key={sub} value={sub}>{sub}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Gender</label>
              <select
                value={teacherGender} onChange={e => setTeacherGender(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm"
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Class Teacher Of</label>
              <input
                type="text" placeholder="e.g., Class 10 (Optional)"
                value={classTeacherOf} onChange={e => setClassTeacherOf(e.target.value)}
                className="w-full px-4.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Contact Phone</label>
              <input
                type="text" required placeholder="+977 9801234567"
                value={teacherContact} onChange={e => setTeacherContact(e.target.value)}
                className="w-full px-4.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
            <button
              type="button" onClick={() => setIsTeacherModalOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-850 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl"
            >
              Save Instructor Record
            </button>
          </div>
        </form>
      </Modal>

      {/* C. INVOICE GENERATOR MODAL */}
      <Modal
        isOpen={isFeeModalOpen}
        onClose={() => setIsFeeModalOpen(false)}
        title="Generate New Student Invoice"
      >
        <form onSubmit={handleCreateFeeInvoice} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Select Student</label>
            <select
              value={feeStudentId} onChange={e => setFeeStudentId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.rollNo} - {s.classId})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Invoice Amount (NRs.)</label>
              <input
                type="number" required placeholder="1500"
                value={feeAmount} onChange={e => setFeeAmount(Number(e.target.value))}
                className="w-full px-4.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Fee Category</label>
              <select
                value={feeCategory} onChange={e => setFeeCategory(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm"
              >
                <option value="Tuition Fee">Tuition Fee</option>
                <option value="Exam Fee">Exam Fee</option>
                <option value="Library Fee">Library Fee</option>
                <option value="Sports Fee">Sports Fee</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Payment Due Date</label>
            <input
              type="date" required
              value={feeDueDate} onChange={e => setFeeDueDate(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
            <button
              type="button" onClick={() => setIsFeeModalOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-850 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl"
            >
              Generate Invoice
            </button>
          </div>
        </form>
      </Modal>

      {/* D. LOG GRADE EXAM MODAL */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title="Log Student Exam Marks"
      >
        <form onSubmit={handleAddExamResult} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Select Student</label>
            <select
              value={resStudentId} onChange={e => {
                const sid = e.target.value;
                setResStudentId(sid);
                const sObj = students.find(s => s.id === sid);
                if (sObj && CLASS_SUBJECTS_MAP[sObj.classId]) {
                  setResSubject(CLASS_SUBJECTS_MAP[sObj.classId][0]);
                }
              }}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white"
            >
              {students.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.rollNo} - {s.classId})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Exam Subject</label>
              <select
                value={resSubject} onChange={e => setResSubject(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white"
              >
                {(() => {
                  const sObj = students.find(s => s.id === resStudentId);
                  const subjectsList = sObj && CLASS_SUBJECTS_MAP[sObj.classId] 
                    ? CLASS_SUBJECTS_MAP[sObj.classId] 
                    : ALL_NEPAL_SUBJECTS;
                  return subjectsList.map(sub => (
                    <option key={sub} value={sub}>{sub}</option>
                  ));
                })()}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Exam Term / Name</label>
              <input
                type="text" required placeholder="e.g., Midterm Exam, Final Test"
                value={resExamName} onChange={e => setResExamName(e.target.value)}
                className="w-full px-4.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Marks Obtained</label>
              <input
                type="number" required placeholder="85"
                value={resObtained} onChange={e => setResObtained(Number(e.target.value))}
                className="w-full px-4.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Maximum Marks</label>
              <input
                type="number" required placeholder="100"
                value={resMax} onChange={e => setResMax(Number(e.target.value))}
                className="w-full px-4.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Instructor Remarks</label>
            <input
              type="text" required placeholder="e.g., Diligent solutions and calculations."
              value={resRemarks} onChange={e => setResRemarks(e.target.value)}
              className="w-full px-4.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
            <button
              type="button" onClick={() => setIsResultModalOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-850 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl"
            >
              Log Grade Record
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
