import React, { useState, useEffect } from 'react';
import { UserCircle, Mail, Book, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

export default function Profile() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [fullName, setFullName] = useState('');
  const [major, setMajor] = useState('');
  const [chronotype, setChronotype] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    async function loadProfile() {
      if (!user) return;
      try {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, major, chronotype, avatar_url')
          .eq('id', user.id)
          .single();

        if (error) throw error;
        
        if (data) {
          setFullName(data.full_name || '');
          setMajor(data.major || '');
          setChronotype(data.chronotype || '');
          setAvatarUrl(data.avatar_url || null);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
      } finally {
        setLoading(false);
      }
    }

    loadProfile();
  }, [user]);

  const handleSignOut = async () => {
    try {
      await signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: fullName,
          major: major,
        })
        .eq('id', user.id);

      if (error) throw error;
      showToast('Profile updated successfully!', 'success');
    } catch (error) {
      console.error('Error updating profile:', error);
      showToast('Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setUploadingAvatar(true);
      
      if (!event.target.files || event.target.files.length === 0) {
        throw new Error('You must select an image to upload.');
      }

      const file = event.target.files[0];
      const fileExt = file.name.split('.').pop();
      const fileName = `${user?.id}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload image to 'avatars' storage bucket
      let { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, { upsert: true });

      if (uploadError) {
        // If it fails with bucket error, they might not be using avatars storage.
        // As fallback, we could attempt to store base64 in avatar_url if the image is small enough.
        // But for now, we try storage and fall back to base64.
        console.warn('Storage failed, attempting base64 fallback:', uploadError.message);
        
        const reader = new FileReader();
        reader.onloadend = async () => {
          const base64data = reader.result as string;
          setAvatarUrl(base64data);
          await supabase.from('profiles').update({ avatar_url: base64data }).eq('id', user?.id!);
          showToast('Avatar updated via base64 fallback.', 'success');
        };
        reader.readAsDataURL(file);
        return;
      }

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);
        
      const newAvatarUrl = publicUrlData.publicUrl;

      // Update profiles table
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: newAvatarUrl })
        .eq('id', user?.id!);

      if (updateError) {
        throw updateError;
      }

      setAvatarUrl(newAvatarUrl);
      showToast('Avatar updated successfully!', 'success');
      
    } catch (error: any) {
      console.error('Avatar upload error:', error);
      showToast(error.message || 'Error uploading avatar.', 'error');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const initials = fullName
    ? fullName.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : user?.email?.substring(0, 2).toUpperCase() || 'U';

  if (loading) {
    return <div className="p-8 text-center font-bold uppercase">Loading Profile...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl relative">
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 px-6 py-4 border-4 border-black font-black uppercase text-sm sm:text-base shadow-[4px_4px_0_0_#000] animate-in slide-in-from-bottom-5 duration-300 ${
          toast.type === 'success' 
            ? 'bg-[#00E676] text-black' 
            : 'bg-[#FF3D00] text-white'
        }`}>
          {toast.message}
        </div>
      )}

      <div>
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight flex items-center gap-4">
          <UserCircle className="w-10 h-10" strokeWidth={2.5} />
          Profile
        </h1>
        <p className="text-xl font-medium mt-2">Manage your student identity.</p>
      </div>

      <div className="card-brutal bg-white p-8 space-y-8">
        
        <div className="flex flex-col md:flex-row items-center gap-8 border-b-4 border-black pb-8">
          <div className="relative group shrink-0">
            <div className="w-32 h-32 bg-primary border-4 border-black flex items-center justify-center shadow-brutal shrink-0 overflow-hidden relative group">
              {avatarUrl ? (
                <img src={avatarUrl} alt="Avatar" className="w-full h-full object-cover object-center bg-white" />
              ) : (
                <span className="text-6xl font-black">{initials}</span>
              )}
            </div>
            
            <label className="absolute -bottom-3 -right-3 cursor-pointer">
              <div className="bg-black text-white px-2 py-1 text-xs font-black uppercase border-2 border-primary hover:bg-gray-800 shadow-brutal-sm transition-transform active:translate-y-1">
                {uploadingAvatar ? '...' : 'Edit'}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                disabled={uploadingAvatar}
                className="hidden"
              />
            </label>
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black uppercase tracking-tight">{fullName || 'Student'}</h2>
            <p className="text-xl font-bold flex items-center justify-center md:justify-start gap-2 mt-2 break-all">
              <Mail className="w-5 h-5 shrink-0" /> {user?.email}
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              {major && <span className="bg-secondary px-3 py-1 font-bold uppercase border-2 border-black text-sm shadow-brutal-sm">{major} Major</span>}
              {chronotype && <span className="bg-accent text-white px-3 py-1 font-bold uppercase border-2 border-black text-sm shadow-brutal-sm">{chronotype.replace('_', ' ')} Chronotype</span>}
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div>
             <label className="block font-bold uppercase text-sm mb-2">Display Name</label>
             <input 
               type="text" 
               className="input-brutal w-full" 
               value={fullName}
               onChange={(e) => setFullName(e.target.value)}
             />
           </div>
           
           <div>
             <label className="block font-bold uppercase text-sm mb-2 flex items-center gap-2">
               <Book className="w-4 h-4" /> Major / Field of Study
             </label>
             <input 
               type="text" 
               className="input-brutal w-full" 
               value={major}
               onChange={(e) => setMajor(e.target.value)}
             />
           </div>

           <div className="pt-4 flex justify-end gap-4">
             <button 
               onClick={handleSaveProfile} 
               disabled={saving}
               className="btn-brutal bg-primary disabled:opacity-50"
             >
               {saving ? 'Saving...' : 'Save Changes'}
             </button>
           </div>
        </div>

      </div>

      <div className="card-brutal bg-[#FAF9F6] border-red-500 p-8">
         <h3 className="text-xl font-bold uppercase text-red-600 flex items-center gap-2 mb-4">
           <Shield strokeWidth={3} /> Danger Zone
         </h3>
         <div className="flex flex-col sm:flex-row justify-between items-center bg-white p-4 border-2 border-black">
           <div className="mb-4 sm:mb-0">
             <h4 className="font-bold text-lg">Sign Out</h4>
             <p className="text-sm font-medium text-gray-600">You will be required to log in again.</p>
           </div>
           <button onClick={handleSignOut} className="btn-brutal bg-black text-white hover:bg-gray-800 flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Log Out
           </button>
         </div>
      </div>
    </div>
  );
}
