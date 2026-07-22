import React, { useState } from 'react';
import { dbService } from '../services/dbService';
import { UserRole, NEPAL_SUBJECT_CATEGORIES } from '../types';
import { 
  GraduationCap, Mail, Lock, User, Key, ChevronRight, AlertCircle, Info, Phone, MapPin, Sparkles
} from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export const Login: React.FC<LoginProps> = ({ onLoginSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [role, setRole] = useState<UserRole>('student');
  
  // Login Form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  // Additional Signup Form
  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [address, setAddress] = useState('');
  
  // Role specific signup
  const [studentClass, setStudentClass] = useState('Class 1');
  const [studentRollNo, setStudentRollNo] = useState('');
  const [teacherSubject, setTeacherSubject] = useState('Mathematics');
  const [teacherEmpId, setTeacherEmpId] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) return;

    setLoading(true);
    setError('');
    try {
      const profile = await dbService.login(email, password);
      onLoginSuccess(profile);
    } catch (err: any) {
      setError(err.message || "Invalid authentication credentials.");
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim() || !name.trim()) return;

    setLoading(true);
    setError('');

    // prepare additional registration payload
    const additionalFields: any = {
      phoneNumber,
      address
    };

    if (role === 'student') {
      additionalFields.rollNo = studentRollNo || 'S-' + Math.floor(100 + Math.random() * 900);
      additionalFields.classId = studentClass;
    } else if (role === 'teacher') {
      additionalFields.employeeId = teacherEmpId || 'T-' + Math.floor(100 + Math.random() * 900);
      additionalFields.subject = teacherSubject;
    }

    try {
      const profile = await dbService.signup(email, password, name, role, additionalFields);
      onLoginSuccess(profile);
    } catch (err: any) {
      setError(err.message || "Registration failed. Verify details and password criteria.");
    } finally {
      setLoading(false);
    }
  };

  // Helper to prefill login inputs for easy testing
  const prefill = (roleType: 'admin' | 'teacher' | 'student') => {
    if (roleType === 'admin') {
      setEmail('admin@school.com');
      setPassword('admin123');
      setRole('admin');
    } else if (roleType === 'teacher') {
      setEmail('teacher@school.com');
      setPassword('teacher123');
      setRole('teacher');
    } else {
      setEmail('student@school.com');
      setPassword('student123');
      setRole('student');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col justify-center items-center p-4">
      
      {/* Brand logo banner */}
      <div className="mb-6 flex flex-col items-center">
        <div className="p-3 bg-blue-600 rounded-2xl text-white shadow-lg shadow-blue-600/25 mb-3 animate-pulse">
          <GraduationCap className="w-8 h-8" />
        </div>
        <h1 className="text-2xl font-display font-bold text-gray-950 dark:text-white tracking-tight leading-none text-center">
          School <span className="text-blue-600 dark:text-blue-400">Management System</span>
        </h1>
      </div>

      {/* Main card box */}
      <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-3xl p-6 sm:p-10 shadow-2xl max-w-md w-full transition-all duration-300">
        
        {/* Toggle tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800 pb-3 mb-6">
          <button
            onClick={() => { setIsSignUp(false); setError(''); }}
            className={`flex-1 text-center font-bold text-sm pb-2.5 border-b-2 transition-all ${
              !isSignUp 
                ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            Sign In Portal
          </button>
          <button
            onClick={() => { setIsSignUp(true); setError(''); }}
            className={`flex-1 text-center font-bold text-sm pb-2.5 border-b-2 transition-all ${
              isSignUp 
                ? 'border-blue-600 text-blue-600 dark:text-blue-400' 
                : 'border-transparent text-gray-400 hover:text-gray-600 dark:hover:text-gray-300'
            }`}
          >
            Create Account
          </button>
        </div>

        {error && (
          <div className="mb-5 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-rose-700 dark:text-rose-400 text-xs rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* --- SIGN IN PORTAL FORM --- */}
        {!isSignUp ? (
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 dark:text-gray-500">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email"
                  required
                  placeholder="e.g., student@school.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 dark:text-gray-500">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-900 dark:text-white text-sm focus:outline-hidden focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/10 disabled:opacity-50"
            >
              {loading ? 'Authorizing Session...' : 'Authenticate Profile'}
              <ChevronRight className="w-4 h-4" />
            </button>

            {/* Quick Demo Logins helper */}
            <div className="pt-4 border-t border-gray-100 dark:border-gray-800/85 mt-5">
              <span className="block text-center text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-3">
                Quick Access Profiles (One-Click)
              </span>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => prefill('admin')}
                  className="flex flex-col items-center justify-center p-2 rounded-xl border border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-slate-950/25 hover:border-blue-500/30 hover:bg-blue-50/10 dark:hover:bg-blue-950/10 transition-all group cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">Admin</span>
                  <span className="text-[8px] font-medium text-gray-400 font-mono">Arthur</span>
                </button>
                <button
                  type="button"
                  onClick={() => prefill('teacher')}
                  className="flex flex-col items-center justify-center p-2 rounded-xl border border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-slate-950/25 hover:border-blue-500/30 hover:bg-blue-50/10 dark:hover:bg-blue-950/10 transition-all group cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">Teacher</span>
                  <span className="text-[8px] font-medium text-gray-400 font-mono">Sarah</span>
                </button>
                <button
                  type="button"
                  onClick={() => prefill('student')}
                  className="flex flex-col items-center justify-center p-2 rounded-xl border border-gray-100 dark:border-gray-800/60 bg-gray-50/50 dark:bg-slate-950/25 hover:border-blue-500/30 hover:bg-blue-50/10 dark:hover:bg-blue-950/10 transition-all group cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-gray-700 dark:text-gray-300 group-hover:text-blue-600 dark:group-hover:text-blue-400">Student</span>
                  <span className="text-[8px] font-medium text-gray-400 font-mono">Alex</span>
                </button>
              </div>
            </div>
          </form>
        ) : (
          
          /* --- CREATE ACCOUNT SIGN UP FORM --- */
          <form onSubmit={handleSignUp} className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {/* Account Role */}
            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                I am a... (Role)
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setRole('student')}
                  className={`py-2 rounded-xl text-[11px] font-bold border transition-all ${
                    role === 'student'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/20'
                      : 'border-gray-200 dark:border-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => setRole('teacher')}
                  className={`py-2 rounded-xl text-[11px] font-bold border transition-all ${
                    role === 'teacher'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/20'
                      : 'border-gray-200 dark:border-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Teacher
                </button>
                <button
                  type="button"
                  onClick={() => setRole('admin')}
                  className={`py-2 rounded-xl text-[11px] font-bold border transition-all ${
                    role === 'admin'
                      ? 'border-blue-600 text-blue-600 dark:text-blue-400 bg-blue-50/30 dark:bg-blue-950/20'
                      : 'border-gray-200 dark:border-gray-800 text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  Admin
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 dark:text-gray-500">
                  <User className="w-4.5 h-4.5" />
                </span>
                <input
                  type="text" required placeholder="e.g., Ram Shrestha"
                  value={name} onChange={e => setName(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-950 dark:text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 dark:text-gray-500">
                  <Mail className="w-4.5 h-4.5" />
                </span>
                <input
                  type="email" required placeholder="e.g., student@school.com"
                  value={email} onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-950 dark:text-white text-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">
                Security Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400 dark:text-gray-500">
                  <Lock className="w-4.5 h-4.5" />
                </span>
                <input
                  type="password" required placeholder="Min 6 characters"
                  value={password} onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-950 dark:text-white text-sm"
                />
              </div>
            </div>

            {/* Role specific inputs */}
            {role === 'student' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Grade Class</label>
                  <select
                    value={studentClass} onChange={e => setStudentClass(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs bg-white dark:bg-slate-900"
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
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Roll Number</label>
                  <input
                    type="text" placeholder="e.g., S-502"
                    value={studentRollNo} onChange={e => setStudentRollNo(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-mono"
                  />
                </div>
              </div>
            )}
            {role === 'teacher' && (
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Subject specialty</label>
                  <select
                    value={teacherSubject} onChange={e => setTeacherSubject(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
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
                  <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Employee ID</label>
                  <input
                    type="text" placeholder="e.g., T-101"
                    value={teacherEmpId} onChange={e => setTeacherEmpId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs font-mono bg-white dark:bg-slate-900 text-gray-900 dark:text-white"
                  />
                </div>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Phone Number</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
                    <Phone className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text" placeholder="+977..."
                    value={phoneNumber} onChange={e => setPhoneNumber(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-400 mb-1">Residential City</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-400">
                    <MapPin className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="text" placeholder="Kathmandu, Nepal"
                    value={address} onChange={e => setAddress(e.target.value)}
                    className="w-full pl-7 pr-3 py-2 rounded-xl border border-gray-200 dark:border-gray-800 text-xs bg-white dark:bg-slate-900"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-1.5 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-sm transition-all shadow-lg shadow-blue-600/10 disabled:opacity-50 mt-4"
            >
              {loading ? 'Creating Account...' : 'Register Profile'}
              <ChevronRight className="w-4 h-4" />
            </button>
          </form>
        )}
      </div>

    </div>
  );
};
