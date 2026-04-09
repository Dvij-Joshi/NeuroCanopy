import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Network, ArrowRight, ArrowLeft, CheckCircle2, User, Brain, Activity, BookOpen, Clock, Layers, Upload, Plus } from 'lucide-react';

const STEPS = [
  { id: 1, title: 'Account', icon: User, desc: 'Login details' },
  { id: 2, title: 'Identity & Cognitive', icon: Brain, desc: 'Who are you?' },
  { id: 3, title: 'Bio-Rhythms', icon: Activity, desc: 'Daily energy cycles' },
  { id: 4, title: 'Academics', icon: BookOpen, desc: 'Schedule & Exams' },
  { id: 5, title: 'Logistics', icon: Clock, desc: 'Living & overhead' },
  { id: 6, title: 'Materials & Lifestyle', icon: Layers, desc: 'Syllabus & anchors' },
];

const toMinutes = (time: string) => {
  const [hours, minutes] = time.split(':').map(Number);
  return (hours || 0) * 60 + (minutes || 0);
};

const toTimeString = (minutes: number) => {
  const safe = Math.max(0, Math.min(minutes, 23 * 60 + 59));
  const h = Math.floor(safe / 60)
    .toString()
    .padStart(2, '0');
  const m = (safe % 60).toString().padStart(2, '0');
  return `${h}:${m}`;
};

const addMinutes = (time: string, delta: number) => toTimeString(toMinutes(time) + delta);

export default function Register() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);

  // Quick State Mocks for Interactive Feel
  const [energyPattern, setEnergyPattern] = useState('Standard');
  const [maxFocus, setMaxFocus] = useState('45 min');
  const [livingStatus, setLivingStatus] = useState('Day Scholar');
  const [lifestyleAnchors, setLifestyleAnchors] = useState(['Gym']);
  const [dailyAdminBuffer, setDailyAdminBuffer] = useState(60);
  const [commuteDuration, setCommuteDuration] = useState(45);
  const [choresErrands, setChoresErrands] = useState(45);
  const [socialLeisure, setSocialLeisure] = useState(120);
  const [subjects, setSubjects] = useState(['Maths', 'Operating Systems', 'Data Structures']);
  const [newSubject, setNewSubject] = useState('');
  const [collegeStart, setCollegeStart] = useState('09:00');
  const [collegeEnd, setCollegeEnd] = useState('16:00');
  const [weekendCollegeStart, setWeekendCollegeStart] = useState('10:00');
  const [weekendCollegeEnd, setWeekendCollegeEnd] = useState('14:00');

  const nextStep = () => setCurrentStep(prev => Math.min(prev + 1, STEPS.length));
  const prevStep = () => setCurrentStep(prev => Math.max(prev - 1, 1));
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentStep < STEPS.length) {
      nextStep();
    } else {
      navigate('/dashboard');
    }
  };

  const toggleAnchor = (anchor: string) => {
    setLifestyleAnchors(prev => prev.includes(anchor) ? prev.filter(a => a !== anchor) : [...prev, anchor]);
  };

  const enforceWeekendRange = (
    proposedStart: string,
    proposedEnd: string,
    regularStart: string,
    regularEnd: string
  ) => {
    const regularDuration = Math.max(60, toMinutes(regularEnd) - toMinutes(regularStart));
    const maxWeekendDuration = Math.max(30, regularDuration - 30);

    let startMins = toMinutes(proposedStart);
    let endMins = toMinutes(proposedEnd);

    if (endMins <= startMins) {
      endMins = startMins + Math.min(60, maxWeekendDuration);
    }

    if (endMins - startMins > maxWeekendDuration) {
      endMins = startMins + maxWeekendDuration;
    }

    if (endMins - startMins >= regularDuration) {
      endMins = startMins + maxWeekendDuration;
    }

    if (endMins > 23 * 60 + 59) {
      endMins = 23 * 60 + 59;
      startMins = Math.max(0, endMins - maxWeekendDuration);
    }

    return {
      start: toTimeString(startMins),
      end: toTimeString(endMins),
    };
  };

  const handleCollegeStartChange = (nextStart: string) => {
    const safeEnd = toMinutes(nextStart) >= toMinutes(collegeEnd) ? addMinutes(nextStart, 60) : collegeEnd;
    setCollegeStart(nextStart);
    if (safeEnd !== collegeEnd) {
      setCollegeEnd(safeEnd);
    }

    const adjustedWeekend = enforceWeekendRange(weekendCollegeStart, weekendCollegeEnd, nextStart, safeEnd);
    setWeekendCollegeStart(adjustedWeekend.start);
    setWeekendCollegeEnd(adjustedWeekend.end);
  };

  const handleCollegeEndChange = (nextEnd: string) => {
    const safeEnd = toMinutes(nextEnd) <= toMinutes(collegeStart) ? addMinutes(collegeStart, 60) : nextEnd;
    if (safeEnd !== nextEnd) {
      setCollegeEnd(safeEnd);
    } else {
      setCollegeEnd(nextEnd);
    }

    const adjustedWeekend = enforceWeekendRange(weekendCollegeStart, weekendCollegeEnd, collegeStart, safeEnd);
    setWeekendCollegeStart(adjustedWeekend.start);
    setWeekendCollegeEnd(adjustedWeekend.end);
  };

  const handleWeekendCollegeStartChange = (nextStart: string) => {
    const adjustedWeekend = enforceWeekendRange(nextStart, weekendCollegeEnd, collegeStart, collegeEnd);
    setWeekendCollegeStart(adjustedWeekend.start);
    setWeekendCollegeEnd(adjustedWeekend.end);
  };

  const handleWeekendCollegeEndChange = (nextEnd: string) => {
    const adjustedWeekend = enforceWeekendRange(weekendCollegeStart, nextEnd, collegeStart, collegeEnd);
    setWeekendCollegeStart(adjustedWeekend.start);
    setWeekendCollegeEnd(adjustedWeekend.end);
  };

  const handleSubjectAdd = () => {
    const cleaned = newSubject.trim();
    if (!cleaned) return;
    setSubjects((prev) => (prev.includes(cleaned) ? prev : [...prev, cleaned]));
    setNewSubject('');
  };

  const removeSubject = (subject: string) => {
    setSubjects((prev) => prev.filter((item) => item !== subject));
  };

  return (
    <div className="manga-shell min-h-screen flex">
      <div className="manga-grain" aria-hidden="true" />
      <div className="manga-speed-lines hidden lg:block" aria-hidden="true" />

      {/* Left Sidebar - Progress */}
      <div className="relative hidden w-1/3 flex-col overflow-hidden border-r-4 border-black bg-[#ffd43b] p-12 lg:flex">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 2px 2px, rgba(0,0,0,0.38) 2px, transparent 0), linear-gradient(135deg, rgba(255,255,255,0.18) 0 50%, transparent 50% 100%)',
            backgroundSize: '18px 18px, 100% 100%',
            opacity: 0.22,
          }}
        >
        </div>
        <div className="absolute -left-16 top-10 h-56 w-56 rounded-full border-4 border-black bg-white/30" aria-hidden="true" />
        <div className="absolute bottom-[-4rem] right-[-3rem] h-80 w-80 rounded-full border-4 border-black bg-accent/25" aria-hidden="true" />
        
        <div className="relative z-10 flex-1 flex flex-col">
          <div className="flex items-center gap-3 mb-10">
            <div className="p-2 bg-black text-white border-2 border-black">
              <Network className="w-8 h-8" strokeWidth={3} />
            </div>
            <span className="text-3xl font-black uppercase tracking-tighter bg-white px-2 border-2 border-black shadow-brutal-sm">
              NeuroCanopy
            </span>
          </div>

          <h2 className="text-5xl font-black uppercase tracking-tight mb-6 leading-none bg-white inline-block p-2 border-4 border-black shadow-brutal w-max -rotate-2">
            Protocol<br/>Init
          </h2>
          <p className="font-bold text-xl mb-10 bg-black text-white p-3 border-2 border-black">
            System requires absolute behavioral cloning to enforce efficiency.
          </p>

          <div className="flex flex-col gap-4 flex-1">
            {STEPS.map((step) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isPast = currentStep > step.id;

              return (
                <div key={step.id} className="flex items-center gap-4">
                  <div className={`
                    w-10 h-10 flex items-center justify-center border-4 border-black font-black
                    ${isActive ? 'bg-accent text-white scale-110 shadow-[4px_4px_0px_rgba(0,0,0,1)]' : ''}
                    ${isPast ? 'bg-white text-black' : ''}
                    ${!isActive && !isPast ? 'bg-transparent text-black/40 border-black/40' : 'transition-all'}
                  `}>
                    {isPast ? <CheckCircle2 strokeWidth={3} className="w-6 h-6" /> : <Icon strokeWidth={3} className="w-5 h-5" />}
                  </div>
                  <div>
                    <h3 className={`text-xl font-black uppercase tracking-tight ${isActive ? 'bg-white px-1 border-2 border-black' : 'text-black/60'}`}>
                      {step.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Right Content - Forms */}
      <div className="relative flex-1 overflow-hidden bg-[#faf9f6] p-4 sm:p-6 lg:p-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'repeating-linear-gradient(0deg, transparent, transparent 19px, rgba(0,0,0,0.05) 19px, rgba(0,0,0,0.05) 20px), radial-gradient(circle at 1.5px 1.5px, rgba(0,0,0,0.08) 1.5px, transparent 0)',
            backgroundSize: '20px 20px, 24px 24px',
          }}
        />
        <div className="absolute -right-10 top-12 h-40 w-40 rounded-full border-4 border-black bg-secondary/30" aria-hidden="true" />
        <div className="absolute bottom-[-3rem] left-[-2rem] h-72 w-72 rounded-full border-4 border-black bg-primary/20" aria-hidden="true" />
        
        <div className="relative z-10 mx-auto w-full max-w-5xl">
          
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
             <div className="manga-banner bg-black px-4 py-2 text-white">
               Step 0{currentStep} / 0{STEPS.length}
             </div>
             {currentStep > 1 && (
               <button type="button" onClick={prevStep} className="font-bold flex items-center gap-2 hover:bg-black hover:text-white px-3 py-1 border-2 border-transparent hover:border-black transition-colors">
                 <ArrowLeft className="w-5 h-5" /> Back
               </button>
             )}
          </div>

          <form onSubmit={handleSubmit} className="manga-card bg-white p-5 sm:p-7 lg:p-9">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black uppercase tracking-tight mb-2">
              {STEPS[currentStep - 1].title}
            </h1>
            <p className="font-bold text-gray-500 mb-6 pb-4 border-b-4 border-black">
              {STEPS[currentStep - 1].desc}
            </p>

            <div className="space-y-7 pb-2">
              
              {/* STEP 1: ACCOUNT */}
              {currentStep === 1 && (
                <div className="space-y-6">
                   <div className="space-y-2">
                     <label className="font-black uppercase tracking-wider text-sm block">University Email</label>
                     <input type="email" placeholder="you@university.edu" className="input-brutal w-full text-base sm:text-lg" autoFocus required />
                   </div>
                   <div className="space-y-2">
                     <label className="font-black uppercase tracking-wider text-sm block">Password</label>
                     <input type="password" placeholder="••••••••" className="input-brutal w-full text-base sm:text-lg" required />
                   </div>
                   <div className="space-y-2">
                     <label className="font-black uppercase tracking-wider text-sm block">Confirm Password</label>
                     <input type="password" placeholder="••••••••" className="input-brutal w-full text-base sm:text-lg" required />
                   </div>
                   <div className="pt-4">
                      <p className="font-bold text-sm text-center">Already synced? <span className="text-accent underline font-black cursor-pointer" onClick={() => navigate('/login')}>Sign in</span></p>
                   </div>
                </div>
              )}

              {/* STEP 2: IDENTITY */}
              {currentStep === 2 && (
                <div className="space-y-4 sm:space-y-6 lg:space-y-8">
                   <div className="flex flex-col sm:flex-row gap-3 sm:gap-6 items-center bg-gray-50 p-3 sm:p-4 border-4 border-black">
                     <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gray-200 border-4 border-black flex items-center justify-center shrink-0 hover:bg-primary cursor-pointer transition-colors">
                       <Upload className="w-6 h-6 sm:w-8 sm:h-8" />
                     </div>
                     <div className="text-center sm:text-left">
                       <p className="font-black uppercase text-sm sm:text-base">Upload Avatar (Opt)</p>
                       <p className="text-xs sm:text-sm font-bold text-gray-500">Max 2MB</p>
                     </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                     <div className="space-y-2">
                       <label className="font-black uppercase tracking-wider text-sm block">Full Name</label>
                       <input type="text" placeholder="John Doe" className="input-brutal w-full" required />
                     </div>
                     <div className="space-y-2">
                       <label className="font-black uppercase tracking-wider text-sm block">University</label>
                       <input type="text" placeholder="MIT" className="input-brutal w-full" required />
                     </div>
                     <div className="space-y-2">
                       <label className="font-black uppercase tracking-wider text-sm block">Major</label>
                       <input type="text" placeholder="Computer Science" className="input-brutal w-full" required />
                     </div>
                     <div className="space-y-2">
                       <label className="font-black uppercase tracking-wider text-sm block">Academic Year</label>
                       <select className="input-brutal w-full font-bold">
                         <option>Year 1</option><option>Year 2</option><option>Year 3</option><option>Year 4</option><option>Year 5</option>
                       </select>
                     </div>
                   </div>
                   
                   <div className="space-y-4 pt-4 border-t-4 border-black">
                     <label className="font-black uppercase tracking-wider text-lg block">Cognitive Profile</label>
                     
                     <div className="space-y-2">
                       <p className="font-bold text-sm">Energy Pattern</p>
                       <div className="flex flex-col sm:flex-row gap-2">
                         {['Early Bird', 'Standard', 'Night Owl'].map(opt => (
                           <button type="button" key={opt} onClick={() => setEnergyPattern(opt)} className={`flex-1 py-2 px-2 sm:px-4 text-xs sm:text-sm font-bold uppercase border-4 border-black ${energyPattern === opt ? 'bg-primary translate-y-1' : 'bg-white hover:bg-gray-100 shadow-[4px_4px_0px_rgba(0,0,0,1)]'}`}>
                             {opt}
                           </button>
                         ))}
                       </div>
                     </div>

                     <div className="space-y-2 pt-2">
                       <p className="font-bold text-sm">Max Focus Duration</p>
                       <div className="flex gap-2">
                         {['25 min', '45 min', '90 min'].map(opt => (
                           <button type="button" key={opt} onClick={() => setMaxFocus(opt)} className={`flex-1 py-2 font-bold uppercase border-4 border-black ${maxFocus === opt ? 'bg-accent text-white translate-y-1' : 'bg-white hover:bg-gray-100 shadow-[4px_4px_0px_rgba(0,0,0,1)]'}`}>
                             {opt}
                           </button>
                         ))}
                       </div>
                     </div>
                   </div>
                </div>
              )}

              {/* STEP 3: BIO-RHYTHMS */}
              {currentStep === 3 && (
                <div className="space-y-8">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                     <div className="space-y-2">
                       <label className="font-black uppercase tracking-wider text-sm block">Wake Up Time</label>
                       <input type="time" defaultValue="07:00" className="input-brutal w-full text-2xl text-center" required />
                     </div>
                     <div className="space-y-2">
                       <label className="font-black uppercase tracking-wider text-sm block">Bedtime</label>
                       <input type="time" defaultValue="23:30" className="input-brutal w-full text-2xl text-center" required />
                     </div>
                   </div>

                   <div className="space-y-4 p-6 bg-secondary border-4 border-black mt-8">
                     <label className="font-black uppercase tracking-wider text-lg block">Daily Life Admin Buffer</label>
                     <p className="font-bold text-sm mb-4">Time spent eating, showering, surviving.</p>
                     <input
                       type="range"
                       min="30"
                       max="180"
                       step="15"
                       value={dailyAdminBuffer}
                       onChange={(e) => setDailyAdminBuffer(Number(e.target.value))}
                       className="range-brutal"
                     />
                     <div className="mt-3 flex justify-between text-sm font-black">
                       <span>30 min</span>
                       <span className="border-2 border-black bg-white px-2 py-1">{dailyAdminBuffer} min</span>
                       <span>180 min</span>
                     </div>
                   </div>
                </div>
              )}

              {/* STEP 4: ACADEMICS */}
              {currentStep === 4 && (
                <div className="space-y-8">
                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                     <div className="space-y-2">
                       <label className="font-black uppercase tracking-wider text-xs sm:text-sm block">College Start</label>
                       <input type="time" value={collegeStart} onChange={(e) => handleCollegeStartChange(e.target.value)} className="input-brutal w-full" />
                     </div>
                     <div className="space-y-2">
                       <label className="font-black uppercase tracking-wider text-xs sm:text-sm block">College End</label>
                       <input type="time" value={collegeEnd} onChange={(e) => handleCollegeEndChange(e.target.value)} className="input-brutal w-full" />
                     </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-6">
                     <div className="space-y-2">
                       <label className="font-black uppercase tracking-wider text-xs sm:text-sm block">Weekend College Start</label>
                       <input type="time" value={weekendCollegeStart} onChange={(e) => handleWeekendCollegeStartChange(e.target.value)} className="input-brutal w-full" />
                     </div>
                     <div className="space-y-2">
                       <label className="font-black uppercase tracking-wider text-xs sm:text-sm block">Weekend College End</label>
                       <input type="time" value={weekendCollegeEnd} onChange={(e) => handleWeekendCollegeEndChange(e.target.value)} className="input-brutal w-full" />
                     </div>
                   </div>

                   <div className="border-4 border-black bg-[#fff7d1] px-4 py-3">
                     <p className="text-[11px] font-black uppercase tracking-wider text-black">
                       Weekend college timing is automatically kept shorter than regular day college timing.
                     </p>
                   </div>

                   <div className="space-y-3">
                     <label className="font-black uppercase tracking-wider text-sm block">Subjects</label>
                     <div className="flex gap-2">
                       <input
                         value={newSubject}
                         onChange={(e) => setNewSubject(e.target.value)}
                         onKeyDown={(e) => {
                           if (e.key === 'Enter') {
                             e.preventDefault();
                             handleSubjectAdd();
                           }
                         }}
                         type="text"
                         placeholder="Add subject (e.g., Physics)"
                         className="input-brutal w-full"
                       />
                       <button type="button" onClick={handleSubjectAdd} className="btn-brutal bg-accent text-white px-4">
                         Add
                       </button>
                     </div>
                     <div className="flex gap-2 flex-wrap mt-1">
                        {subjects.map(sub => (
                          <button
                            key={sub}
                            type="button"
                            onClick={() => removeSubject(sub)}
                            className="px-3 py-1 bg-yellow-200 border-2 border-black font-bold text-xs uppercase hover:bg-yellow-300"
                            title="Remove subject"
                          >
                            {sub} x
                          </button>
                        ))}
                     </div>
                   </div>

                   <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                     <div className="space-y-2">
                       <label className="font-black uppercase tracking-wider text-xs sm:text-sm block">Next Big Exam</label>
                       <input type="date" className="input-brutal w-full text-sm" />
                     </div>
                     <div className="space-y-2">
                       <label className="font-black uppercase tracking-wider text-xs sm:text-sm block">Min Attendance %</label>
                       <input type="number" defaultValue="75" className="input-brutal w-full text-sm" />
                     </div>
                   </div>
                </div>
              )}

              {/* STEP 5: LOGISTICS */}
              {currentStep === 5 && (
                <div className="space-y-8">
                   
                   <div className="flex rounded-none border-4 border-black p-1 bg-gray-100">
                     <button type="button" onClick={() => setLivingStatus('Hosteler')} className={`flex-1 py-2 sm:py-3 font-black uppercase text-xs sm:text-sm lg:text-lg ${livingStatus === 'Hosteler' ? 'bg-primary border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]' : ''}`}>Hosteler</button>
                     <button type="button" onClick={() => setLivingStatus('Day Scholar')} className={`flex-1 py-2 sm:py-3 font-black uppercase text-xs sm:text-sm lg:text-lg ${livingStatus === 'Day Scholar' ? 'bg-primary border-4 border-black shadow-[4px_4px_0px_rgba(0,0,0,1)]' : ''}`}>Day Scholar</button>
                   </div>

                   {livingStatus === 'Hosteler' ? (
                     <div className="space-y-4 p-4 border-4 border-black bg-white">
                        <label className="font-black uppercase tracking-wider text-sm block">Mess Timings</label>
                        <div className="grid grid-cols-3 gap-2">
                          <input type="time" defaultValue="08:00" className="input-brutal text-sm" title="Breakfast" />
                          <input type="time" defaultValue="13:00" className="input-brutal text-sm" title="Lunch" />
                          <input type="time" defaultValue="20:00" className="input-brutal text-sm" title="Dinner" />
                        </div>
                     </div>
                   ) : (
                     <div className="space-y-4 p-4 border-4 border-black bg-white">
                        <label className="font-black uppercase tracking-wider text-sm block">Commute Duration (One-way)</label>
                        <input
                          type="range"
                          min="10"
                          max="120"
                          step="5"
                          value={commuteDuration}
                          onChange={(e) => setCommuteDuration(Number(e.target.value))}
                          className="range-brutal"
                        />
                        <div className="text-center font-black">{commuteDuration} min</div>
                     </div>
                   )}

                   <div className="space-y-6 pt-4 border-t-4 border-black border-dashed">
                      <label className="font-black uppercase tracking-wider text-lg block">Time Overhead</label>
                      
                      <div>
                        <p className="font-bold text-sm mb-2">Chores & Errands (0-180m)</p>
                        <input
                          type="range"
                          min="0"
                          max="180"
                          step="5"
                          value={choresErrands}
                          onChange={(e) => setChoresErrands(Number(e.target.value))}
                          className="range-brutal"
                        />
                        <p className="mt-2 text-right text-xs font-black uppercase tracking-wider">{choresErrands} min</p>
                      </div>
                      <div>
                        <p className="font-bold text-sm mb-2">Social & Leisure (0-240m)</p>
                        <input
                          type="range"
                          min="0"
                          max="240"
                          step="5"
                          value={socialLeisure}
                          onChange={(e) => setSocialLeisure(Number(e.target.value))}
                          className="range-brutal"
                        />
                        <p className="mt-2 text-right text-xs font-black uppercase tracking-wider">{socialLeisure} min</p>
                      </div>
                   </div>
                </div>
              )}

              {/* STEP 6: MATERIALS */}
              {currentStep === 6 && (
                <div className="space-y-8">
                   <div className="space-y-4">
                     <label className="font-black uppercase tracking-wider text-lg block border-b-4 border-black pb-2">Upload Syllabus</label>
                     {subjects.map(sub => (
                       <div key={sub} className="flex justify-between items-center bg-gray-50 border-4 border-black p-3 hover:bg-primary transition-colors cursor-pointer group">
                         <span className="font-bold uppercase tracking-widest">{sub}</span>
                         <span className="bg-black text-white px-3 py-1 text-xs font-black uppercase group-hover:bg-white group-hover:text-black border-2 border-transparent group-hover:border-black">Upload PDF</span>
                       </div>
                     ))}
                   </div>

                   <div className="space-y-4 pt-6">
                     <label className="font-black uppercase tracking-wider text-lg block border-b-4 border-black pb-2">Lifestyle Anchors</label>
                     <div className="flex flex-wrap gap-2 sm:gap-3">
                       {['Gym', 'Sports', 'Music', 'Gaming', 'Socializing'].map(anchor => (
                         <button 
                           type="button" 
                           key={anchor}
                           onClick={() => toggleAnchor(anchor)}
                           className={`px-2 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-black uppercase border-4 border-black transition-transform ${lifestyleAnchors.includes(anchor) ? 'bg-accent text-white shadow-[4px_4px_0px_rgba(0,0,0,1)] -translate-y-1' : 'bg-white hover:bg-gray-100'}`}
                         >
                           {anchor}
                         </button>
                       ))}
                     </div>
                     <div className="flex gap-2 mt-3 sm:mt-4">
                       <input type="text" placeholder="Custom anchor..." className="input-brutal flex-1 text-xs sm:text-sm py-2 sm:py-3" />
                       <button type="button" className="btn-brutal bg-black text-white px-3 sm:px-4 py-2 sm:py-3"><Plus className="w-4 h-4" /></button>
                     </div>
                   </div>
                </div>
              )}
            </div>

            <div className="mt-8 flex flex-wrap items-center justify-between gap-4 border-t-4 border-black pt-5 bg-white">
               <div className="flex gap-1">
                 {STEPS.map(s => (
                   <div key={s.id} className={`h-2 w-8 border-2 border-black ${currentStep >= s.id ? 'bg-primary' : 'bg-gray-200'}`}></div>
                 ))}
               </div>
               <button type="submit" className="btn-brutal w-full sm:w-auto text-sm sm:text-lg lg:text-xl px-4 sm:px-6 lg:px-8 py-2 sm:py-3 flex items-center justify-center gap-2 bg-primary group hover:bg-yellow-400 min-h-[44px] sm:min-h-auto">
                 {currentStep === STEPS.length ? 'Complete Setup' : 'Continue'} 
                 <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 lg:w-6 lg:h-6 group-hover:translate-x-1 transition-transform" />
               </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
