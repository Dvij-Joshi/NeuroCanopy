import React from 'react';
import { Settings as SettingsIcon, Bell, Smartphone, MonitorSmartphone, Lock } from 'lucide-react';

export default function Settings() {
  return (
    <div className="space-y-8 animate-in fade-in duration-500 max-w-4xl relative pb-20">
      <div>
        <h1 className="text-4xl md:text-5xl font-bold uppercase tracking-tight flex items-center gap-4">
          <SettingsIcon className="w-10 h-10" strokeWidth={2.5} />
          Settings
        </h1>
        <p className="text-xl font-medium mt-2">Adjust your environment parameters.</p>
      </div>

      <div className="space-y-6">
        
        {/* Blocklist Settings */}
        <section className="card-brutal bg-white p-0 overflow-hidden">
          <div className="bg-primary p-4 border-b-4 border-black flex items-center gap-3">
            <Lock strokeWidth={2.5} className="w-6 h-6" />
            <h2 className="text-2xl font-bold uppercase">Focus Blocklist</h2>
          </div>
          <div className="p-6 space-y-4 bg-[#FAF9F6]">
            <p className="font-medium text-gray-700">These sites are completely inaccessible during active Focus Blocks.</p>
            
            <div className="space-y-2">
              {['youtube.com', 'instagram.com', 'reddit.com', 'twitter.com'].map(site => (
                <div key={site} className="flex justify-between items-center bg-white border-2 border-black p-3 font-bold">
                  <span>{site}</span>
                  <button className="text-red-500 hover:text-red-700 underline text-sm uppercase">Remove</button>
                </div>
              ))}
            </div>

             <div className="flex gap-2 mt-4">
               <input type="text" className="input-brutal flex-1" placeholder="Add website to block..." />
               <button className="btn-brutal bg-black text-white px-6">Add</button>
             </div>
          </div>
        </section>

        {/* Integration Settings */}
        <section className="card-brutal bg-white p-0 overflow-hidden">
          <div className="bg-secondary p-4 border-b-4 border-black flex items-center gap-3">
            <MonitorSmartphone strokeWidth={2.5} className="w-6 h-6" />
            <h2 className="text-2xl font-bold uppercase">App Integrations</h2>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex justify-between items-center py-2 border-b-2 border-dashed border-gray-300">
               <div>
                 <h4 className="font-bold text-lg">Google Calendar</h4>
                 <p className="text-sm font-medium">Sync quantum schedule with GCal.</p>
               </div>
               <button className="btn-brutal bg-black text-white py-1">Disconnect</button>
            </div>
            <div className="flex justify-between items-center py-2">
               <div>
                 <h4 className="font-bold text-lg">Notion</h4>
                 <p className="text-sm font-medium">Auto-export generated notes.</p>
               </div>
               <button className="btn-brutal bg-primary py-1">Connect</button>
            </div>
          </div>
        </section>

        {/* Notifications */}
        <section className="card-brutal bg-white p-0 overflow-hidden">
          <div className="bg-accent text-white p-4 border-b-4 border-black flex items-center gap-3">
            <Bell strokeWidth={2.5} className="w-6 h-6" />
            <h2 className="text-2xl font-bold uppercase">Notifications</h2>
          </div>
          <div className="p-6 space-y-6 bg-[#FAF9F6]">
            
            <label className="flex items-center gap-4 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-14 h-8 bg-gray-300 border-2 border-black peer-checked:bg-primary transition-colors"></div>
                <div className="absolute left-1 top-1 w-6 h-6 bg-white border-2 border-black peer-checked:translate-x-6 transition-transform"></div>
              </div>
              <div>
                <span className="font-bold block uppercase text-sm">Decay Alerts</span>
                <span className="text-sm font-medium text-gray-600">Notify when topics need review.</span>
              </div>
            </label>

            <label className="flex items-center gap-4 cursor-pointer">
              <div className="relative">
                <input type="checkbox" className="sr-only peer" />
                <div className="w-14 h-8 bg-gray-300 border-2 border-black peer-checked:bg-primary transition-colors"></div>
                <div className="absolute left-1 top-1 w-6 h-6 bg-white border-2 border-black peer-checked:translate-x-6 transition-transform"></div>
              </div>
              <div>
                <span className="font-bold block uppercase text-sm">Strict Mode</span>
                <span className="text-sm font-medium text-gray-600">Loud, un-dismissable alarms for focus ending.</span>
              </div>
            </label>
          </div>
        </section>

      </div>
      
      {/* Save FAB equivalent */}
      <div className="fixed bottom-8 right-8 lg:right-12">
        <button className="btn-brutal bg-primary text-xl px-12 py-4 shadow-[8px_8px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-2 hover:translate-y-2 focus-visible:outline-none z-50 rounded-none w-full animate-bounce">
          Save Settings
        </button>
      </div>

    </div>
  );
}
