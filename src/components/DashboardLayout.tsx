import React from 'react';
import { Outlet, NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Network, Calendar, BookOpen, Mic, MessageSquare, Settings, UserCircle } from 'lucide-react';

export default function DashboardLayout() {
  const location = useLocation();

  const navItems = [
    { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { to: "/tree", label: "Knowledge Tree", icon: Network },
    { to: "/schedule", label: "Calendar", icon: Calendar },
    { to: "/syllabus", label: "Syllabus", icon: BookOpen },
    { to: "/viva", label: "Voice Viva", icon: Mic },
    { to: "/chat", label: "Assistant", icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-background md:flex font-sans manga-shell relative overflow-hidden">
      {/* Background halftone/action lines can be implemented via classes from index.css */}
      
      {/* Sidebar Nav - Comic Panel Style */}
      <aside className="hidden h-screen w-72 shrink-0 border-r-8 border-black bg-white md:sticky md:top-0 md:flex md:flex-col relative z-10 shadow-[8px_0_0_0_rgba(0,0,0,1)]">
        {/* Manga Panel Header */}
        <div className="p-6 border-b-8 border-black bg-primary relative overflow-hidden group">
          <div className="absolute inset-0 bg-[radial-gradient(#000_1px,transparent_1px)] [background-size:16px_16px] opacity-20 group-hover:scale-110 transition-transform duration-500"></div>
          <h1 className="relative text-3xl font-black uppercase tracking-tighter transform -skew-x-6 text-white" style={{ WebkitTextStroke: '2px black' }}>
            NeuroCanopy
          </h1>
          {/* Action Burst Decoration */}
          <div className="absolute -right-4 -top-4 w-16 h-16 bg-accent border-4 border-black rotate-12 transform group-hover:rotate-45 transition-transform duration-300"></div>
        </div>
        
        {/* Status Indicator Panel */}
        <div className="p-4 border-b-8 border-black bg-accent text-white font-black uppercase flex flex-col justify-center items-center tracking-widest relative overflow-hidden">
          <div className="absolute inset-x-0 inset-y-0 opacity-30 pattern-diagonal-stripes-sm"></div>
           {/* Comic Speech Bubble Style */}
           <div className="relative bg-white text-black border-4 border-black px-4 py-2 transform -rotate-2">
             <span className="text-sm block">CURRENT ARC:</span>
             <span className="text-2xl animate-pulse text-accent">PANIC MODE</span>
             {/* Tail of speech bubble */}
             <div className="absolute -bottom-[10px] left-4 w-4 h-4 bg-white border-l-4 border-b-4 border-black transform rotate-[-45deg]"></div>
           </div>
        </div>

        {/* Navigation Panels */}
        <nav className="flex-1 p-4 space-y-4 overflow-y-auto bg-white" style={{ 
          backgroundImage: 'linear-gradient(90deg, transparent 95%, #f0f0f0 95%)', 
          backgroundSize: '20px 100%' 
        }}>
          {navItems.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `group relative flex items-center gap-4 px-4 py-3 font-black uppercase tracking-widest border-4 transition-all duration-200 ${
                  isActive 
                    ? 'bg-secondary border-black shadow-[6px_6px_0_0_rgba(0,0,0,1)] translate-x-1 -translate-y-1' 
                    : 'border-black hover:bg-primary hover:text-white hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 bg-white'
                } ${index % 2 === 0 ? '-rotate-1' : 'rotate-1'}`
              }
            >
              <item.icon strokeWidth={3} className="shrink-0 group-hover:animate-bounce" />
              <span className="relative z-10">{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Footer Panels */}
        <div className="p-4 border-t-8 border-black bg-white space-y-3">
          <NavLink to="/profile" className="flex items-center gap-3 px-4 py-3 font-black uppercase border-4 border-black hover:bg-secondary hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-all transform -rotate-1">
            <UserCircle strokeWidth={2.5} /> Profile
          </NavLink>
          <NavLink to="/settings" className="flex items-center gap-3 px-4 py-3 font-black uppercase border-4 border-black hover:bg-accent hover:text-white hover:shadow-[4px_4px_0_0_rgba(0,0,0,1)] hover:-translate-y-1 transition-all transform rotate-1">
            <Settings strokeWidth={2.5} /> Settings
          </NavLink>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col bg-background relative">
        {/* Mobile Nav - Comic Banner Style */}
        <header className="sticky top-0 z-40 border-b-8 border-black bg-primary md:hidden shadow-[0_8px_0_0_rgba(0,0,0,1)]">
          <div className="flex items-center justify-between px-4 py-3 relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(#000_2px,transparent_2px)] [background-size:16px_16px] opacity-20"></div>
            <span className="relative bg-white px-3 py-1 text-xl font-black uppercase tracking-tighter border-4 border-black transform -rotate-2">
              NeuroCanopy
            </span>
            <NavLink to="/profile" className="relative flex items-center gap-2 bg-white border-4 border-black px-3 py-2 text-sm font-black uppercase transform rotate-2">
              <UserCircle className="h-5 w-5" strokeWidth={3} /> Profile
            </NavLink>
          </div>
          <nav className="flex gap-3 overflow-x-auto border-t-4 border-black px-4 py-3 bg-white scrollbar-hide">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`shrink-0 border-4 border-black px-4 py-2 text-xs font-black uppercase tracking-widest ${
                    isActive ? 'bg-secondary shadow-[4px_4px_0_0_rgba(0,0,0,1)] -translate-y-1' : 'bg-white hover:bg-primary hover:text-white'
                  }`}
                >
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </header>

        {/* Main Content Area - The "Page" */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-10 bg-[#FAF9F6] relative">
          {/* Subtle background texture for the "page" */}
          <div className="absolute inset-0 opacity-[0.03] pointer-events-none mix-blend-multiply" 
               style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cream-paper.png")' }}></div>
          
          <div className="mx-auto w-full max-w-7xl relative z-10">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
