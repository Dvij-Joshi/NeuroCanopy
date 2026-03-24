import React, { useState } from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Clock, BookOpen, Coffee, Zap, Moon } from 'lucide-react';

// Mock schedule data for a selected day
const MOCK_DAY_SCHEDULE = [
  { time: '07:00', type: 'routine', title: 'System Boot (Wake & Hydrate)', icon: Zap },
  { time: '08:00', type: 'focus', title: 'Deep Work: OS Memory Management', icon: BookOpen },
  { time: '10:00', type: 'break', title: 'Context Switch (Break)', icon: Coffee },
  { time: '10:30', type: 'focus', title: 'Deep Work: Paging & Segmentation', icon: BookOpen },
  { time: '12:30', type: 'routine', title: 'Refuel (Lunch)', icon: Coffee },
  { time: '13:30', type: 'viva', title: 'AI Voice Viva: OS Concepts', icon: Zap, highlight: true },
  { time: '14:30', type: 'admin', title: 'Email & Triage', icon: Clock },
  { time: '16:00', type: 'focus', title: 'Algorithm Practice', icon: BookOpen },
  { time: '23:00', type: 'routine', title: 'Forced Shutdown', icon: Moon },
];

export default function Schedule() {
  const [selectedDate, setSelectedDate] = useState<number | null>(15);
  
  // Quick mock for a monthly grid (35 cells: 5 weeks)
  const daysInMonth = 31;
  const startOffset = 3; // Starts on a Wednesday for example
  
  const renderCalendarDays = () => {
    const cells = [];
    for (let i = 0; i < 35; i++) {
      const dayNumber = i - startOffset + 1;
      const isCurrentMonth = dayNumber > 0 && dayNumber <= daysInMonth;
      const isSelected = dayNumber === selectedDate;
      const hasEvents = [5, 12, 15, 18, 22, 28].includes(dayNumber);

      cells.push(
        <button
          key={i}
          onClick={() => isCurrentMonth && setSelectedDate(dayNumber)}
          disabled={!isCurrentMonth}
          className={`
            h-24 md:h-32 border-2 border-black p-2 flex flex-col items-start transition-all relative
            ${isCurrentMonth ? 'bg-white hover:bg-yellow-50 active:translate-y-1' : 'bg-gray-100 opacity-50 cursor-not-allowed'}
            ${isSelected ? 'ring-4 ring-inset ring-primary bg-yellow-100' : ''}
          `}
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

  return (
    <div className="page-shell">
      <div className="grid items-start gap-5 lg:grid-cols-[1.25fr,0.75fr]">
      
      {/* Left Side: Monthly Calendar */}
      <div className="w-full">
        <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="page-title flex items-center gap-3">
              <CalendarIcon className="h-9 w-9" strokeWidth={3} />
              Quantum Scheduler
            </h1>
            <p className="page-subtitle">November 2026 // Panic Level: 3</p>
          </div>
          
          <div className="flex gap-2">
            <button className="btn-brutal bg-white p-3"><ChevronLeft strokeWidth={3} /></button>
            <button className="btn-brutal bg-white p-3"><ChevronRight strokeWidth={3} /></button>
          </div>
        </div>

        <div className="card-brutal p-0 overflow-hidden bg-white">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 border-b-4 border-black bg-secondary text-center">
            {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
              <div key={day} className="py-2 font-black uppercase tracking-widest border-r-2 border-black last:border-r-0 text-xs sm:text-sm">
                {day}
              </div>
            ))}
          </div>
          
          {/* Calendar Grid */}
          <div className="grid grid-cols-7 gap-0 bg-black gap-[2px] p-[2px]">
            {renderCalendarDays()}
          </div>
        </div>
      </div>

      {/* Right Side: Day-wise Schedule Panel */}
      <div className="w-full lg:sticky lg:top-6">
        <div className="card-brutal bg-white flex flex-col">
          
          <div className="mb-4 border-b-4 border-black pb-4">
            <h2 className="text-2xl font-black uppercase tracking-tight">
              {selectedDate ? `NOV ${selectedDate}` : 'Select a date'}
            </h2>
            <div className="mt-3 flex flex-wrap gap-2">
               <span className="px-3 py-1 bg-red-100 border-2 border-black font-bold text-xs uppercase">Focus: 4h</span>
               <span className="px-3 py-1 bg-blue-100 border-2 border-black font-bold text-xs uppercase">Viva: 1h</span>
            </div>
          </div>

          <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1 lg:max-h-[calc(100vh-16rem)]">
            {selectedDate ? MOCK_DAY_SCHEDULE.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className={`
                  flex gap-3 p-3 border-2 border-black
                  ${item.highlight ? 'bg-primary shadow-brutal-sm -translate-y-1' : 'bg-white'}
                `}>
                  <div className="w-16 whitespace-nowrap font-black text-lg">
                    {item.time}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-bold flex items-center gap-2 text-sm sm:text-base">
                       <Icon className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={3} />
                       {item.title}
                    </h4>
                    <span className="mt-1 block text-[11px] font-bold uppercase tracking-widest text-gray-500">
                      {item.type}
                    </span>
                  </div>
                </div>
              );
            }) : (
              <div className="h-full flex items-center justify-center font-bold text-gray-400 uppercase tracking-widest text-center">
                Awaiting Target Date Selection
              </div>
            )}
          </div>

        </div>
      </div>
      </div>
    </div>
  );
}
