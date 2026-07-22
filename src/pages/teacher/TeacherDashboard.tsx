import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/dbService';
import { Student, AttendanceRecord, Assignment, Submission, ExamResult, UserProfile } from '../../types';
import { NoticeBoard } from '../../components/NoticeBoard';
import { TimetableGrid } from '../../components/TimetableGrid';
import { ProfileSettings } from '../../components/ProfileSettings';
import { LibraryView } from '../../components/LibraryView';
import { Modal } from '../../components/Modal';
import { 
  ClipboardList, BookOpen, Award, CheckSquare, Plus, Check, Clock, Eye, 
  Settings, Megaphone, Calendar, Users, FileText, ChevronRight, AlertCircle, Save
} from 'lucide-react';

interface TeacherDashboardProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  activeTab: string;
}

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ user, onUpdateUser, activeTab }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [loading, setLoading] = useState(true);

  // Attendance module states
  const [attClass, setAttClass] = useState('Class 10');
  const [attDate, setAttDate] = useState('2026-07-20');
  const [attRecords, setAttRecords] = useState<Record<string, 'present' | 'absent' | 'late'>>({});
  const [attSaving, setAttSaving] = useState(false);
  const [attSuccess, setAttSuccess] = useState(false);

  // Active Assignment / Submission grader state
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [gradingSubmission, setGradingSubmission] = useState<Submission | null>(null);
  const [gradeValue, setGradeValue] = useState('A+');
  const [remarksValue, setRemarksValue] = useState('');

  // Modals state
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [isGradeModalOpen, setIsGradeModalOpen] = useState(false);
  const [isResultModalOpen, setIsResultModalOpen] = useState(false);

  // Assignment Creation Form State
  const [assignTitle, setAssignTitle] = useState('');
  const [assignDesc, setAssignDesc] = useState('');
  const [assignClass, setAssignClass] = useState('Class 10');
  const [assignSubject, setAssignSubject] = useState(user.subject || 'Mathematics');
  const [assignDueDate, setAssignDueDate] = useState('2026-07-28');

  // Result Creation Form State
  const [resStudentId, setResStudentId] = useState('');
  const [resExamName, setResExamName] = useState('Midterm Exam');
  const [resObtained, setResObtained] = useState(85);
  const [resMax, setResMax] = useState(100);
  const [resRemarks, setResRemarks] = useState('Excellent standard solutions.');

  useEffect(() => {
    fetchInitialData();
  }, [attClass, attDate]);

  const fetchInitialData = async () => {
    setLoading(true);
    try {
      const [sData, aData, rData] = await Promise.all([
        dbService.getStudents(),
        dbService.getAssignments(),
        dbService.getResults()
      ]);

      // Filter students by chosen class for current attendance
      const classStudents = sData.filter(s => s.classId === attClass);
      setStudents(sData);

      // Fetch existing attendance if any
      const existingAtt = await dbService.getAttendance(attClass, attDate);
      const attMap: Record<string, 'present' | 'absent' | 'late'> = {};
      
      // Default all to present if no existing record
      classStudents.forEach(student => {
        const found = existingAtt.find(e => e.studentId === student.id);
        attMap[student.id] = found ? found.status : 'present';
      });
      setAttRecords(attMap);

      // Filter assignments uploaded by this teacher
      setAssignments(aData.filter(a => a.teacherId === user.uid));
      setResults(rData.filter(r => r.classId === attClass));

      if (classStudents.length > 0) {
        setResStudentId(classStudents[0].id);
      }
    } catch (err) {
      console.error("Teacher portal data load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Handle individual attendance status toggle
  const handleToggleAttendance = (studentId: string, status: 'present' | 'absent' | 'late') => {
    setAttRecords(prev => ({
      ...prev,
      [studentId]: status
    }));
  };

  const handleSaveAttendance = async () => {
    setAttSaving(true);
    setAttSuccess(false);
    try {
      const recordsToSave = Object.entries(attRecords).map(([studentId, status]) => {
        const studentObj = students.find(s => s.id === studentId)!;
        return {
          date: attDate,
          studentId,
          studentName: studentObj.name,
          rollNo: studentObj.rollNo,
          classId: attClass,
          status: status as 'present' | 'absent' | 'late',
          markedBy: user.name
        };
      });

      await dbService.saveAttendance(recordsToSave);
      setAttSuccess(true);
      setTimeout(() => setAttSuccess(false), 3000);
    } catch (err) {
      console.error("Failed to save attendance:", err);
    } finally {
      setAttSaving(false);
    }
  };

  // Create Assignment
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignTitle.trim() || !assignDesc.trim()) return;

    try {
      const added = await dbService.addAssignment({
        title: assignTitle,
        description: assignDesc,
        dueDate: assignDueDate,
        classId: assignClass,
        subject: assignSubject,
        teacherId: user.uid,
        teacherName: user.name,
        createdAt: new Date().toISOString().split('T')[0]
      });

      setAssignments(prev => [...prev, added]);
      setAssignTitle('');
      setAssignDesc('');
      setIsAssignModalOpen(false);
    } catch (err) {
      console.error("Failed to post assignment:", err);
    }
  };

  // View Submissions of specific assignment
  const handleViewSubmissions = async (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setLoading(true);
    try {
      const subs = await dbService.getSubmissions(assignment.id);
      setSubmissions(subs);
    } catch (err) {
      console.error("Error loading submissions:", err);
    } finally {
      setLoading(false);
    }
  };

  // Open Grader Modal
  const handleOpenGrader = (submission: Submission) => {
    setGradingSubmission(submission);
    setGradeValue(submission.grade || 'A+');
    setRemarksValue(submission.remarks || '');
    setIsGradeModalOpen(true);
  };

  // Save Grades
  const handleSaveGrades = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gradingSubmission) return;

    try {
      const updated = await dbService.gradeSubmission(gradingSubmission.id, gradeValue, remarksValue);
      setSubmissions(prev => prev.map(s => s.id === gradingSubmission.id ? updated : s));
      setIsGradeModalOpen(false);
    } catch (err) {
      console.error("Failed to grade submission:", err);
    }
  };

  // Create Exam Result entry
  const handleAddExamResult = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetStudent = students.find(s => s.id === resStudentId);
    if (!targetStudent) return;

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
        classId: attClass,
        subject: user.subject || 'Mathematics',
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
      console.error("Failed to log student result:", err);
    }
  };

  const currentClassStudents = students.filter(s => s.classId === attClass);

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      
      {/* 1. OVERVIEW HUB */}
      {activeTab === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Managed Class</span>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none">{user.classId || 'Class 10'}</p>
                <span className="text-[10px] text-indigo-500 font-semibold block">Class Teacher Of</span>
              </div>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">My Assignments</span>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none">{assignments.length}</p>
                <span className="text-[10px] text-emerald-500 font-semibold block">Actively Hosted</span>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Attendance Rate</span>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none">96%</p>
                <span className="text-[10px] text-amber-500 font-semibold block">Monthly average</span>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl">
                <ClipboardList className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Subject Department</span>
                <p className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 leading-none truncate max-w-[120px]">{user.subject}</p>
                <span className="text-[10px] text-rose-500 font-semibold block">Primary Specialty</span>
              </div>
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl">
                <Award className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            <div className="lg:col-span-7 space-y-6">
              {/* Profile Card Summary */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xs">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Instructor Overview</h4>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xl uppercase shrink-0">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white">{user.name}</h5>
                    <p className="text-xs text-gray-400">{user.email}</p>
                    <div className="flex gap-4 mt-2 text-xs font-medium text-gray-500">
                      <span>EmpId: <strong>{user.employeeId || 'T-101'}</strong></span>
                      <span>Department: <strong>{user.subject}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timetable schedule mini widget */}
              <TimetableGrid userRole="teacher" filterTeacherName={user.name} />
            </div>

            <div className="lg:col-span-5">
              <NoticeBoard userRole="teacher" authorName={user.name} />
            </div>
          </div>
        </>
      )}

      {/* 2. ATTENDANCE MODULE */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 dark:border-gray-800 pb-5">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
                <ClipboardList className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Attendance Register</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">Record daily class presence ratios</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Class Selector */}
              <select
                value={attClass}
                onChange={e => setAttClass(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-800 text-gray-950 dark:text-white text-sm font-semibold"
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

              {/* Date Input */}
              <input
                type="date"
                value={attDate}
                onChange={e => setAttDate(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-800 text-gray-950 dark:text-white text-sm font-semibold"
              />
            </div>
          </div>

          {attSuccess && (
            <div className="p-4 bg-emerald-50 dark:bg-emerald-950/25 border border-emerald-100 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400 font-semibold rounded-xl text-sm flex items-center gap-2">
              <Check className="w-5 h-5" /> Attendance register saved and synchronized successfully!
            </div>
          )}

          {/* Student attendance list */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-150 dark:border-gray-800/80 bg-gray-50/20 dark:bg-slate-850/10">
                  <th className="py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Roll No</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Student Name</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {currentClassStudents.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="text-center py-8 text-gray-400">
                      No students allocated to {attClass}.
                    </td>
                  </tr>
                ) : (
                  currentClassStudents.map(student => {
                    const currentStatus = attRecords[student.id] || 'present';
                    return (
                      <tr key={student.id} className="hover:bg-gray-50/40 dark:hover:bg-slate-850/10">
                        <td className="py-4 px-4 font-mono font-bold text-indigo-600 dark:text-indigo-400 text-xs">
                          {student.rollNo}
                        </td>
                        <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">
                          {student.name}
                        </td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-1 sm:gap-2.5">
                            {['present', 'absent', 'late'].map(st => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => handleToggleAttendance(student.id, st as any)}
                                className={`px-3 py-1.5 rounded-xl font-bold text-xs uppercase border transition-all ${
                                  currentStatus === st
                                    ? st === 'present'
                                      ? 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30'
                                      : st === 'late'
                                      ? 'bg-amber-50 border-amber-200 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30'
                                      : 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30'
                                    : 'bg-white border-gray-200 text-gray-550 dark:bg-slate-900 dark:border-gray-800 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-slate-850'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {currentClassStudents.length > 0 && (
            <div className="flex justify-end pt-4 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={handleSaveAttendance}
                disabled={attSaving}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl transition-all shadow-xs disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                {attSaving ? 'Saving...' : 'Sync Attendance'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* 3. ASSIGNMENTS TAB */}
      {activeTab === 'assignments' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">Assignments Center</h3>
                <p className="text-xs text-gray-400 dark:text-gray-500">Post and grade student homework exercises</p>
              </div>

              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-sm transition-all shadow-xs shrink-0 self-start sm:self-auto"
              >
                <Plus className="w-4.5 h-4.5" /> Publish Homework
              </button>
            </div>

            {/* List assignments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
              {assignments.length === 0 ? (
                <div className="col-span-2 text-center py-8 text-gray-400 dark:text-gray-500">
                  No assignments published yet. Click Publish Homework above to get started.
                </div>
              ) : (
                assignments.map(asg => (
                  <div key={asg.id} className="p-5 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/30 dark:bg-slate-850/15 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{asg.classId}</span>
                        <span className="text-xs text-gray-400 flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> Due: {asg.dueDate}</span>
                      </div>
                      <h4 className="font-semibold text-gray-950 dark:text-white text-base mb-1">{asg.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-450 mb-4 line-clamp-2">{asg.description}</p>
                    </div>

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800/60 mt-3">
                      <span className="text-[11px] font-semibold text-gray-450">
                        Submissions: <strong className="text-gray-700 dark:text-gray-350">{asg.submissionsCount || 0}</strong>
                      </span>

                      <button
                        onClick={() => handleViewSubmissions(asg)}
                        className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700"
                      >
                        Review Submissions <ChevronRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Submissions Section */}
          {selectedAssignment && (
            <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs space-y-6 animate-in fade-in slide-in-from-bottom-3 duration-300">
              <h3 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
                <CheckSquare className="w-5 h-5 text-indigo-500" /> Submissions for: <span className="text-indigo-600 dark:text-indigo-400">{selectedAssignment.title}</span>
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-150 dark:border-gray-800/80 bg-gray-50/20 dark:bg-slate-850/10">
                      <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Student Name</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Submitted At</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Submission Detail</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase text-center">Grade</th>
                      <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                    {submissions.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-400">
                          No student has submitted this homework assignment yet.
                        </td>
                      </tr>
                    ) : (
                      submissions.map(sub => (
                        <tr key={sub.id} className="hover:bg-gray-50/40 dark:hover:bg-slate-850/10">
                          <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">
                            {sub.studentName}
                          </td>
                          <td className="py-4 px-4 text-xs text-gray-400">{sub.submittedAt}</td>
                          <td className="py-4 px-4 text-xs text-gray-600 dark:text-gray-350 max-w-xs truncate">
                            {sub.submissionText}
                          </td>
                          <td className="py-4 px-4 text-center">
                            {sub.grade ? (
                              <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/25 dark:text-emerald-400 font-extrabold text-xs rounded-xs">
                                {sub.grade}
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 bg-amber-50 text-amber-700 dark:bg-amber-950/25 dark:text-amber-400 font-bold text-xs rounded-xs">
                                Pending
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button
                              onClick={() => handleOpenGrader(sub)}
                              className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 dark:bg-slate-800 dark:hover:bg-slate-750 text-indigo-600 dark:text-indigo-400 font-bold text-xs rounded-xl"
                            >
                              Grade Homework
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
        </div>
      )}

      {/* 4. MARKS / RESULT MANAGEMENT */}
      {activeTab === 'results' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Class Gradebook</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Record midterm and final semester grades</p>
            </div>

            <div className="flex items-center gap-3">
              <select
                value={attClass}
                onChange={e => setAttClass(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-800 text-gray-950 dark:text-white text-xs font-semibold"
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

              <button
                onClick={() => setIsResultModalOpen(true)}
                className="flex items-center gap-1 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-xs px-3.5 py-1.5 rounded-xl transition-all"
              >
                <Plus className="w-4 h-4" /> Log Result
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-150 dark:border-gray-800/80 bg-gray-50/20 dark:bg-slate-850/10">
                  <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Roll No</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Student Name</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Exam</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Marks</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase text-center">Grade</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Remarks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      No results logged in this class subject.
                    </td>
                  </tr>
                ) : (
                  results.map(res => (
                    <tr key={res.id} className="hover:bg-gray-50/40 dark:hover:bg-slate-850/10">
                      <td className="py-4 px-4 font-mono font-bold text-xs text-indigo-600 dark:text-indigo-400">{res.rollNo}</td>
                      <td className="py-4 px-4 font-semibold text-gray-900 dark:text-white">{res.studentName}</td>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-300 font-medium">{res.examName}</td>
                      <td className="py-4 px-4 text-gray-800 dark:text-gray-200">
                        <strong className="text-gray-950 dark:text-white font-extrabold">{res.marksObtained}</strong> / {res.maxMarks}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs rounded-xs">
                          {res.grade}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-500 dark:text-gray-400 max-w-xs truncate">{res.remarks}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 4.5. LIBRARY TAB */}
      {activeTab === 'library' && (
        <LibraryView user={user} />
      )}

      {/* 5. TIMETABLE TAB */}
      {activeTab === 'timetable' && (
        <TimetableGrid userRole="teacher" filterTeacherName={user.name} />
      )}

      {/* 6. NOTICES */}
      {activeTab === 'notices' && (
        <NoticeBoard userRole="teacher" authorName={user.name} />
      )}

      {/* 7. SETTINGS */}
      {activeTab === 'settings' && (
        <ProfileSettings user={user} onUpdate={onUpdateUser} />
      )}

      {/* ==========================================
          MODALS ZONE
          ========================================== */}
      
      {/* A. HOMEWORK PUBLISHER MODAL */}
      <Modal
        isOpen={isAssignModalOpen}
        onClose={() => setIsAssignModalOpen(false)}
        title="Publish New Homework Assignment"
      >
        <form onSubmit={handleCreateAssignment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Assignment Title</label>
            <input
              type="text" required placeholder="e.g., Trigonometric Identity Review"
              value={assignTitle} onChange={e => setAssignTitle(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Description / Guidelines</label>
            <textarea
              required rows={4} placeholder="Clearly list the questions or project guidelines..."
              value={assignDesc} onChange={e => setAssignDesc(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Target Class</label>
              <select
                value={assignClass} onChange={e => setAssignClass(e.target.value)}
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
              <label className="block text-xs font-semibold text-gray-500 mb-1">Submission Due Date</label>
              <input
                type="date" required
                value={assignDueDate} onChange={e => setAssignDueDate(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
            <button
              type="button" onClick={() => setIsAssignModalOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-850 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl"
            >
              Publish Assignment
            </button>
          </div>
        </form>
      </Modal>

      {/* B. SUBMISSION GRADER MODAL */}
      <Modal
        isOpen={isGradeModalOpen}
        onClose={() => setIsGradeModalOpen(false)}
        title="Grade Student Submission"
      >
        <form onSubmit={handleSaveGrades} className="space-y-4">
          {gradingSubmission && (
            <>
              <div className="p-4 bg-gray-50 dark:bg-slate-850 rounded-xl space-y-1 text-xs">
                <div>Student: <strong className="text-gray-950 dark:text-white">{gradingSubmission.studentName}</strong></div>
                <div>Submitted At: <strong>{gradingSubmission.submittedAt}</strong></div>
                <div className="mt-2 text-gray-600 dark:text-gray-300 italic whitespace-pre-wrap font-mono bg-white dark:bg-slate-900 p-2.5 rounded-lg border border-gray-100 dark:border-gray-850">
                  "{gradingSubmission.submissionText}"
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Assign Letter Grade</label>
                  <select
                    value={gradeValue} onChange={e => setGradeValue(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm"
                  >
                    <option value="A+">A+ (Outstanding)</option>
                    <option value="A">A (Excellent)</option>
                    <option value="B+">B+ (Very Good)</option>
                    <option value="B">B (Good)</option>
                    <option value="C">C (Satisfactory)</option>
                    <option value="D">D (Pass)</option>
                    <option value="F">F (Fail)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 mb-1">Feedback Comments</label>
                  <input
                    type="text" required placeholder="e.g., Detailed answers. Excellent root derivations!"
                    value={remarksValue} onChange={e => setRemarksValue(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
                <button
                  type="button" onClick={() => setIsGradeModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-850 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl"
                >
                  Record Evaluation
                </button>
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* C. LOG RESULT MODAL */}
      <Modal
        isOpen={isResultModalOpen}
        onClose={() => setIsResultModalOpen(false)}
        title={`Log Student Result (${attClass})`}
      >
        <form onSubmit={handleAddExamResult} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Select Student</label>
            <select
              value={resStudentId} onChange={e => setResStudentId(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm"
            >
              {currentClassStudents.map(s => (
                <option key={s.id} value={s.id}>{s.name} ({s.rollNo})</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Exam Term</label>
              <input
                type="text" required placeholder="e.g., Midterm Exam"
                value={resExamName} onChange={e => setResExamName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Subject</label>
              <input
                type="text" disabled value={user.subject || 'Mathematics'}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-150 bg-gray-100 text-gray-400 text-sm cursor-not-allowed"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Marks Obtained</label>
              <input
                type="number" required placeholder="85"
                value={resObtained} onChange={e => setResObtained(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-500 mb-1">Maximum Marks</label>
              <input
                type="number" required placeholder="100"
                value={resMax} onChange={e => setResMax(Number(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1">Remarks</label>
            <input
              type="text" required placeholder="e.g., Exceptionally neat steps."
              value={resRemarks} onChange={e => setResRemarks(e.target.value)}
              className="w-full px-4.5 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm text-gray-900"
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
              Record Evaluation
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
