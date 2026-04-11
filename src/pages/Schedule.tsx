import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, BookOpen, Coffee, Zap, Moon, RefreshCcw, Mic, Trash2, X, ShieldAlert } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { checkTriggersAndRegenerate } from '../lib/scheduleGenerator';

export default function Schedule() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [events, setEvents] = useState<any[]>([]);
  const [monthlyEventDates, setMonthlyEventDates] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [popup, setPopup] = useState<{ title: string; message: string; type?: 'success' | 'error' | 'destroy'; panicLevel?: number } | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) {
        setUserId(user.id);
        fetchEventsForMonth(user.id, currentDate);
        fetchEventsForDate(user.id, new Date());
      }
    });
  }, []);

  /** Extract YYYY-MM-DD in local timezone from a UTC ISO timestamp string. */
  const utcToLocalDateStr = (isoStr: string) => {
    const d = new Date(isoStr);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const fetchEventsForMonth = async (uid: string, date: Date) => {
    // Use local midnight so the range covers the full calendar month in the user's timezone
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0).toISOString();
    const endOfMonth   = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59, 999).toISOString();

    const { data } = await supabase
      .from('schedule_events')
      .select('start_time')
      .eq('user_id', uid)
      .gte('start_time', startOfMonth)
      .lte('start_time', endOfMonth);

    if (data) {
      // FIX: convert each UTC timestamp to the local date string for dot indicators
      const dates = data.map(d => utcToLocalDateStr(d.start_time));
      setMonthlyEventDates([...new Set(dates)]);
    }
  };

  const fetchEventsForDate = async (uid: string, date: Date) => {
    setLoading(true);
    // FIX: build local midnight → local 23:59:59 boundaries.
    // new Date(y, m, d, 0, 0, 0) creates a LOCAL midnight; .toISOString() then gives
    // the correct UTC equivalent — so IST users at +5:30 get events from 18:30Z prev day.
    const startOfDay = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 0, 0, 0);
    const endOfDay   = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59, 999);

    const { data } = await supabase
      .from('schedule_events')
      .select('*')
      .eq('user_id', uid)
      .gte('start_time', startOfDay.toISOString())
      .lte('start_time', endOfDay.toISOString())
      .order('start_time', { ascending: true });

    setEvents(data || []);
    setLoading(false);
  };

  const handleDateClick = (dayNumber: number) => {
    const newDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
    setSelectedDate(newDate);
    if (userId) fetchEventsForDate(userId, newDate);
  };

  const nextMonth = () => {
    const next = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
    setCurrentDate(next);
    if (userId) fetchEventsForMonth(userId, next);
  };

  const prevMonth = () => {
    const prev = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
    setCurrentDate(prev);
    if (userId) fetchEventsForMonth(userId, prev);
  };

  const handleGenerate = async () => {
    if (!userId) return;
    setGenerating(true);
    try {
      // Clear ALL events before regenerating to avoid duplicates and ensure a clean slate
      await supabase
        .from('schedule_events')
        .delete()
        .eq('user_id', userId);

      const result = await checkTriggersAndRegenerate(userId);
      await fetchEventsForMonth(userId, currentDate);
      if (selectedDate) await fetchEventsForDate(userId, selectedDate);
      if (result) {
        setPopup({
          type: 'success',
          title: "QUANTUM SHIFT COMPLETE",
          message: `Successfully materialized ${result.eventsCount} events into your timeline.`,
          panicLevel: result.panicLevel
        });
      }
    } catch (e: any) {
      setPopup({ type: 'error', title: "GENERATION FAILED", message: e.message });
    }
    setGenerating(false);
  };

  const handleClear = async () => {
    if (!userId) return;
    setGenerating(true);
    setShowConfirm(false);
    try {
      await supabase.from('schedule_events').delete().eq('user_id', userId);
      setEvents([]);
      setMonthlyEventDates([]);
      setPopup({ type: 'destroy', title: "TIMELINE OBLITERATED", message: "Your schedule has been wiped clean. Pure slate." });
    } catch (e: any) {
      setPopup({ type: 'error', title: "ANOMALY DETECTED", message: e.message });
    }
    setGenerating(false);
  };

  // Topics are marked complete ONLY after a Viva session with a good score.
  // This navigates to the Viva page with the event/topic pre-loaded.
  const startViva = (eventId: string, topicId: string | null, topicTitle: string) => {
    const params = new URLSearchParams({
      eventId,
      topicId: topicId ?? '',
      topicTitle,
    });
    navigate(`/viva?${params.toString()}`);
  };

  const renderCalendarDays = () => {
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startOffset = startDate.getDay();
    const cells = [];
    const totalCells = Math.ceil((daysInMonth + startOffset) / 7) * 7;

    for (let i = 0; i < totalCells; i++) {
        const dayNumber = i - startOffset + 1;
        const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
        
        let isSelected = false;
        if (isCurrentMonth && selectedDate) {
          isSelected = selectedDate.getDate() === dayNumber && 
                       selectedDate.getMonth() === currentDate.getMonth() && 
                       selectedDate.getFullYear() === currentDate.getFullYear();
        }

        const currentIterDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), dayNumber);
        const tzOffset = currentIterDate.getTimezoneOffset() * 60000;
        const localISOTime = new Date(currentIterDate.getTime() - tzOffset).toISOString().split('T')[0];
        const hasEvents = isCurrentMonth && monthlyEventDates.includes(localISOTime);

        cells.push(
          <button
            key={i}
            onClick={() => isCurrentMonth && handleDateClick(dayNumber)}
            disabled={!isCurrentMonth}
            className={`h-24 md:h-32 border-2 border-black p-2 flex flex-col items-start transition-all relative ${isCurrentMonth ? 'bg-white hover:bg-yellow-50 active:translate-y-1' : 'bg-gray-100 opacity-50 cursor-not-allowed'} ${isSelected ? 'ring-4 ring-inset ring-primary bg-yellow-100' : ''}`}
          >
            {isCurrentMonth && (
              <>
                <span className={`font-black text-xl ${isSelected ? 'text-primary drop-shadow-[1px_1px_0_rgba(0,0,0,1)]' : ''}`}>
                  {dayNumber}
                </span>
                {hasEvents && (
                  <div className="absolute bottom-2 left-2 flex gap-1">
                    <div className="w-3 h-3 bg-red-500 border-2 border-black rotate-45"></div>
                    <div className="w-3 h-3 bg-accent border-2 border-black rounded-full"></div>
                  </div>
                )}
              </>
            )}
          </button>
        );
    }
    return cells;
  };

  const monthName = currentDate.toLocaleString('default', { month: 'short', year: 'numeric' }).toUpperCase();
  const selectedDateStr = selectedDate ? selectedDate.toLocaleString('default', { month: 'short', day: 'numeric' }).toUpperCase() : '';

  const getCategoryIcon = (cat: string) => {
    switch (cat) {
      case 'FOCUS': return BookOpen;
      case 'VIVA': return Zap;
      case 'BREAK': return Coffee;
      case 'ADMIN': return Clock;
      case 'ROUTINE': return Coffee;
      case 'LEISURE': return Moon;
      default: return Clock;
    }
  };

  return (
    <div className="page-shell">
      <div className="grid items-start gap-5 lg:grid-cols-[1.25fr,0.75fr]">     
      <div className="w-full min-w-0">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title flex items-center gap-3">
              <CalendarIcon className="h-9 w-9" strokeWidth={3} />
              Quantum Scheduler
            </h1>
            <p className="page-subtitle">{monthName} // Real-time DB Sync</p>
          </div>
          <div className="flex gap-2">
                <button onClick={() => setShowConfirm(true)} disabled={generating}
                className="btn-brutal flex items-center justify-center bg-red-500 text-white font-bold p-3 border-2 border-black active:translate-y-1 hover:bg-red-600" title="Wipe Old Schedule">
                <Trash2 className="w-5 h-5 text-white stroke-[3px]" />
              </button>
              <button onClick={handleGenerate} disabled={generating} className="btn-brutal flex items-center gap-2 bg-accent text-black font-bold px-3 border-2 border-black active:translate-y-1">
              {generating ? <RefreshCcw className="animate-spin w-5 h-5"/> : <Zap className="w-5 h-5"/>} 
              <span className="hidden sm:inline">{generating ? 'Mapping...' : 'Generate 15 Days'}</span>
            </button>
            <button onClick={prevMonth} className="btn-brutal bg-white p-3"><ChevronLeft strokeWidth={3} /></button>
            <button onClick={nextMonth} className="btn-brutal bg-white p-3"><ChevronRight strokeWidth={3} /></button>
          </div>
        </div>
        <div className="card-brutal p-0 overflow-hidden bg-white">
          <div className="grid grid-cols-7 border-b-4 border-black bg-secondary text-center">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => <div key={day} className="py-2 font-black uppercase tracking-widest border-r-2 border-black last:border-r-0 text-xs sm:text-sm">{day}</div>)}
          </div>
          <div className="grid grid-cols-7 gap-[2px] bg-black p-[2px]">{renderCalendarDays()}</div>
        </div>
      </div>
      <div className="w-full min-w-0 lg:sticky lg:top-6">
        <div className="card-brutal bg-white flex flex-col">
          <div className="mb-4 border-b-4 border-black pb-4">
            <h2 className="text-2xl font-black uppercase tracking-tight">{selectedDateStr || 'Select a date'}</h2>
          </div>
          <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1 lg:max-h-[calc(100vh-16rem)]">
            {loading ? (
               <div className="h-full flex items-center justify-center font-bold text-gray-400 uppercase tracking-widest">Loading...</div>
            ) : events.length > 0 ? events.map((item, idx) => {
              const Icon = getCategoryIcon(item.category);
              const timeStr = new Date(item.start_time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
              const isFocus = item.category === 'FOCUS';
              return (
                <div key={item.id} className={`flex items-center justify-between gap-3 p-3 border-2 border-black transition-all ${isFocus ? 'bg-primary shadow-brutal-sm' : 'bg-white'} ${item.completed ? 'opacity-50 grayscale' : ''}`}>
                  <div className="flex gap-3 w-full">
                      <div className="w-16 whitespace-nowrap font-black text-lg self-center">{timeStr}</div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold flex items-start gap-2 text-sm sm:text-base pr-2 break-words">
                           <Icon className="w-4 h-4 sm:w-5 sm:h-5 shrink-0 mt-1" strokeWidth={3} />
                           <span className="text-wrap break-words">{item.title}</span>
                        </h4>
                        <span className="mt-1 block text-[11px] font-bold uppercase tracking-widest text-gray-500">
                          {item.category}
                          {item.completed && <span className="text-green-600 ml-2">DONE</span>}
                        </span>
                      </div>
                  </div>
                  {(isFocus || item.category === 'VIVA') && !item.completed && (
                    <button
                        onClick={() => startViva(item.id, item.topic_id, item.title.replace(/^\[.*?\]\s*/, '').replace('Study: ', ''))}
                      className="shrink-0 flex items-center gap-1 px-3 py-2 border-2 border-black bg-black text-white font-bold uppercase text-xs hover:bg-primary hover:text-black transition-colors"
                    >
                      <Mic className="w-3 h-3" strokeWidth={3} /> Viva
                    </button>
                  )}
                  {item.completed && (
                    <span className="shrink-0 text-xs font-bold uppercase text-green-700 border-2 border-green-700 px-2 py-1">Done ✓</span>
                  )}
                </div>
              );
            }) : (
              <div className="h-full flex flex-col gap-3 items-center justify-center py-10 font-bold text-gray-400 uppercase tracking-widest text-center">
                <Moon className="w-12 h-12 opacity-50 mb-2" />
                No events for this date.
              </div>
            )}
          </div>
        </div>
      </div>
      </div>
      {popup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className={`card-brutal w-full max-w-md p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)] ${
            popup.type === 'error' ? 'bg-red-500 text-white' :
            popup.type === 'destroy' ? 'bg-black text-white' : 'bg-primary text-black'
          }`}>
            <div className="flex justify-between items-start gap-4 mb-4 border-b-4 border-current pb-4">
              <h2 className="text-2xl font-black uppercase flex items-center gap-3 leading-tight">
                {popup.type === 'error' ? <ShieldAlert className="w-8 h-8 shrink-0"/> : popup.type === 'destroy' ? <Trash2 className="w-8 h-8 shrink-0 text-red-500"/> : <Zap className="w-8 h-8 shrink-0"/>}
                <span>{popup.title}</span>
              </h2>
              <button onClick={() => setPopup(null)} className="btn-brutal bg-white text-black p-2 hover:bg-gray-200 shrink-0 border-4 border-black transition-transform hover:scale-105 active:scale-95 shadow-[4px_4px_0px_rgba(0,0,0,1)]">
                <X className="w-6 h-6" strokeWidth={4} />
              </button>
            </div>
            
            <p className="font-bold text-lg leading-snug mb-6 opacity-90">{popup.message}</p>

            {popup.panicLevel !== undefined && (
              <div className="flex items-center gap-3 bg-white text-black p-3 border-4 border-black font-bold mb-6">
                 <span className="uppercase tracking-widest shrink-0 text-sm">Panic Level:</span>
                 <div className="flex flex-1 h-4 bg-gray-200 border-2 border-black overflow-hidden relative shadow-[inset_2px_2px_0px_rgba(0,0,0,0.2)]">
                   <div className="h-full bg-red-500 transition-all duration-500" style={{ width: `${(popup.panicLevel / 5) * 100}%`}}></div>
                 </div>
                 <span className="text-sm font-black">{popup.panicLevel}/5</span>
              </div>
            )}

            <button 
              onClick={() => setPopup(null)}
              className="w-full btn-brutal bg-white text-black py-4 text-xl font-bold uppercase transition-transform hover:-translate-y-1 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
            >
              Acknowledge
            </button>
          </div>
        </div>
      )}

      {showConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="card-brutal bg-white w-full max-w-md p-6 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
            <h2 className="text-3xl font-black uppercase flex items-center gap-3 mb-4 border-b-4 border-black pb-4 text-black">
              <Trash2 className="w-8 h-8 text-red-500" strokeWidth={3} /> Wipe Schedule?
            </h2>
            <p className="font-bold text-gray-700 text-lg mb-6 leading-tight">
              This will obliterate your generated calendar. It does not affect your Knowledge Tree stats.
            </p>
            <div className="flex gap-4">
              <button 
                onClick={() => setShowConfirm(false)}
                className="flex-1 btn-brutal bg-gray-200 border-4 border-black text-black py-4 text-xl font-bold uppercase transition hover:bg-gray-300 hover:translate-y-1"
              >
                Cancel
              </button>
              <button 
                onClick={handleClear}
                className="flex-1 btn-brutal bg-black border-4 border-black text-white py-4 text-xl font-bold uppercase transition hover:bg-red-600 hover:translate-y-1 shadow-[4px_4px_0px_rgba(0,0,0,1)]"
              >
                Erase
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 
