import React, { useState, useEffect } from 'react';
import { dbService } from '../services/dbService';
import { TimetablePeriod, UserRole } from '../types';
import { Calendar, Clock, MapPin, Trash2, Plus, User } from 'lucide-react';
import { Modal } from './Modal';

interface TimetableGridProps {
  userRole: UserRole;
  filterClassId?: string; // Student classId
  filterTeacherName?: string; // Teacher name
}

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const PERIODS = [1, 2, 3, 4] as const;

export const TimetableGrid: React.FC<TimetableGridProps> = ({ 
  userRole, 
  filterClassId = 'Class 10', 
  filterTeacherName 
}) => {
  const [timetable, setTimetable] = useState<TimetablePeriod[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>(filterClassId);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form State
  const [day, setDay] = useState<'Sunday' | 'Monday' | 'Tuesday' | 'Wednesday' | 'Thursday' | 'Friday' | 'Saturday'>('Sunday');
  const [period, setPeriod] = useState<number>(1);
  const [timeSlot, setTimeSlot] = useState('08:30 AM - 09:15 AM');
  const [subject, setSubject] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [room, setRoom] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchTimetable();
  }, [selectedClass, filterTeacherName]);

  const fetchTimetable = async () => {
    setLoading(true);
    try {
      let data = await dbService.getTimetable();
      if (filterTeacherName) {
        // Teacher filters by their name
        data = data.filter(t => t.teacherName.toLowerCase() === filterTeacherName.toLowerCase());
      } else {
        // Otherwise filter by selected class (Admin/Student)
        data = data.filter(t => t.classId === selectedClass);
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
        time: timeSlot,
        subject,
        classId: selectedClass,
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

  return (
    <div className="bg-white dark:bg-slate-900 border border-gray-100 dark:border-gray-800 rounded-2xl p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 rounded-xl">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-display font-bold text-gray-950 dark:text-white">Class Timetable</h3>
            <p className="text-xs text-gray-400 dark:text-gray-500">Weekly scheduling</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Class Selector for Admin */}
          {userRole === 'admin' && !filterTeacherName && (
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white text-sm font-medium focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
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
          )}

          {userRole === 'admin' && (
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl text-xs transition-all shadow-md shadow-blue-600/10"
            >
              <Plus className="w-4 h-4" /> Schedule Slot
            </button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4 animate-pulse">
          <div className="h-10 bg-gray-100 dark:bg-slate-800 rounded-xl"></div>
          <div className="grid grid-cols-5 gap-4 h-48 bg-gray-50 dark:bg-slate-850 rounded-xl"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-gray-150 dark:border-gray-800">
                <th className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 w-[12%]">Day</th>
                {PERIODS.map(p => (
                  <th key={p} className="py-3 px-4 text-xs font-semibold uppercase tracking-wider text-gray-400 dark:text-gray-500 w-[22%]">
                    Period {p}
                    <span className="block text-[10px] font-normal lowercase tracking-normal text-gray-400">
                      {p === 1 && '08:30 - 09:15'}
                      {p === 2 && '09:15 - 10:00'}
                      {p === 3 && '10:15 - 11:00'}
                      {p === 4 && '11:00 - 11:45'}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-800/60">
              {DAYS.map(dayName => {
                const isSaturday = dayName === 'Saturday';
                const hasSaturdaySlots = isSaturday && PERIODS.some(p => getSlot('Saturday', p));

                if (isSaturday && !hasSaturdaySlots) {
                  return (
                    <tr key={dayName} className="bg-amber-50/40 dark:bg-amber-950/10 border-t border-amber-100/60 dark:border-amber-900/20">
                      <td className="py-4 px-4 font-bold text-sm text-amber-900 dark:text-amber-300">
                        <div className="flex items-center gap-2">
                          <span>Saturday</span>
                          <span className="px-2 py-0.5 text-[10px] font-extrabold rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300 border border-amber-200/60 dark:border-amber-800/40 uppercase tracking-wider">
                            Holiday
                          </span>
                        </div>
                      </td>
                      <td colSpan={PERIODS.length} className="py-3.5 px-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-xs md:text-sm font-semibold text-amber-800 dark:text-amber-400 py-2.5 px-4 bg-amber-100/40 dark:bg-amber-900/20 border border-dashed border-amber-200 dark:border-amber-800/40 rounded-xl">
                          <span className="text-base">🌴</span>
                          <span>Saturday — Weekly School Holiday (Weekend Off)</span>
                        </div>
                      </td>
                    </tr>
                  );
                }

                return (
                  <tr key={dayName} className="hover:bg-slate-50/30 dark:hover:bg-slate-850/10">
                    <td className="py-4 px-4 font-semibold text-sm text-gray-700 dark:text-gray-300">
                      <div className="flex items-center gap-1.5">
                        <span>{dayName}</span>
                        {isSaturday && (
                          <span className="px-1.5 py-0.5 text-[9px] font-bold rounded-md bg-amber-100 dark:bg-amber-900/40 text-amber-800 dark:text-amber-300">
                            Holiday
                          </span>
                        )}
                      </div>
                    </td>
                    {PERIODS.map(p => {
                      const slot = getSlot(dayName, p);
                      return (
                        <td key={p} className="py-3 px-3">
                          {slot ? (
                            <div className="p-3 bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100 dark:border-blue-900/30 rounded-xl relative group">
                              <h5 className="font-display font-bold text-blue-800 dark:text-blue-400 text-xs md:text-sm mb-1 line-clamp-1">
                                {slot.subject}
                              </h5>
                              
                              <div className="space-y-0.5 text-[10px] text-gray-500 dark:text-gray-400">
                                <span className="flex items-center gap-1">
                                  <User className="w-2.5 h-2.5" /> {slot.teacherName}
                                </span>
                                <span className="flex items-center gap-1">
                                  <MapPin className="w-2.5 h-2.5" /> {slot.room}
                                </span>
                                {!filterTeacherName && (
                                  <span className="text-[9px] font-semibold text-blue-600/80 dark:text-blue-500/80 block mt-1">
                                    {slot.classId}
                                  </span>
                                )}
                              </div>

                              {userRole === 'admin' && (
                                <button
                                  onClick={() => handleDeleteSlot(slot.id)}
                                  className="absolute top-2 right-2 p-1 bg-white dark:bg-slate-800 rounded-md border border-gray-100 dark:border-gray-700 text-rose-500 hover:text-rose-600 shadow-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                  title="Remove slot"
                                >
                                  <Trash2 className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="py-4 text-center text-xs text-gray-350 dark:text-gray-600 border border-dashed border-gray-100 dark:border-gray-800 rounded-xl">
                              Free Period
                            </div>
                          )}
                        </td>
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
        title={`Add Class Timetable Period (${selectedClass})`}
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
                {DAYS.map(d => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Period Number
              </label>
              <select
                value={period}
                onChange={e => {
                  const pNum = Number(e.target.value);
                  setPeriod(pNum);
                  // Auto fill time slot
                  if (pNum === 1) setTimeSlot('08:30 AM - 09:15 AM');
                  else if (pNum === 2) setTimeSlot('09:15 AM - 10:00 AM');
                  else if (pNum === 3) setTimeSlot('10:15 AM - 11:00 AM');
                  else if (pNum === 4) setTimeSlot('11:00 AM - 11:45 AM');
                }}
                className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-hidden text-sm"
              >
                {PERIODS.map(p => (
                  <option key={p} value={p}>Period {p}</option>
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
              placeholder="e.g., Nepali, English, Science"
              value={subject}
              onChange={e => setSubject(e.target.value)}
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-slate-900 text-gray-900 dark:text-white focus:outline-hidden text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">
                Teacher Name
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
                placeholder="e.g., Room 201, Chemistry Lab"
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
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-xl transition-all shadow-md shadow-blue-600/10 disabled:opacity-50"
            >
              {submitting ? 'Adding...' : 'Add to Schedule'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
