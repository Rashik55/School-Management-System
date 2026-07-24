import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/dbService';
import { Assignment, Submission, ExamResult, FeeTransaction, UserProfile } from '../../types';
import { NoticeBoard } from '../../components/NoticeBoard';
import { TimetableGrid } from '../../components/TimetableGrid';
import { ProfileSettings } from '../../components/ProfileSettings';
import { LibraryView } from '../../components/LibraryView';
import { Modal } from '../../components/Modal';
import { 
  GraduationCap, ClipboardList, BookOpen, Award, Banknote, Calendar, Clock,
  CheckCircle, AlertTriangle, Send, ShieldAlert, CreditCard, ChevronRight, X
} from 'lucide-react';

interface StudentDashboardProps {
  user: UserProfile;
  onUpdateUser: (updated: UserProfile) => void;
  activeTab: string;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ user, onUpdateUser, activeTab }) => {
  const [attendancePct, setAttendancePct] = useState(95);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [results, setResults] = useState<ExamResult[]>([]);
  const [fees, setFees] = useState<FeeTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Submission handler states
  const [submittingAssignment, setSubmittingAssignment] = useState<Assignment | null>(null);
  const [submissionText, setSubmissionText] = useState('');
  const [sendingSub, setSendingSub] = useState(false);

  // Payment states
  const [payingFee, setPayingFee] = useState<FeeTransaction | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Credit Card');
  const [payingState, setPayingState] = useState(false);

  // Modals
  const [isSubmitModalOpen, setIsSubmitModalOpen] = useState(false);
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);

  const studentClass = user.classId || 'Class 10';

  useEffect(() => {
    fetchStudentData();
  }, [studentClass]);

  const fetchStudentData = async () => {
    setLoading(true);
    try {
      const [pct, aData, rData, fData] = await Promise.all([
        dbService.getStudentAttendancePercentage(user.uid),
        dbService.getAssignments(studentClass),
        dbService.getResults(user.uid),
        dbService.getFees(user.uid)
      ]);

      setAttendancePct(pct);
      setAssignments(aData);
      setResults(rData);
      setFees(fData);

      // fetch all submissions for these assignments to check if student already submitted
      const allSubs: Submission[] = [];
      for (const asg of aData) {
        const s = await dbService.getSubmissions(asg.id);
        const mine = s.find(sub => sub.studentId === user.uid);
        if (mine) allSubs.push(mine);
      }
      setSubmissions(allSubs);
    } catch (err) {
      console.error("Student portal load failed:", err);
    } finally {
      setLoading(false);
    }
  };

  // Submit homework
  const handleOpenSubmit = (asg: Assignment) => {
    setSubmittingAssignment(asg);
    setSubmissionText('');
    setIsSubmitModalOpen(true);
  };

  const handleSendSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!submittingAssignment || !submissionText.trim()) return;

    setSendingSub(true);
    try {
      const added = await dbService.submitAssignment({
        assignmentId: submittingAssignment.id,
        studentId: user.uid,
        studentName: user.name,
        submittedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        submissionText,
        status: 'submitted'
      });

      setSubmissions(prev => [...prev, added]);
      setIsSubmitModalOpen(false);
    } catch (err) {
      console.error("Failed to submit homework:", err);
    } finally {
      setSendingSub(false);
    }
  };

  // Pay invoice
  const handleOpenPayment = (fee: FeeTransaction) => {
    setPayingFee(fee);
    setPaymentMethod('Credit Card');
    setIsPayModalOpen(true);
  };

  const handleSendPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!payingFee) return;

    setPayingState(true);
    try {
      const updated = await dbService.payFee(payingFee.id, paymentMethod);
      setFees(prev => prev.map(f => f.id === payingFee.id ? updated : f));
      setIsPayModalOpen(false);
    } catch (err) {
      console.error("Payment failed:", err);
    } finally {
      setPayingState(false);
    }
  };

  const getAsgStatus = (asgId: string) => {
    const sub = submissions.find(s => s.assignmentId === asgId);
    if (!sub) return { label: 'Unsubmitted', class: 'bg-rose-50 border-rose-200 text-rose-700 dark:bg-rose-950/20 dark:text-rose-400 dark:border-rose-900/30' };
    if (sub.status === 'graded') return { label: `Graded (${sub.grade})`, class: 'bg-emerald-50 border-emerald-200 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30' };
    return { label: 'Submitted', class: 'bg-indigo-50 border-indigo-200 text-indigo-700 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30' };
  };

  return (
    <div className="space-y-6 md:space-y-8 animate-in fade-in duration-300">
      
      {/* 1. MY HUB (DASHBOARD) */}
      {activeTab === 'dashboard' && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">My Attendance</span>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none">{attendancePct}%</p>
                <span className="text-[10px] text-emerald-500 font-semibold block">Keep it above 90%</span>
              </div>
              <div className="p-4 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <ClipboardList className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">GPA standard</span>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none">3.85</p>
                <span className="text-[10px] text-indigo-500 font-semibold block">Excellent Grade Stand</span>
              </div>
              <div className="p-4 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-2xl">
                <Award className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between shadow-xs">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Pending Tasks</span>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none">
                  {assignments.length - submissions.length}
                </p>
                <span className="text-[10px] text-rose-500 font-semibold block">Unfinished Homeworks</span>
              </div>
              <div className="p-4 bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 rounded-2xl">
                <BookOpen className="w-6 h-6" />
              </div>
            </div>

            <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl flex items-center justify-between shadow-xs hover:shadow-md transition-all active:scale-[0.98] duration-150">
              <div className="space-y-1.5">
                <span className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider block">Invoice dues</span>
                <p className="text-3xl font-extrabold text-gray-900 dark:text-white leading-none">
                  NRs. {fees.filter(f => f.status !== 'paid').reduce((acc, f) => acc + f.amount, 0)}
                </p>
                <span className="text-[10px] text-amber-500 font-semibold block">Pending fee invoices</span>
              </div>
              <div className="p-4 bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 rounded-2xl">
                <Banknote className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
            <div className="lg:col-span-7 space-y-6">
              {/* Profile Card Summary */}
              <div className="p-6 bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl shadow-xs">
                <h4 className="font-bold text-gray-900 dark:text-white mb-4">Student Identity</h4>
                <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-indigo-100 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-400 flex items-center justify-center font-bold text-xl uppercase shrink-0">
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <h5 className="font-semibold text-gray-900 dark:text-white">{user.name}</h5>
                    <p className="text-xs text-gray-400">Class Rank: <strong>#4 out of 32</strong></p>
                    <div className="flex flex-wrap gap-4 mt-2 text-xs font-medium text-gray-500">
                      <span>Roll No: <strong>{user.rollNo || 'S-502'}</strong></span>
                      <span>Enrolled: <strong>{studentClass}</strong></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Timetable schedule mini widget */}
              <TimetableGrid userRole="student" filterClassId={studentClass} />
            </div>

            <div className="lg:col-span-5">
              <NoticeBoard userRole="student" authorName={user.name} />
            </div>
          </div>
        </>
      )}

      {/* 2. MY ATTENDANCE */}
      {activeTab === 'attendance' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <ClipboardList className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Attendance Analytics</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Review class presence and late markers</p>
            </div>
          </div>

          <div className="max-w-md p-6 border border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-850/20 rounded-2xl">
            <span className="text-xs font-bold text-indigo-600 uppercase">My Ratio</span>
            <h4 className="text-3xl font-extrabold text-gray-900 dark:text-white mt-1">{attendancePct}% Overall Attendance</h4>
            
            <div className="w-full h-3 bg-gray-250 dark:bg-slate-800 rounded-full overflow-hidden mt-4">
              <div style={{ width: `${attendancePct}%` }} className="h-full bg-emerald-500 rounded-full"></div>
            </div>

            <p className="text-xs text-gray-450 mt-3 leading-relaxed">
              *Your attendance is calculated dynamically from recorded class books. Ensure to report early before timetabled periods start.
            </p>
          </div>
        </div>
      )}

      {/* 3. ASSIGNMENTS HOMEWORK */}
      {activeTab === 'assignments' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs space-y-6">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-gray-100 dark:border-gray-800">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Active Assignments</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Complete and upload subject worksheets before deadline</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assignments.length === 0 ? (
              <div className="col-span-2 text-center py-8 text-gray-405">
                No assignments have been published for {studentClass} currently.
              </div>
            ) : (
              assignments.map(asg => {
                const status = getAsgStatus(asg.id);
                const hasSubmitted = submissions.some(s => s.assignmentId === asg.id);
                const submissionObj = submissions.find(s => s.assignmentId === asg.id);

                return (
                  <div key={asg.id} className="p-5 border border-gray-100 dark:border-gray-800 rounded-2xl bg-gray-50/30 dark:bg-slate-850/15 flex flex-col justify-between space-y-4">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">{asg.subject}</span>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold border ${status.class}`}>
                          {status.label}
                        </span>
                      </div>
                      
                      <h4 className="font-semibold text-gray-950 dark:text-white text-base mb-1">{asg.title}</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-450 leading-relaxed mb-4">{asg.description}</p>
                    </div>

                    {submissionObj && submissionObj.grade && (
                      <div className="p-3 bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-100/40 dark:border-emerald-900/30 rounded-xl text-xs space-y-1">
                        <div>Evaluation Grade: <strong className="text-emerald-700 dark:text-emerald-400">{submissionObj.grade}</strong></div>
                        <div className="text-gray-500 dark:text-gray-400 font-medium">Comments: "{submissionObj.remarks}"</div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-800/60">
                      <span className="text-[10px] text-gray-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Due date: {asg.dueDate}
                      </span>

                      {!hasSubmitted ? (
                        <button
                          onClick={() => handleOpenSubmit(asg)}
                          className="flex items-center gap-1.5 px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-xl transition-all shadow-xs"
                        >
                          Submit Task <Send className="w-3 h-3" />
                        </button>
                      ) : (
                        <span className="text-xs text-gray-400 font-bold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4 text-emerald-500" /> Completed
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* 4. RESULTS EXAM GRADES */}
      {activeTab === 'results' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-gray-100 dark:border-gray-800 mb-6">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Award className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Exam Report Cards</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Record of official term grades</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-150 dark:border-gray-800/80 bg-gray-50/20 dark:bg-slate-850/10">
                  <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Subject</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Exam Term</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Date Evaluated</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Marks (Obt/Max)</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500 text-center">Grade</th>
                  <th className="py-3 px-4 text-xs font-semibold uppercase text-gray-400 dark:text-gray-500">Instructor Feedback</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {results.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-405">
                      No results published for your portfolio yet.
                    </td>
                  </tr>
                ) : (
                  results.map(res => (
                    <tr key={res.id} className="hover:bg-gray-50/40 dark:hover:bg-slate-850/10 text-xs md:text-sm">
                      <td className="py-4 px-4 font-semibold text-gray-950 dark:text-white">{res.subject}</td>
                      <td className="py-4 px-4 text-gray-700 dark:text-gray-350">{res.examName}</td>
                      <td className="py-4 px-4 text-gray-400">{res.date}</td>
                      <td className="py-4 px-4 font-semibold text-gray-800 dark:text-gray-200">
                        <strong className="text-gray-950 dark:text-white font-extrabold">{res.marksObtained}</strong> / {res.maxMarks}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <span className="px-2.5 py-0.5 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 font-extrabold text-xs rounded-sm">
                          {res.grade}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-500 dark:text-gray-400 italic max-w-sm truncate">"{res.remarks}"</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5. FEE PORTAL FOR PAYMENT */}
      {activeTab === 'fees' && (
        <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs">
          <div className="flex items-center space-x-2.5 pb-4 border-b border-gray-100 dark:border-gray-800 mb-6">
            <div className="p-2 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
              <Banknote className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">Fee Balance & Payments</h3>
              <p className="text-xs text-gray-400 dark:text-gray-500">Pay tuition, athletic or sports dues instantly</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="border-b border-gray-150 dark:border-gray-800/80 bg-gray-50/20 dark:bg-slate-850/10">
                  <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Invoice No</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Description</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Amount</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Due Date</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase">Status</th>
                  <th className="py-3 px-4 text-xs font-semibold text-gray-400 uppercase text-right">Payment</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
                {fees.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-8 text-gray-400">
                      No invoices logged to your profile.
                    </td>
                  </tr>
                ) : (
                  fees.map(fee => (
                    <tr key={fee.id} className="hover:bg-gray-50/40 dark:hover:bg-slate-850/10 text-xs md:text-sm">
                      <td className="py-4 px-4 font-mono font-semibold text-gray-700 dark:text-gray-300">{fee.invoiceNo}</td>
                      <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">{fee.category}</td>
                      <td className="py-4 px-4 font-extrabold text-gray-955 dark:text-white">NRs. {fee.amount}</td>
                      <td className="py-4 px-4 text-gray-500 dark:text-gray-400">{fee.dueDate}</td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          fee.status === 'paid'
                            ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/20 dark:text-emerald-400'
                            : 'bg-amber-50 text-amber-700 dark:bg-amber-950/20 dark:text-amber-400'
                        }`}>
                          {fee.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-right">
                        {fee.status !== 'paid' ? (
                          <button
                            onClick={() => handleOpenPayment(fee)}
                            className="flex items-center gap-1 text-xs font-bold text-indigo-600 hover:text-indigo-700 justify-end w-full"
                          >
                            Pay Dues <ChevronRight className="w-4 h-4" />
                          </button>
                        ) : (
                          <span className="text-xs text-gray-400 font-bold flex items-center gap-1 justify-end">
                            <CheckCircle className="w-4 h-4 text-emerald-500" /> Settled
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 5.5. LIBRARY MODULE */}
      {activeTab === 'library' && (
        <LibraryView user={user} />
      )}

      {/* 6. SCHEDULER TIMETABLE */}
      {activeTab === 'timetable' && (
        <TimetableGrid userRole="student" filterClassId={studentClass} />
      )}

      {/* 7. NOTICE BOARD */}
      {activeTab === 'notices' && (
        <NoticeBoard userRole="student" authorName={user.name} />
      )}

      {/* 8. PROFILE SETTINGS */}
      {activeTab === 'settings' && (
        <ProfileSettings user={user} onUpdate={onUpdateUser} />
      )}

      {/* ==========================================
          MODALS ZONE
          ========================================== */}
      
      {/* A. WORKPLACE SUBMISSION MODAL */}
      <Modal
        isOpen={isSubmitModalOpen}
        onClose={() => setIsSubmitModalOpen(false)}
        title="Submit Assignment Work"
      >
        <form onSubmit={handleSendSubmission} className="space-y-4">
          {submittingAssignment && (
            <>
              <div className="p-4 bg-gray-50 dark:bg-slate-850 rounded-xl space-y-1 text-xs">
                <div>Subject: <strong className="text-indigo-600 dark:text-indigo-400 uppercase">{submittingAssignment.subject}</strong></div>
                <div>Homework: <strong className="text-gray-950 dark:text-white">{submittingAssignment.title}</strong></div>
                <div className="pt-2 text-gray-500 leading-relaxed font-mono">
                  "{submittingAssignment.description}"
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1">Your Submission Content</label>
                <textarea
                  required rows={5} placeholder="Write your answers, calculations, or report references here..."
                  value={submissionText} onChange={e => setSubmissionText(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm resize-none"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
                <button
                  type="button" onClick={() => setIsSubmitModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-850 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={sendingSub}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl"
                >
                  {sendingSub ? 'Uploading...' : 'Send Submission'}
                </button>
              </div>
            </>
          )}
        </form>
      </Modal>

      {/* B. CREDIT CARD PAYMENT PORTAL MODAL */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Instant Fee Payment Gateway"
      >
        <form onSubmit={handleSendPayment} className="space-y-4">
          {payingFee && (
            <>
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/30 rounded-xl space-y-1 text-xs">
                <div>Dues Description: <strong className="text-gray-950 dark:text-white">{payingFee.category}</strong></div>
                <div>Invoice Code: <strong>{payingFee.invoiceNo}</strong></div>
                <div className="text-base font-extrabold text-indigo-700 dark:text-indigo-400 pt-1">
                  Total Dues: NRs. {payingFee.amount}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-500 mb-1.5">Payment Method</label>
                <select
                  value={paymentMethod} onChange={e => setPaymentMethod(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-sm"
                >
                  <option value="Credit Card">Credit Card (Instant Settlement)</option>
                  <option value="Bank Transfer">Bank Transfer (1-2 Days)</option>
                  <option value="Apple Pay">Apple Pay</option>
                </select>
              </div>

              {paymentMethod === 'Credit Card' && (
                <div className="space-y-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Card Number</label>
                    <input
                      type="text" required placeholder="xxxx xxxx xxxx 4125"
                      className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-xs font-mono"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Expiration</label>
                      <input
                        type="text" required placeholder="08/28"
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-xs font-mono"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">CVC Code</label>
                      <input
                        type="password" required placeholder="***" maxLength={3}
                        className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-900 text-xs font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
                <button
                  type="button" onClick={() => setIsPayModalOpen(false)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-850 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit" disabled={payingState}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl"
                >
                  {payingState ? 'Processing...' : `Authorize Payment (NRs. ${payingFee.amount})`}
                </button>
              </div>
            </>
          )}
        </form>
      </Modal>

    </div>
  );
};
