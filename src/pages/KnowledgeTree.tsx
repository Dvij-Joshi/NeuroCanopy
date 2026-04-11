import React, { useEffect, useState } from 'react';
import { Network, CheckCircle, Circle, ChevronRight, ChevronDown, Folder, BookOpen, FileText, Lock, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface Topic {
  id: string;
  title: string;
  status: string; // 'completed', 'in-progress', 'locked'
}

interface Unit {
  id: string;
  title: string;
  unit_number: number;
  topics: Topic[];
}

interface Course {
  id: string;
  title: string;
  units: Unit[];
  progress: number;
  status: string;
}

export default function KnowledgeTree() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set(['root']));

  const [stats, setStats] = useState({
    completedNodes: 0,
    nextUnlock: 'None',
    riskBranches: 0,
  });

  useEffect(() => {
    fetchTreeData();
  }, []);

  const fetchTreeData = async () => {
    try {
      setIsLoading(true);
      const { data: userData, error: authErr } = await supabase.auth.getUser();
      if (authErr || !userData?.user) throw new Error('Not authenticated');

      const { data: coursesData, error: coursesErr } = await supabase
        .from('courses')
        .select(`
          id,
          title,
          units (
            id,
            title,
            unit_number,
            topics (
              id,
              title,
              status
            )
          )
        `)
        .eq('user_id', userData.user.id);

      if (coursesErr) throw coursesErr;

      let totalCompleted = 0;
      let totalInProgress = 0;
      let totalTopicsCount = 0;
      let possibleNextTopic = 'None';
      let atRisk = 0;

      const processedCourses = (coursesData || []).map((c: any) => {
        let courseCompletedTopics = 0;
        let courseTotalTopics = 0;

        const processedUnits = (c.units || [])
          .sort((a: any, b: any) => a.unit_number - b.unit_number)
          .map((u: any) => {
            const processedTopics = (u.topics || []).map((t: any) => {
              courseTotalTopics++;
              totalTopicsCount++;
              if (t.status === 'completed') {
                courseCompletedTopics++;
                totalCompleted++;
              } else if (t.status === 'in-progress') {
                totalInProgress++;
              }

              if (t.status === 'locked' && possibleNextTopic === 'None') {
                possibleNextTopic = t.title;
              }

              return t;
            });
            return { ...u, topics: processedTopics };
          });

        const progress = courseTotalTopics === 0 ? 0 : Math.round((courseCompletedTopics / courseTotalTopics) * 100);
        let status = 'healthy';
        if (progress < 40 && courseTotalTopics > 0) {
           status = 'at-risk';
           atRisk++;
        }
        
        return {
          ...c,
          progress,
          status,
          units: processedUnits
        };
      });

      setStats({
        completedNodes: totalCompleted,
        nextUnlock: possibleNextTopic,
        riskBranches: atRisk,
      });

      setCourses(processedCourses);
    } catch (err: any) {
      console.error('Error fetching tree data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleNode = (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setExpandedNodes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const renderTopic = (topic: Topic) => {
    let bgClass = 'bg-gray-200 opacity-70';
    let icon = <Lock size={18} className="text-gray-500" />;
    
    if (topic.status === 'completed') {
      bgClass = 'bg-primary shadow-brutal';
      icon = <CheckCircle strokeWidth={3} size={18} className="text-black" />;
    } else if (topic.status === 'in-progress') {
      bgClass = 'bg-secondary border-black shadow-brutal';
      icon = <Circle strokeWidth={3} size={18} className="text-black" />;
    }

    return (
      <div key={topic.id} className="relative ml-8 mt-4 flex items-center group">
        <div className="absolute -left-8 top-1/2 w-8 border-t-4 border-black border-dashed"></div>
        <div className={`flex items-center gap-3 px-4 py-2 border-4 border-black font-bold uppercase text-sm transform transition-transform hover:scale-105 cursor-pointer ${bgClass} z-10`}>
          {icon}
          <span className="truncate max-w-[200px]">{topic.title}</span>
        </div>
      </div>
    );
  };

  const renderUnit = (unit: Unit) => {
    const isExpanded = expandedNodes.has(unit.id);
    return (
      <div key={unit.id} className="relative ml-8 mt-4">
        <div className="absolute left-0 top-0 bottom-0 w-px border-l-4 border-black border-dashed opacity-50 z-0"></div>
        <div className="absolute -left-8 top-6 w-8 border-t-4 border-black border-dashed"></div>
        
        <div 
          onClick={(e) => toggleNode(unit.id, e)}
          className="relative z-10 flex items-center justify-between min-w-[260px] max-w-sm px-4 py-3 border-4 border-black font-bold uppercase text-sm cursor-pointer bg-[#fff3cd] shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-transform hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
        >
          <div className="flex items-center gap-3">
             <BookOpen strokeWidth={2.5} size={20} />
             <span className="truncate">Unit {unit.unit_number}: {unit.title}</span>
          </div>
          {isExpanded ? <ChevronDown strokeWidth={3} size={20} /> : <ChevronRight strokeWidth={3} size={20} />}
        </div>

        {isExpanded && (
          <div className="pl-4 pb-2 relative">
            {unit.topics.length > 0 ? (
               unit.topics.map(t => renderTopic(t))
            ) : (
               <div className="ml-8 mt-4 text-xs font-bold uppercase text-gray-500 border-2 border-dashed border-gray-300 inline-block px-3 py-1 bg-gray-50">Empty Unit</div>
            )}
          </div>
        )}
      </div>
    );
  };

  const renderCourse = (course: Course) => {
    const isExpanded = expandedNodes.has(course.id);
    return (
      <div key={course.id} className="relative ml-8 mt-6">
        <div className="absolute left-0 top-0 bottom-0 w-px border-l-4 border-black z-0"></div>
        <div className="absolute -left-8 top-7 w-8 border-t-4 border-black"></div>
        
        <div 
          onClick={(e) => toggleNode(course.id, e)}
          className="relative z-10 flex items-center justify-between min-w-[300px] max-w-md p-4 border-4 border-black font-black uppercase text-base cursor-pointer bg-white shadow-brutal transition-transform hover:-translate-y-1 hover:shadow-[6px_6px_0px_rgba(0,0,0,1)]"
        >
          <div className="flex items-center gap-3">
             <Folder strokeWidth={3} size={24} className={course.status === 'at-risk' ? 'text-[#FF3D00]' : 'text-black'} />
             <span className="truncate">{course.title}</span>
          </div>
          <div className="flex items-center justify-center gap-2">
             <span className="text-xs bg-black text-white px-2 py-1 rounded-sm border-2 border-black">{course.progress}%</span>
             {isExpanded ? <ChevronDown strokeWidth={3} size={22} /> : <ChevronRight strokeWidth={3} size={22} />}
          </div>
        </div>

        {isExpanded && (
          <div className="pl-4 pb-4">
             {course.units.length > 0 ? (
                course.units.map(u => renderUnit(u))
             ) : (
                <div className="ml-8 mt-4 text-sm font-bold uppercase text-gray-500 italic bg-gray-100 border-2 border-black border-dashed px-4 py-2 inline-block">No Units Configured</div>
             )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="page-shell">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="page-title flex items-center gap-3">
            <Network className="w-10 h-10" strokeWidth={2.5} />
            Knowledge Tree
          </h1>
          <p className="page-subtitle">Dynamic view of your curriculum syllabus and progress.</p>
        </div>
        <button onClick={fetchTreeData} className="btn-brutal bg-accent text-white flex items-center gap-2 hover:bg-black transition-colors">
          {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Network className="w-5 h-5"/>} 
          Sync Database
        </button>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[340px,1fr]">
        
        <div className="space-y-4">
          <div className="card-brutal bg-black text-white p-4 sticky top-4 z-20 shadow-[4px_4px_0px_#ffd43b]">
             <h2 className="text-lg font-black uppercase tracking-widest flex items-center gap-2">
                <FileText className="w-5 h-5"/> My Subjects 
             </h2>
          </div>
          {isLoading ? (
             <div className="card-brutal font-bold text-center border-dashed py-12 flex flex-col items-center">
                <Loader2 className="w-8 h-8 animate-spin mb-3 text-black" />
                <p>Loading syllabus matrix...</p>
             </div>
          ) : courses.length === 0 ? (
             <div className="card-brutal font-bold text-center">
                No subjects found in database.
             </div>
          ) : (
             courses.map((category) => (
                <div key={category.id} className={`card-brutal flex flex-col ${category.status === 'at-risk' ? 'bg-[#FF3D00] text-white' : 'bg-white'}`}>
                  <h3 className="font-bold uppercase tracking-wider text-lg mb-3 truncate">{category.title}</h3>
                  <div className="mt-auto">
                    <div className="text-3xl font-black">{category.progress}%</div> 
                    <div className="w-full h-3 bg-gray-200 mt-2 border-2 border-black rounded-sm relative overflow-hidden">
                      <div
                        className={`h-full border-r-2 border-black ${category.status === 'at-risk' ? 'bg-black' : 'bg-primary'}`}
                        style={{ width: `${category.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))
          )}
        </div>

        <div className="space-y-4 flex flex-col">
          <div className="card-brutal bg-[#FAF9F6] p-6 lg:p-10 flex-1 flex flex-col relative border-dashed border-4 overflow-x-auto min-h-[500px]">
             
             <div className="flex flex-col relative z-20 w-fit">
               <div 
                 onClick={(e) => toggleNode('root', e)}
                 className="inline-flex items-center gap-3 px-6 py-4 border-4 border-black bg-black text-white font-black uppercase text-xl cursor-pointer shadow-[6px_6px_0px_#ffd43b] hover:shadow-[2px_2px_0px_#ffd43b] hover:translate-x-1 hover:translate-y-1 transition-all"
               >
                 <Network strokeWidth={3} className="text-primary" />
                 <span>Subjects Matrix</span>
                 {expandedNodes.has('root') ? <ChevronDown size={28}/> : <ChevronRight size={28}/>}
               </div>

               <div className="relative pt-2 pb-8">
                 {expandedNodes.has('root') && (
                    <div className="absolute left-9 top-0 bottom-0 w-1 bg-black z-0"></div>
                 )}
                 
                 {expandedNodes.has('root') && courses.length > 0 && (
                    <div className="pl-1">
                      {courses.map((course) => renderCourse(course))}
                    </div>
                 )}
               </div>
             </div>

          </div>

          <div className="grid gap-3 sm:grid-cols-3 shrink-0">
            <div className="card-brutal bg-white p-4 flex flex-col justify-end">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Topics Completed</p>
              <p className="mt-1 text-3xl font-black">{stats.completedNodes}</p>
            </div>
            <div className="card-brutal bg-white p-4 flex flex-col justify-end overflow-hidden">
              <p className="text-xs font-bold uppercase tracking-wider text-gray-500">Next Unlock</p>
              <p className="mt-1 text-base font-black uppercase truncate" title={stats.nextUnlock}>{stats.nextUnlock}</p>
            </div>
            <div className={`card-brutal p-4 flex flex-col justify-end ${stats.riskBranches > 0 ? 'bg-secondary' : 'bg-primary'}`}>
              <p className="text-xs font-bold uppercase tracking-wider">At-Risk Subjects</p>
              <p className="mt-1 text-3xl font-black">{stats.riskBranches}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
