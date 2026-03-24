import React from 'react';
import { UserCircle, Mail, Book, LogOut, Shield } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Profile() {
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight flex items-center gap-4">
          <UserCircle className="w-10 h-10" strokeWidth={2.5} />
          Profile
        </h1>
        <p className="text-xl font-medium mt-2">Manage your student identity.</p>
      </div>

      <div className="card-brutal bg-white p-8 space-y-8">
        
        <div className="flex flex-col md:flex-row items-center gap-8 border-b-4 border-black pb-8">
          <div className="w-32 h-32 bg-primary border-4 border-black flex items-center justify-center shadow-brutal">
            <span className="text-6xl font-black">JS</span>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-3xl font-black uppercase tracking-tight">John Smith</h2>
            <p className="text-xl font-bold flex items-center justify-center md:justify-start gap-2 mt-2">
              <Mail className="w-5 h-5" /> john.smith@university.edu
            </p>
            <div className="mt-4 flex flex-wrap gap-2 justify-center md:justify-start">
              <span className="bg-secondary px-3 py-1 font-bold uppercase border-2 border-black text-sm shadow-brutal-sm">Computer Science Major</span>
              <span className="bg-accent text-white px-3 py-1 font-bold uppercase border-2 border-black text-sm shadow-brutal-sm">Lion Chronotype</span>
            </div>
          </div>
        </div>

        <div className="space-y-6">
           <div>
             <label className="block font-bold uppercase text-sm mb-2">Display Name</label>
             <input type="text" className="input-brutal w-full" defaultValue="John Smith" />
           </div>
           
           <div>
             <label className="block font-bold uppercase text-sm mb-2 flex items-center gap-2">
               <Book className="w-4 h-4" /> Major / Field of Study
             </label>
             <input type="text" className="input-brutal w-full" defaultValue="Computer Science" />
           </div>

           <div className="pt-4 flex justify-end gap-4">
             <button className="btn-brutal bg-primary">Save Changes</button>
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
           <button onClick={() => navigate('/login')} className="btn-brutal bg-black text-white hover:bg-gray-800 flex items-center gap-2">
              <LogOut className="w-4 h-4" /> Log Out
           </button>
         </div>
      </div>
    </div>
  );
}
