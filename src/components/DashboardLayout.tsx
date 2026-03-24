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
    <div className="min-h-screen bg-background md:flex">
      {/* Sidebar Nav */}
      <aside className="hidden h-screen w-72 shrink-0 border-r-4 border-black bg-white md:sticky md:top-0 md:flex md:flex-col">
        <div className="p-6 border-b-4 border-black bg-primary">
          <h1 className="text-2xl font-bold uppercase tracking-tight">NeuroCanopy</h1>
        </div>
        
        <div className="p-6 border-b-4 border-black bg-accent text-white font-bold uppercase flex justify-between items-center tracking-wide">
          <span>Pacing:</span>
          <span className="bg-black px-2 py-1 text-primary animate-pulse">PANIC</span>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 font-bold uppercase tracking-wide border-2 border-transparent transition-transform hover:-translate-y-1 ${
                  isActive ? 'bg-secondary border-black shadow-brutal' : 'hover:bg-[#FAF9F6]'
                }`
              }
            >
              <item.icon strokeWidth={2.5} />
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t-4 border-black space-y-2">
          <NavLink to="/profile" className="flex items-center gap-3 px-4 py-3 font-bold uppercase hover:bg-[#FAF9F6]">
            <UserCircle strokeWidth={2.5} /> Profile
          </NavLink>
          <NavLink to="/settings" className="flex items-center gap-3 px-4 py-3 font-bold uppercase hover:bg-[#FAF9F6]">
            <Settings strokeWidth={2.5} /> Settings
          </NavLink>
        </div>
      </aside>

      <div className="flex min-h-screen flex-1 flex-col">
        {/* Mobile Nav */}
        <header className="sticky top-0 z-40 border-b-4 border-black bg-white md:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <span className="bg-primary px-3 py-1 text-lg font-black uppercase tracking-tight border-2 border-black">NeuroCanopy</span>
            <NavLink to="/profile" className="flex items-center gap-2 border-2 border-black px-2 py-1 text-sm font-bold uppercase">
              <UserCircle className="h-4 w-4" /> Profile
            </NavLink>
          </div>
          <nav className="flex gap-2 overflow-x-auto border-t-2 border-black px-3 py-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.to;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={`whitespace-nowrap border-2 border-black px-3 py-1 text-xs font-bold uppercase tracking-wide ${
                    isActive ? 'bg-secondary' : 'bg-white'
                  }`}
                >
                  {item.label}
                </NavLink>
              );
            })}
            <NavLink to="/settings" className="whitespace-nowrap border-2 border-black bg-white px-3 py-1 text-xs font-bold uppercase tracking-wide">
              Settings
            </NavLink>
          </nav>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto px-4 py-5 sm:px-6 sm:py-6 lg:px-8 lg:py-8">
          <div className="mx-auto w-full max-w-7xl">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
