import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { TimetablePeriod, UserRole } from '../types';
import { Calendar, Clock, MapPin, Trash2, Plus, User, Coffee, Sun, Sunset, BookOpen } from 'lucide-react';
import { Modal } from './Modal';

interface TimetableGridProps {
  userRole: UserRole;
  filterClassId?: string; // Student classId
  filterTeacherName?: string; // Teacher name
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

// Config structure for shift schedules
interface ScheduleConfig {
  name: string;
  badge: string;
  timeRange: string;
  periods: { period: number; time: string }[];
  breakAfterPeriod: number; // e.g. 4 means break is between period 4 and period 5
  breakTime: string;
  breakLabel: string;
}

const SCHEDULE_CONFIGS: Record<'day' | 'morning' | 'evening', ScheduleConfig> = {
  day: {
    name: 'Day Shift (Class 1 to 10)',
    badge: 'Classes 1 - 10 (Up to 4:00 PM)',
    timeRange: '09:00 AM - 04:00 PM',
    breakAfterPeriod: 4,
    breakTime: '12:00 PM - 12:30 PM',
    breakLabel: '30 min Lunch Break',
    periods: [
      { period: 1, time: '09:00 AM - 09:45 AM' },
      { period: 2, time: '09:45 AM - 10:30 AM' },
      { period: 3, time: '10:30 AM - 11:15 AM' },
      { period: 4, time: '11:15 AM - 12:00 PM' },
      { period: 5, time: '12:30 PM - 01:15 PM' },
      { period: 6, time: '01:15 PM - 02:00 PM' },
      { period: 7, time: '02:00 PM - 02:45 PM' },
      { period: 8, time: '02:45 PM - 03:30 PM' }
    ]
  },
  morning: {
    name: 'Morning Shift (Class 11 & 12)',
    badge: 'Classes 11 & 12 (Morning)',
    timeRange: '06:40 AM - 11:00 AM',
    breakAfterPeriod: 3,
    breakTime: '08:30 AM - 09:00 AM',
    breakLabel: '30 min Morning Break',
    periods: [
      { period: 1, time: '06:40 AM - 07:15 AM' },
      { period: 2, time: '07:15 AM - 07:50 AM' },
      { period: 3, time: '07:50 AM - 08:30 AM' },
      { period: 4, time: '09:00 AM - 09:40 AM' },
      { period: 5, time: '09:40 AM - 10:20 AM' },
      { period: 6, time: '10:20 AM - 11:00 AM' }
    ]
  },
  evening: {
    name: 'Evening Shift (Class 11 & 12)',
    badge: 'Classes 11 & 12 (Evening)',
    timeRange: '11:00 AM - 04:30 PM',
    breakAfterPeriod: 3,
    breakTime: '01:15 PM - 01:45 PM',
    breakLabel: '30 min Lunch Break',
    periods: [
      { period: 1, time: '11:00 AM - 11:45 AM' },
      { period: 2, time: '11:45 AM - 12:30 PM' },
      { period: 3, time: '12:30 PM - 01:15 PM' },
      { period: 4, time: '01:45 PM - 02:30 PM' },
      { period: 5, time: '02:30 PM - 03:15 PM' },
      { period: 6, time: '03:15 PM - 04:00 PM' },
      { period: 7, time: '04:00 PM - 04:30 PM' }
    ]
  }
};

export const TimetableGrid: React.FC<TimetableGridProps> = ({ 
  userRole, 
  filterClassId = 'Class 10', 
  filterTeacherName 
}) => {
  const [timetable, setTimetable] = useState<TimetablePeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>(filterClassId);
  const [selectedShift, setSelectedShift] = useState<'day' | 'morning' | 'evening'>('day');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Auto detect default shift when class changes
  useEffect(() => {
    if (selectedClass === 'Class 11' || selectedClass === 'Class 12') {
      if (selectedShift === 'day') {
        setSelectedShift('morning');
      }
    } else {
      setSelectedShift('day');
    }
  }, [selectedClass]);

  // Form State
  const [day, setDay] = useState<'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Sunday');
  const [period, setPeriod] = useState<number>(1);
  const [timeSlot, setTimeSlot] = useState('');
  const [subject, setSubject] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [room, setRoom] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const activeConfig = SCHEDULE_CONFIGS[selectedShift];

  useEffect(() => {
    fetchTimetable();
  }, [selectedClass, selectedShift, filterTeacherName]);

  // Auto set default timeSlot when modal opens or shift changes
  useEffect(() => {
    if (activeConfig.periods.length > 0) {
      const match = activeConfig.periods.find(p => p.period === period);
      setTimeSlot(match ? match.time : activeConfig.periods[0].time);
    }
  }, [period, selectedShift]);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      let data = await dbService.getTimetable();
      if (filterTeacherName) {
        // Teacher filters by their name
        data = data.filter(t => t.teacherName.toLowerCase() === filterTeacherName.toLowerCase());
      } else {
        // Filter by selected class and shift
        data = data.filter(t => {
          const matchClass = t.classId === selectedClass;
          if (!matchClass) return false;
          if (t.shift) {
            return t.shift === selectedShift;
          }
          return true;
        });
      }
      setTimetable(data);
    } catch (err) {
      console.error("Failed to load timetable:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddSlot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !teacherName.trim() || !room.trim()) return;

    setSubmitting(true);
    try {
      await dbService.saveTimetablePeriod({
        day,
        period,
        time: timeSlot || activeConfig.periods[0].time,
        subject,
        classId: selectedClass,
        shift: selectedShift,
        teacherName,
        room
      });

      // reset form
      setSubject('');
      setTeacherName('');
      setRoom('');
      setIsModalOpen(false);
      fetchTimetable();
    } catch (err) {
      console.error("Failed to add timetable period:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSlot = async (id: string) => {
    if (window.confirm("Are you sure you want to remove this period?")) {
      try {
        await dbService.deleteTimetablePeriod(id);
        setTimetable(prev => prev.filter(t => t.id !== id));
      } catch (err) {
        console.error("Failed to delete period:", err);
      }
    }
  };

  // Helper to get slot content
  const getSlot = (dayName: string, periodNumber: number) => {
    return timetable.find(t => t.day === dayName && t.period === periodNumber);
  };

  const isHigherGrade = selectedClass === 'Class 11' || selectedClass === 'Class 12';

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs space-y-5">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-gray-100 dark:border-gray-800">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-display font-bold text-gray-950 dark:text-white">
                Class Timetable Schedule
              </h3>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-indigo-50 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
                {selectedClass}
              </span>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-indigo-500" />
              <span>{activeConfig.badge} • <strong>{activeConfig.timeRange}</strong></span>
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Class 11/12 Shift Switcher */}
          {isHigherGrade && !filterTeacherName && (
            <div className="flex items-center p-1 bg-gray-100 dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <button
                type="button"
                onClick={() => setSelectedShift('morning')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedShift === 'morning'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Sun className="w-3.5 h-3.5" /> Morning (6:40 - 11:00 AM)
              </button>
              <button
                type="button"
                onClick={() => setSelectedShift('evening')}
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                  selectedShift === 'evening'
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Sunset className="w-3.5 h-3.5" /> Evening (11:00 AM - 4:30 PM)
              </button>
            </div>
          )}

          {/* Class Selector for Admin */}
          {userRole === 'admin' && !filterTeacherName && (
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="px-3.5 py-2 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-xs font-semibold focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
            >
              <optgroup label="Primary & Secondary (Classes 1 - 10)">
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
              </optgroup>
              <optgroup label="Higher Secondary (+2 Shift System)">
                <option value="Class 11">Class 11</option>
                <option value="Class 12">Class 12</option>
              </optgroup>
            </select>
          )}

          {userRole === 'admin' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-indigo-600/10"
            >
              <Plus className="w-4 h-4" /> Schedule Slot
            </button>
          )}
        </div>
      </div>

      {/* Overview Banner for Break & Shift info */}
      <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/20 border border-amber-100/80 dark:border-amber-900/30 rounded-xl flex items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-2.5 text-amber-900 dark:text-amber-300 font-medium">
          <div className="p-1.5 bg-amber-100 dark:bg-amber-900/40 rounded-lg shrink-0">
            <Coffee className="w-4 h-4 text-amber-700 dark:text-amber-400" />
          </div>
          <div>
            <span className="font-bold">Mandatory 30-Min Recess / Break:</span> Integrated daily at <strong>{activeConfig.breakTime}</strong> for all students and teachers.
          </div>
        </div>
        <div className="hidden sm:block text-[11px] font-semibold text-amber-800/80 dark:text-amber-400/80 shrink-0">
          Saturday is Weekly School Holiday
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-gray-100 dark:bg-slate-800 rounded-xl"></div>
          <div className="grid grid-cols-6 gap-3 h-48 bg-gray-50 dark:bg-slate-850 rounded-xl"></div>
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-gray-100 dark:border-gray-800">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-150 dark:border-gray-800 bg-gray-50/60 dark:bg-slate-850/40">
                <th className="py-3 px-4 text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400 min-w-[100px]">
                  Day
                </th>
                
                {activeConfig.periods.map(p => {
                  const isBreakSlotBeforeThis = p.period === activeConfig.breakAfterPeriod + 1;

                  return (
                    <React.Fragment key={p.period}>
                      {/* Render 30-Min Break Header Column if applicable */}
                      {isBreakSlotBeforeThis && (
                        <th className="py-3 px-3 text-center text-xs font-bold uppercase tracking-wider bg-amber-100/50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-300 border-x border-amber-200/60 dark:border-amber-900/40 min-w-[110px]">
                          <div className="flex items-center justify-center gap-1">
                            <Coffee className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
                            <span>Recess</span>
                          </div>
                          <span className="block text-[10px] font-normal tracking-normal text-amber-700/80 dark:text-amber-400/80">
                            {activeConfig.breakTime}
                          </span>
                        </th>
                      )}

                      <th className="py-3 px-3 text-xs font-bold uppercase tracking-wider text-gray-600 dark:text-gray-300 min-w-[130px]">
                        Period {p.period}
                        <span className="block text-[10px] font-normal tracking-normal text-gray-400">
                          {p.time}
                        </span>
                      </th>
                    </React.Fragment>
                  );
                })}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {DAYS.map(dayName => {
                const isSaturday = dayName === 'Saturday';
                const hasSaturdaySlots = isSaturday && activeConfig.periods.some(p => getSlot('Saturday', p.period));

                if (isSaturday && !hasSaturdaySlots) {
                  return (
                    <tr key={dayName} className="bg-amber-50/30 dark:bg-amber-950/10">
                      <td className="py-4 px-4 font-bold text-xs text-amber-900 dark:text-amber-300">
                        <div className="flex items-center gap-1.5">
                          <span>Saturday</span>
                          <span className="px-1.5 py-0.5 text-[9px] font-extrabold rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 uppercase">
                            Holiday
                          </span>
                        </div>
                      </td>
                      <td colSpan={activeConfig.periods.length + 1} className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-xs font-semibold text-amber-800 dark:text-amber-400 py-2 px-4 bg-amber-100/40 dark:bg-amber-900/20 border border-dashed border-amber-200 dark:border-amber-800/40 rounded-xl">
                          <span>🌴 Saturday — Weekly School Holiday (Rest & Recess Day for Students & Teachers)</span>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={dayName} className="hover:bg-slate-50/40 dark:hover:bg-slate-850/20 transition-colors">
                    <td className="py-3.5 px-4 font-bold text-xs text-gray-800 dark:text-gray-200">
                      {dayName}
                    </td>

                    {activeConfig.periods.map(p => {
                      const slot = getSlot(dayName, p.period);
                      const isBreakSlotBeforeThis = p.period === activeConfig.breakAfterPeriod + 1;

                      return (
                        <React.Fragment key={p.period}>
                          {/* Render Lunch/Tea Break Cell */}
                          {isBreakSlotBeforeThis && (
                            <td className="py-3 px-2 bg-amber-50/40 dark:bg-amber-950/20 border-x border-amber-100 dark:border-amber-900/30 text-center">
                              <div className="p-2.5 rounded-xl border border-dashed border-amber-200 dark:border-amber-800/60 bg-amber-100/30 dark:bg-amber-900/20 space-y-1">
                                <Coffee className="w-4 h-4 text-amber-600 dark:text-amber-400 mx-auto" />
                                <span className="text-[10px] font-extrabold text-amber-800 dark:text-amber-300 block uppercase tracking-wider">
                                  30m Break
                                </span>
                                <span className="text-[9px] text-amber-700/70 dark:text-amber-400/70 font-medium block">
                                  Food & Rest
                                </span>
                              </div>
                            </td>
                          )}

                          <td className="py-3 px-2">
                            {slot ? (
                              <div className="p-3 bg-indigo-50/60 dark:bg-indigo-950/20 border border-indigo-100 dark:border-indigo-900/40 rounded-xl relative group hover:border-indigo-300 dark:hover:border-indigo-800 transition-all">
                                <h5 className="font-bold text-indigo-900 dark:text-indigo-300 text-xs mb-1 line-clamp-1">
                                  {slot.subject}
                                </h5>
                                
                                <div className="space-y-0.5 text-[10px] text-gray-600 dark:text-gray-400">
                                  <span className="flex items-center gap-1 font-medium truncate">
                                    <User className="w-2.5 h-2.5 text-indigo-500" /> {slot.teacherName}
                                  </span>
                                  <span className="flex items-center gap-1 text-gray-500 dark:text-gray-450 truncate">
                                    <MapPin className="w-2.5 h-2.5 text-gray-400" /> {slot.room}
                                  </span>
                                </div>

                                {userRole === 'admin' && (
                                  <button
                                    onClick={() => handleDeleteSlot(slot.id)}
                                    className="absolute top-1.5 right-1.5 p-1 bg-white dark:bg-slate-800 rounded-md border border-gray-100 dark:border-gray-700 text-rose-500 hover:text-rose-600 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                    title="Remove period slot"
                                  >
                                    <Trash2 className="w-3 h-3" />
                                  </button>
                                )}
                              </div>
                            ) : (
                              <div className="py-4 text-center text-[10px] font-medium text-gray-350 dark:text-gray-600 border border-dashed border-gray-150 dark:border-gray-800 rounded-xl">
                                Free Period
                              </div>
                            )}
                          </td>
                        </React.Fragment>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Slot Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`Add Timetable Period (${selectedClass} - ${activeConfig.name})`}
      >
        <form onSubmit={handleAddSlot} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Week Day
              </label>
              <select
                value={day}
                onChange={e => setDay(e.target.value as any)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-hidden text-sm"
              >
                {DAYS.filter(d => d !== 'Saturday').map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Select Period Slot
              </label>
              <select
                value={period}
                onChange={e => {
                  const pNum = Number(e.target.value);
                  setPeriod(pNum);
                  const pObj = activeConfig.periods.find(p => p.period === pNum);
                  if (pObj) setTimeSlot(pObj.time);
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-hidden text-sm"
              >
                {activeConfig.periods.map(p => (
                  <option key={p.period} value={p.period}>
                    Period {p.period} ({p.time})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
              Subject Name
            </label>
            <input
              type="text"
              required
              placeholder="e.g., Compulsory English, Physics, Accountancy"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-hidden text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Instructor Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Hari Shrestha"
                value={teacherName}
                onChange={e => setTeacherName(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-hidden text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Classroom / Location
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Room 201, Physics Lab, Hall A"
                value={room}
                onChange={e => setRoom(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-hidden text-sm"
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-gray-100 dark:border-gray-800 mt-6">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 text-sm font-semibold rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-indigo-600/10 disabled:opacity-50"
            >
              {submitting ? 'Scheduling...' : 'Save to Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
