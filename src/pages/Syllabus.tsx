import React, { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { BookOpen, Upload, Trash2, Edit3, CheckSquare, Square, FileText, Layers, X, CheckCircle, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface Material {
  id: string;
  title: string;
  type: string;
  added: string;
  parsed: boolean;
  topicCount?: number;
  newTopicsAdded?: number;
  statusText?: string;
  isUploading?: boolean;
}

interface NoteSegment {
  id: string;
  topic_id: string;
  content: string;
  topicTitle?: string;
  unitTitle?: string;
}

export default function Syllabus() {
  const { user } = useAuth();
  
  // Section 1 State
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [targetCourseId, setTargetCourseId] = useState<string>('auto');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Section 2 State
  const [activeTab, setActiveTab] = useState<'syllabus' | 'notes'>('syllabus');
  const [selectedNotesCourse, setSelectedNotesCourse] = useState<string>('');
  const [courseTopics, setCourseTopics] = useState<{ id: string, title: string, unitTitle: string }[]>([]);
  const [noteSegments, setNoteSegments] = useState<NoteSegment[]>([]);
  const [isUploadingNotes, setIsUploadingNotes] = useState(false);
  const notesFileInputRef = useRef<HTMLInputElement>(null);

  const [showAddSubjectModal, setShowAddSubjectModal] = useState(false);
  const [newSubjectTitle, setNewSubjectTitle] = useState('');
  const [isAddingSubject, setIsAddingSubject] = useState(false);
  const [addSubjectSuccess, setAddSubjectSuccess] = useState(false);

  // Delete Modal State
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<'single' | 'selected' | null>(null);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    if (user) {
      fetchCourses();
    }
  }, [user]);

  const fetchCourses = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, created_at, units(id, topics(id))')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const formatted = (data || []).map((c: any) => {
        const topicCount = (c.units || []).reduce((acc: number, u: any) => acc + (u.topics?.length || 0), 0);
        
        return {
          id: c.id,
          title: c.title,
          type: 'DOC',
          added: c.created_at ? formatDistanceToNow(new Date(c.created_at)) + ' ago' : 'Just now',
          parsed: true,
          topicCount: topicCount,
          statusText: `● Active (${topicCount} Topics)`
        };
      });
      
      setMaterials(prev => {
         const uploading = prev.filter(m => m.isUploading);
         return [...uploading, ...formatted];
      });
    } catch (err) {
      console.error('Error fetching courses:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      fileInputRef.current.click();
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processFile(e.target.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      await processFile(e.dataTransfer.files[0]);
    }
  };

  const handleOpenAddSubjectModal = () => {
    if (!user) {
      alert("Please login to add a subject.");
      return;
    }
    setNewSubjectTitle('');
    setAddSubjectSuccess(false);
    setShowAddSubjectModal(true);
  };

  const handleAddNewSubjectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjectTitle.trim() || !user) return;
    
    try {
      setIsAddingSubject(true);
      const { data: newCourse, error } = await supabase
        .from('courses')
        .insert([{
             user_id: user.id,
             title: newSubjectTitle.trim(),
             code: newSubjectTitle.trim().substring(0, 5).toUpperCase(),
             total_chapters: 0,
             completed_chapters: 0,
             professor: 'Manual Entry',
             credits: 3,
             color: '#3b82f6'
        }]).select();
        
      if (error) throw error;
      
      if (newCourse && newCourse.length > 0) {
          setTargetCourseId(newCourse[0].id);
      }
      await fetchCourses();
      
      setAddSubjectSuccess(true);
      setTimeout(() => {
         setShowAddSubjectModal(false);
         setAddSubjectSuccess(false);
         setNewSubjectTitle('');
      }, 1500);

    } catch (err: any) {
       console.error("Error adding subject:", err);
       alert("Failed to add subject: " + err.message);
    } finally {
       setIsAddingSubject(false);
    }
  };

  const processFile = async (file: File) => {
    if (!user) {
      alert("Please login to upload a syllabus.");
      return;
    }
    
    const tempId = 'temp-' + Date.now();
    const tempMat: Material = {
      id: tempId,
      title: file.name,
      type: file.name.split('.').pop()?.toUpperCase() || 'DOC',
      added: 'Just now',
      parsed: false,
      isUploading: true,
      statusText: '● Parsing in progress...'
    };
    
    setMaterials(prev => [tempMat, ...prev]);

    try {
      const formData = new FormData();
      formData.append('syllabus', file);

      console.log('Sending file to /api/syllabus/upload');
      const API = import.meta.env.VITE_API_URL || 'http://localhost:3001';
      const res = await fetch(API + '/api/syllabus/upload', {
        method: 'POST',
        body: formData
      });

      if (!res.ok) {
        throw new Error('Failed to parse syllabus. Server returned ' + res.status);
      }
      
      const parsedData = await res.json();
      console.log('Parsed API Result:', parsedData);
      
      const courseTitle = parsedData.subject_name || file.name.split('.')[0] || 'Unknown Course';
      const unitsArray = Array.isArray(parsedData.units) ? parsedData.units : (parsedData.topics ? [{ unit_number: 1, title: 'Main Topics', topics: parsedData.topics }] : []);
      
      let courseId;
      let newTopicsCount = 0;
      let isExistingCourse = false;

      if (targetCourseId !== 'auto') {
         courseId = targetCourseId;
         isExistingCourse = true;
      } else {
         const { data: existingCourses } = await supabase
           .from('courses')
           .select('*')
           .eq('user_id', user.id)
           .ilike('title', courseTitle);
           
         if (existingCourses && existingCourses.length > 0) {
             courseId = existingCourses[0].id;
             isExistingCourse = true;
         }
      }

      if (isExistingCourse) {
         console.log('Course exists. Smart Merging...');
         
         const { data: existingUnits } = await supabase
           .from('units')
           .select('id, unit_number, title, topics(id, title)')
           .eq('course_id', courseId);
           
         const safeUnits = existingUnits || [];
         
         for (let i = 0; i < unitsArray.length; i++) {
           const pUnit = unitsArray[i];
           const unitTitle = pUnit.title || `Unit ${pUnit.unit_number || i + 1}`;
           
           let dbUnit = safeUnits.find(u => 
                (u.title && u.title.toLowerCase().trim() === unitTitle.toLowerCase().trim()) || 
                u.unit_number === pUnit.unit_number
           );
           
           let unitId = dbUnit?.id;
           
           if (!unitId) {
               const { data: newUnit, error: uErr } = await supabase.from('units')
                 .insert([{
                    course_id: courseId,
                    unit_number: pUnit.unit_number || i + 1,
                    title: unitTitle
                 }]).select().single();
               
               if (uErr) { console.error(uErr); continue; }
               if (newUnit) unitId = newUnit.id;
               
               dbUnit = { id: unitId, title: unitTitle, topics: [] } as any;
           }
           
           if (unitId && Array.isArray(pUnit.topics)) {
               const existingTopicTitles = (dbUnit?.topics || []).map((t: any) => t.title.toLowerCase().trim());
               const topicsToInsert: any[] = [];
               
               for (const pTopic of pUnit.topics) {
                   const topicTitle = pTopic.title || 'Untitled Topic';
                   
                   if (!existingTopicTitles.includes(topicTitle.toLowerCase().trim())) {
                       topicsToInsert.push({
                           unit_id: unitId,
                           title: topicTitle,
                           status: 'locked'
                       });
                   }
               }
               
               if (topicsToInsert.length > 0) {
                   const { error: tErr } = await supabase.from('topics').insert(topicsToInsert);
                   if (tErr) console.error("Topics Insert Error:", tErr);
                   else newTopicsCount += topicsToInsert.length;
               }
           }
         }
      } else {
         console.log('New Course. Inserting everything into units/topics tables...');
         const { data: newCourse, error: courseError } = await supabase
           .from('courses')
           .insert([{
             user_id: user.id, title: courseTitle, code: courseTitle.substring(0, 5).toUpperCase(),
             total_chapters: unitsArray.length || 0, completed_chapters: 0, professor: 'AI Generated', credits: 3, color: '#3b82f6'
           }]).select('*').single();
           
         if (courseError) throw courseError;
         courseId = newCourse.id;
         
         if (unitsArray.length > 0) {
           for (let i = 0; i < unitsArray.length; i++) {
             const pUnit = unitsArray[i];
             const unitTitle = pUnit.title || `Unit ${pUnit.unit_number || i + 1}`;
             
             const { data: newUnit, error: unitErr } = await supabase
               .from('units')
               .insert([{
                   course_id: courseId,
                   unit_number: pUnit.unit_number || i + 1,
                   title: unitTitle
               }]).select().single();
               
             if (newUnit && Array.isArray(pUnit.topics)) {
                const topicsToInsert = pUnit.topics.map((t: any) => ({
                   unit_id: newUnit.id,
                   title: t.title || 'Untitled Topic', 
                   status: 'locked'
                }));
                
                if (topicsToInsert.length > 0) {
                    await supabase.from('topics').insert(topicsToInsert);
                    newTopicsCount += topicsToInsert.length;
                }
             }
           }
         }
      }

      setMaterials(prev => prev.map(m => {
          if (m.id === tempId) {
             const statusMessage = newTopicsCount > 0 
                ? `● AI Parsed (${newTopicsCount} New Topics Added)` 
                : `● AI Parsed (No new topics found)`;
             return { ...m, parsed: true, isUploading: false, newTopicsAdded: newTopicsCount, statusText: statusMessage };
          }
          return m;
      }));
      
      setTimeout(() => fetchCourses(), 3000);

    } catch (err: any) {
      console.error('File processing error:', err);
      setMaterials(prev => prev.filter(m => m.id !== tempId));
      alert(`Error parsing or saving syllabus: ${err.message || 'Unknown error'}`);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === materials.length && materials.length > 0) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(materials.map(m => m.id)));
    }
  };

  const confirmDeleteSelected = () => {
    if (selectedIds.size === 0) return;
    if (!user) { alert('Please sign in to delete.'); return; }
    setDeleteTarget('selected');
    setItemToDelete(null);
    setShowDeleteModal(true);
  };

  const confirmDeleteSingle = (id: string) => {
    if (!user || id.startsWith('temp-')) return;
    setDeleteTarget('single');
    setItemToDelete(id);
    setShowDeleteModal(true);
  };

  const executeDelete = async () => {
    if (!user) { alert('Please sign in to delete.'); return; }
    setIsDeleting(true);

    const deepDeleteCourse = async (courseId: string) => {
      const { data: units } = await supabase.from('units').select('id').eq('course_id', courseId);
      if (units && units.length > 0) {
        const unitIds = units.map((u: any) => u.id);
        await supabase.from('topics').delete().in('unit_id', unitIds);
      }
      await supabase.from('units').delete().eq('course_id', courseId);
      await supabase.from('nodes').delete().eq('course_id', courseId);
      const { error } = await supabase.from('courses').delete().eq('id', courseId);
      if (error) throw error;
    };

    try {
      if (deleteTarget === 'selected') {
        const idsArr = Array.from(selectedIds).filter(id => !id.startsWith('temp-'));
        if (idsArr.length > 0) {
            for (const id of idsArr) {
                await deepDeleteCourse(id);
            }
        }
        setSelectedIds(new Set());
      } else if (deleteTarget === 'single' && itemToDelete) {
        await deepDeleteCourse(itemToDelete);
        setSelectedIds(prev => {
          const next = new Set(prev);
          next.delete(itemToDelete);
          return next;
        });
      }
      
      await fetchCourses();
      setShowDeleteModal(false);
      setDeleteTarget(null);
      setItemToDelete(null);
    } catch (err: any) {
      console.error('Delete error:', err);
      alert(`Failed to delete item(s). ${err.message || ''}`);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleNotesUploadClick = () => {
    if (!selectedNotesCourse) {
      alert("Please select a subject first before uploading notes.");
      return;
    }
    if (notesFileInputRef.current) {
      notesFileInputRef.current.value = '';
      notesFileInputRef.current.click();
    }
  };

  const handleNotesFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      await processNotesFile(e.target.files[0]);
    }
  };

  const processNotesFile = async (file: File) => {
    if (!user || !selectedNotesCourse) return;
    setIsUploadingNotes(true);
    
    try {
      // 1. Fetch the topics specifically for this course
      const { data: unitsData, error: unitsError } = await supabase
        .from('units')
        .select('id, title, topics(id, title)')
        .eq('course_id', selectedNotesCourse);
        
      if (unitsError) throw unitsError;
      
      const allTopics = (unitsData || []).flatMap((u: any) => 
         (u.topics || []).map((t: any) => ({
             id: t.id,
             title: t.title,
             unitTitle: u.title
         }))
      );
      
      setCourseTopics(allTopics);

      if (allTopics.length === 0) {
          alert("This subject has no topics yet. Please upload a syllabus first or add topics manually.");
          setIsUploadingNotes(false);
          return;
      }

      // 2. Simulate AI Processing / Extracting Note Segments
      setTimeout(() => {
        const mockExtractedSegments: NoteSegment[] = [
          {
            id: 'note-' + Date.now() + '-1',
            topic_id: allTopics[0].id,
            topicTitle: allTopics[0].title,
            unitTitle: allTopics[0].unitTitle,
            content: `Extracted summary from ${file.name} (Page 1): Core concepts and definitions.`
          },
          {
            id: 'note-' + Date.now() + '-2',
            topic_id: allTopics[Math.min(1, allTopics.length - 1)].id,
            topicTitle: allTopics[Math.min(1, allTopics.length - 1)].title,
            unitTitle: allTopics[Math.min(1, allTopics.length - 1)].unitTitle,
            content: `Extracted summary from ${file.name} (Page 2-3): Detailed mechanisms and examples.`
          }
        ];
        
        setNoteSegments(prev => [...mockExtractedSegments, ...prev]);
        setIsUploadingNotes(false);
      }, 2000);
      
    } catch (err: any) {
      console.error("Notes upload error:", err);
      alert("Failed to process notes: " + err.message);
      setIsUploadingNotes(false);
    }
  };

  return (
    <div className="page-shell space-y-12">
      <input 
        type="file" 
        accept=".pdf"
        style={{ display: 'none' }} 
        ref={fileInputRef} 
        onChange={handleFileChange} 
      />
      <input 
        type="file" 
        accept=".pdf,.txt,.png,.jpg,.jpeg"
        style={{ display: 'none' }} 
        ref={notesFileInputRef} 
        onChange={handleNotesFileChange} 
      />

      {/* Section 1: Syllabus Management */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
          <div>
            <h1 className="page-title flex items-center gap-3">
              <BookOpen className="w-10 h-10" strokeWidth={2.5} />
              Syllabus Manager
            </h1>
            <p className="page-subtitle">Upload materials, auto-extract and merge topics.</p>
          </div>
          <div className="flex gap-2 items-center flex-wrap justify-end">
            <select 
               value={targetCourseId}
               onChange={(e) => setTargetCourseId(e.target.value)}
               className="border-2 border-black p-2 font-bold text-sm bg-white cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="auto">Auto-Detect / New Subject</option>
              {materials.filter(m => !m.isUploading).map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>
            <button 
              onClick={handleOpenAddSubjectModal}
              className="btn-brutal bg-white text-black flex items-center gap-2 hover:bg-gray-100 transition-colors border-2 border-black"
            >
              <BookOpen strokeWidth={3} className="w-5 h-5" /> Add Subject
            </button>
            <button 
              onClick={handleUploadClick}
              className="btn-brutal bg-black text-white flex items-center gap-2 hover:bg-gray-900 transition-colors"
            >
              <Upload strokeWidth={3} /> Upload File
            </button>
          </div>
        </div>

        <div className="card-brutal bg-white p-0 overflow-hidden">
          <div className="bg-gray-100 border-b-4 border-black p-3 flex justify-between items-center">
          <div 
            className="flex items-center gap-4 font-bold uppercase tracking-wider cursor-pointer"
            onClick={toggleAll}
          >
            {materials.length > 0 && selectedIds.size === materials.length ? (
               <CheckSquare className="text-black" strokeWidth={3} />
            ) : (
               <Square className="text-gray-400 hover:text-black transition-colors" strokeWidth={3} />
            )}
            <span>Select All</span>
          </div>
          <div className="flex gap-2">
            <button onClick={() => alert('Edit feature coming soon!')} className="bg-black text-white p-2 border-2 border-transparent hover:bg-gray-800 disabled:opacity-50" title="Edit Selected" disabled={selectedIds.size === 0}>
              <Edit3 className="w-5 h-5" />
            </button>
            <button 
              onClick={confirmDeleteSelected}
              className="bg-red-500 text-white p-2 border-2 border-black hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed shadow-[2px_2px_0px_rgba(0,0,0,1)]" 
              title="Delete Selected"
              disabled={selectedIds.size === 0}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="divide-y-4 divide-black">
          {loading && materials.length === 0 ? (
             <div className="p-8 text-center font-bold text-gray-500 uppercase">
                 Loading your parsed materials...
             </div>
          ) : materials.length === 0 ? (
             <div className="p-8 text-center text-gray-500">
                 No materials found. Upload a syllabus above.
             </div>
          ) : (
            materials.map((mat) => {
              const isSelected = selectedIds.has(mat.id);
              return (
                <div key={mat.id} className={`p-4 md:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 transition-colors ${isSelected ? 'bg-secondary bg-opacity-30' : 'hover:bg-[#FAF9F6]'}`}>
                  <div className="flex items-center w-full md:w-auto gap-4">
                    <div onClick={() => toggleSelect(mat.id)}>
                      {isSelected ? (
                        <CheckSquare className="text-black cursor-pointer" strokeWidth={3} />
                      ) : (
                        <Square className="text-gray-400 cursor-pointer hover:text-black" strokeWidth={3} />
                      )}
                    </div>
                    
                    <div className="w-12 h-12 bg-primary border-2 border-black flex items-center justify-center font-bold uppercase shrink-0 text-xs sm:text-base">
                      {mat.type}
                    </div>
                    
                    <div className="min-w-0 flex-1">
                      <h3 className="text-lg font-bold truncate">{mat.title}</h3>
                      <div className="flex items-center gap-2 mt-1 text-xs sm:text-sm font-medium uppercase tracking-wide flex-wrap">
                        <span className="text-gray-600 whitespace-nowrap">Added {mat.added}</span>
                        <span className="hidden sm:inline w-1 h-1 bg-black rounded-full" />
                        
                        {mat.isUploading ? (
                          <span className="text-accent font-bold animate-pulse whitespace-nowrap">{mat.statusText}</span>
                        ) : mat.parsed && mat.newTopicsAdded !== undefined ? (
                          <span className={`${mat.newTopicsAdded > 0 ? 'text-green-600' : 'text-yellow-600'} font-bold whitespace-nowrap`}>{mat.statusText}</span>
                        ) : (
                          <span className="text-black font-bold whitespace-nowrap">{mat.statusText}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 w-full md:w-auto mt-4 md:mt-0 justify-end">
                    <button className="flex-1 md:flex-none px-4 py-2 border-2 border-black font-bold uppercase text-sm bg-white hover:bg-gray-100 transition-colors">
                      View Data
                    </button>
                    <button 
                      onClick={() => confirmDeleteSingle(mat.id)}
                      className="px-3 py-2 border-2 border-black text-red-600 bg-white hover:bg-red-50 transition-colors disabled:opacity-50"
                      title="Delete"
                      disabled={mat.isUploading}
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}

          <div 
             className="m-5 cursor-pointer border-4 border-dashed border-gray-300 bg-gray-50 p-8 text-center transition-colors hover:border-black"
             onClick={handleUploadClick}
             onDragOver={handleDragOver}
             onDrop={handleDrop}
          >
             <Upload className="mx-auto mb-4 h-10 w-10 text-gray-400" strokeWidth={2} />
             <h3 className="text-xl font-bold uppercase mb-2">Drag & Drop Files Here</h3>
             <p className="font-medium text-gray-600">Supports only PDF.</p>
          </div>
        </div>
      </div>
      </section>

      {/* Section 2: Relevant Notes Management */}
      <section>
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6 mt-12 bg-white p-6 border-b-4 border-r-4 border-black border-2 rounded-lg">
          <div>
            <h2 className="page-title flex items-center gap-3 !text-3xl">
              <Layers className="w-8 h-8 text-secondary" strokeWidth={3} />
              Relevant Notes Management
            </h2>
            <p className="page-subtitle mt-2">Upload notes to automatically extract and map to existing topics.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-3 items-center w-full md:w-auto">
            <select 
               value={selectedNotesCourse}
               onChange={(e) => setSelectedNotesCourse(e.target.value)}
               className="w-full sm:w-auto border-2 border-black p-3 font-bold text-sm bg-white cursor-pointer hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-black"
            >
              <option value="" disabled>Select Target Subject</option>
              {materials.filter(m => !m.isUploading).map(m => (
                <option key={m.id} value={m.id}>{m.title}</option>
              ))}
            </select>

            <button 
              onClick={handleNotesUploadClick}
              disabled={isUploadingNotes || !selectedNotesCourse}
              className={`btn-brutal flex items-center justify-center gap-2 transition-colors w-full sm:w-auto ${
                (!selectedNotesCourse || isUploadingNotes) 
                ? 'bg-gray-300 text-gray-500 cursor-not-allowed' 
                : 'bg-[#9b87f5] text-white hover:bg-[#8670f4]'
              }`}
            >
              {isUploadingNotes ? (
                <span className="animate-pulse">Parsing...</span>
              ) : (
                <>
                  <FileText strokeWidth={3} /> Process Notes
                </>
              )}
            </button>
          </div>
        </div>

        {/* Notes Mapping Display */}
        <div className="card-brutal bg-white p-0 overflow-hidden">
          <div className="bg-gray-100 border-b-4 border-black p-4 flex justify-between items-center">
             <h3 className="font-bold uppercase tracking-wider text-black">Mapped Note Segments</h3>
          </div>

          <div className="divide-y-2 divide-black/10">
            {noteSegments.length === 0 ? (
               <div className="p-8 text-center text-gray-500 font-medium">
                  Select a subject and process some notes to see automated mappings here.
               </div>
            ) : (
              noteSegments.map((segment) => (
                <div key={segment.id} className="p-5 hover:bg-gray-50 transition-colors flex flex-col md:flex-row gap-4">
                  <div className="md:w-1/4 shrink-0 flex flex-col gap-1 border-l-4 border-secondary pl-3">
                    <span className="text-xs font-bold text-gray-500 uppercase">{segment.unitTitle || 'Unknown Unit'}</span>
                    <span className="text-sm font-bold text-black">{segment.topicTitle || 'Unknown Topic'}</span>
                  </div>
                  <div className="flex-1 bg-[#FAF9F6] border-2 border-black p-4 rounded-md relative shadow-[2px_2px_0px_rgba(0,0,0,1)]">
                     <p className="text-sm text-gray-800 leading-relaxed">
                        {segment.content}
                     </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Add Subject Modal */}
      {showAddSubjectModal && createPortal(
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999999, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          className="backdrop-blur-sm p-4"
        >
           {addSubjectSuccess ? (
              <div className="bg-white border-4 border-black p-8 w-full max-w-sm shadow-[8px_8px_0px_rgba(0,0,0,1)] flex flex-col items-center justify-center text-center animate-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-green-400 rounded-full border-4 border-black flex items-center justify-center mb-4 shadow-[4px_4px_0px_rgba(0,0,0,1)] animate-bounce">
                     <CheckCircle className="text-black w-10 h-10" strokeWidth={3} />
                  </div>
                  <h3 className="text-2xl font-black uppercase text-black mb-2">Success!</h3>
                  <p className="font-bold text-gray-600">Subject added successfully.</p>
              </div>
           ) : (
             <form 
                onSubmit={handleAddNewSubjectSubmit}
                className="bg-white border-4 border-black w-full max-w-md shadow-[8px_8px_0px_rgba(0,0,0,1)] relative flex flex-col"
             >
                <div className="flex justify-between items-center p-4 border-b-4 border-black bg-[#9b87f5] text-white">
                   <h3 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
                      <BookOpen strokeWidth={3} className="w-6 h-6" /> Add Subject
                   </h3>
                   <button 
                     type="button" 
                     onClick={() => setShowAddSubjectModal(false)}
                     disabled={isAddingSubject}
                     className="text-white hover:text-black transition-colors disabled:opacity-50"
                   >
                     <X strokeWidth={3} className="w-6 h-6" />
                   </button>
                </div>

                <div className="p-6">
                   <label className="block font-bold uppercase mb-2 text-black">Subject Name</label>
                   <input 
                      type="text" 
                      required
                      autoFocus
                      placeholder="Enter the name of the new subject..."
                      value={newSubjectTitle}
                      onChange={(e) => setNewSubjectTitle(e.target.value)}
                      disabled={isAddingSubject}
                      className="w-full border-2 border-black p-3 font-semibold text-lg focus:outline-none focus:ring-4 focus:ring-black/20 disabled:bg-gray-100 disabled:text-gray-500"
                   />
                </div>

                <div className="p-4 border-t-4 border-black flex justify-end gap-3 bg-gray-50">
                   <button 
                     type="button" 
                     onClick={() => setShowAddSubjectModal(false)}
                     disabled={isAddingSubject}
                     className="btn-brutal bg-white text-black hover:bg-gray-200 border-2 border-black w-full sm:w-auto disabled:opacity-50"
                   >
                     Cancel
                   </button>
                   <button 
                     type="submit" 
                     disabled={isAddingSubject}
                     className="btn-brutal bg-black text-white hover:bg-gray-800 w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                   >
                     {isAddingSubject ? (
                        <>
                           <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                           Saving...
                        </>
                     ) : 'Create'}
                   </button>
                </div>
             </form>
           )}
        </div>,
        document.getElementById('root')!
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && createPortal(
        <div 
          style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', zIndex: 999999, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          className="backdrop-blur-sm p-4"
        >
           <div className="bg-white border-4 border-black w-full max-w-md shadow-[8px_8px_0px_rgba(0,0,0,1)] relative flex flex-col animate-in zoom-in duration-200">
              <div className="flex justify-between items-center p-4 border-b-4 border-black bg-red-500 text-white">
                 <h3 className="text-xl font-black uppercase tracking-wider flex items-center gap-2">
                    <AlertTriangle strokeWidth={3} className="w-6 h-6" /> Confirm Deletion
                 </h3>
                 <button 
                   type="button" 
                   onClick={() => {
                     setShowDeleteModal(false);
                     setDeleteTarget(null);
                     setItemToDelete(null);
                   }}
                   disabled={isDeleting}
                   className="text-white hover:text-black transition-colors disabled:opacity-50"
                 >
                   <X strokeWidth={3} className="w-6 h-6" />
                 </button>
              </div>

              <div className="p-6 text-center">
                 <Trash2 strokeWidth={2} className="w-16 h-16 mx-auto mb-4 text-red-500" />
                 <h4 className="text-2xl font-black uppercase text-black mb-2">Are you sure?</h4>
                 <p className="font-bold text-gray-600 text-lg">
                   {deleteTarget === 'selected' 
                      ? "This will permanently delete all selected materials." 
                      : "This will permanently delete this material."}
                 </p>
                 <p className="text-gray-500 mt-2 font-medium">This action cannot be undone.</p>
              </div>

              <div className="p-4 border-t-4 border-black flex justify-end gap-3 bg-gray-50">
                 <button 
                   type="button" 
                   onClick={() => {
                     setShowDeleteModal(false);
                     setDeleteTarget(null);
                     setItemToDelete(null);
                   }}
                   disabled={isDeleting}
                   className="btn-brutal bg-white text-black hover:bg-gray-200 border-2 border-black w-full sm:w-auto disabled:opacity-50"
                 >
                   Cancel
                 </button>
                 <button 
                   onClick={executeDelete}
                   disabled={isDeleting}
                   className="btn-brutal bg-red-500 text-white hover:bg-red-600 border-2 border-black w-full sm:w-auto flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                 >
                   {isDeleting ? (
                      <>
                         <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                         Deleting...
                      </>
                   ) : 'Delete'}
                 </button>
              </div>
           </div>
        </div>,
        document.getElementById('root')!
      )}
    </div>
  );
}
