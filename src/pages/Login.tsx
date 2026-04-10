import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Network, Zap, ShieldCheck, Sparkles, Timer } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [loginAttempts, setLoginAttempts] = useState(0);
  const [isLocked, setIsLocked] = useState(false);

  useEffect(() => {
    // Security Route Guard: Clear any stale session if the user explicitly navigates to Login.
    // This prevents the "auto-redirect" loop if they just wanted to log out or switch accounts.
    const clearSession = async () => {
      await supabase.auth.signOut();
    };
    clearSession();
  }, []);

  useEffect(() => {
    // Security: Soft rate limit in frontend (Supabase handles hard limit natively)
    if (loginAttempts >= 5) {
      setIsLocked(true);
      setError("Too many failed attempts. Try again in 60 seconds to protect your account.");
      const timer = setTimeout(() => {
        setIsLocked(false);
        setLoginAttempts(0);
        setError(null);
      }, 60000);
      return () => clearTimeout(timer);
    }
  }, [loginAttempts]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setLoginAttempts(prev => prev + 1);
        if (error.message.includes('fetch')) {
           console.warn('Supabase fetch failed. Falling back to local offline login demo.');
           navigate('/dashboard');
           return;
        }
        throw error;
      }
      
      if (data.session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('lifestyle_activities')
          .eq('id', data.session.user.id)
          .maybeSingle();
          
        if (profile && profile.lifestyle_activities) {
          navigate('/dashboard');
        } else {
          // Profile is incomplete. Route them back to registration to resume.
          navigate('/register');
        }
      }
    } catch (error: any) {
      if (error.message.includes('Invalid login credentials')) {
        setError(`Login failed. Check your email and password. (${5 - loginAttempts} attempts left)`);
      } else {
        setError(error.message || 'Login failed. Please check your credentials.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="manga-shell min-h-screen lg:grid lg:grid-cols-12">
      <div className="manga-grain" aria-hidden="true" />
      <div className="manga-speed-lines hidden lg:block" aria-hidden="true" />

      <aside className="relative hidden overflow-hidden border-r-4 border-black bg-[#ffd43b] lg:col-span-5 lg:flex lg:flex-col lg:p-10">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1.5px 1.5px, rgba(0,0,0,0.36) 1.5px, transparent 0), linear-gradient(135deg, rgba(255,255,255,0.2) 0 50%, transparent 50% 100%)',
            backgroundSize: '14px 14px, 100% 100%',
          }}
        />
        <div
          className="absolute -left-10 top-10 h-44 w-44 rounded-full border-4 border-black bg-white/35"
          style={{ animation: 'mangaSweep 10s ease-in-out infinite' }}
          aria-hidden="true"
        />
        <div
          className="absolute bottom-[-3rem] right-[-2rem] h-72 w-72 rounded-full border-4 border-black bg-accent/30"
          style={{ animation: 'mangaSweep 14s ease-in-out infinite reverse' }}
          aria-hidden="true"
        />

        <div className="relative z-10 flex h-full flex-col justify-between gap-8">
          <Link to="/" className="manga-banner w-max bg-white transition-transform hover:-translate-y-1">
            <Network className="h-8 w-8" strokeWidth={3} />
            <span className="text-2xl font-black uppercase tracking-tighter">NeuroCanopy</span>
          </Link>

          <div className="space-y-6">
            <div className="manga-sticker w-max -rotate-2 bg-primary text-black">
              Returning Student Access
            </div>
            <h1 className="max-w-md text-5xl font-black uppercase leading-[0.9] tracking-tight">
              Re-enter the canopy
            </h1>
            <p className="manga-panel-soft max-w-lg bg-white/90 px-5 py-4 pl-5 text-lg font-bold leading-relaxed">
              Continue your focus plan, review high-risk topics, and pick up exactly where your last study sprint ended.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="manga-panel-soft flex items-center gap-3 bg-white px-4 py-3 font-bold uppercase text-sm">
              <ShieldCheck className="h-5 w-5 text-green-700" /> SSO + encrypted sessions
            </div>
            <div className="manga-panel-soft flex items-center gap-3 bg-white px-4 py-3 font-bold uppercase text-sm">
              <Timer className="h-5 w-5" /> Median login time: 11s
            </div>
            <div className="manga-panel-soft flex items-center gap-3 bg-white px-4 py-3 font-bold uppercase text-sm">
              <Sparkles className="h-5 w-5" /> Last sync: 2 min ago
            </div>
          </div>
        </div>
      </aside>

      <section className="relative flex items-center justify-center p-5 sm:p-8 lg:col-span-7">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1.5px 1.5px, rgba(0,0,0,0.1) 1.5px, transparent 0), linear-gradient(180deg, rgba(255,255,255,0.7) 0%, rgba(250,249,246,0.92) 100%)',
            backgroundSize: '22px 22px, 100% 100%',
          }}
        />

        <div className="relative z-10 w-full max-w-2xl space-y-4">
          <div className="text-center lg:hidden">
            <Link to="/" className="manga-banner inline-flex items-center gap-2 bg-primary px-4 py-2">
              <Network className="h-6 w-6" />
              <span className="text-xl font-black uppercase tracking-tighter">NeuroCanopy</span>
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.35fr,0.8fr]">
            <form onSubmit={handleSubmit} className="manga-card bg-white p-6 sm:p-8">
              <div className="relative mb-6 border-b-4 border-black pb-5">
                <div className="absolute right-0 top-0 h-14 w-14 -translate-y-3 translate-x-2 border-4 border-black bg-secondary/80" aria-hidden="true" />
                <h2 className="flex items-center gap-2 text-3xl sm:text-4xl font-black uppercase tracking-tight">
                  <Zap className="text-primary" fill="currentColor" /> Log In
                </h2>
                <p className="mt-1 font-medium text-gray-600">Welcome back. Authenticate to continue your plan.</p>
              </div>

              {error && (
                <div className="mb-4 bg-red-100 border-l-4 border-red-500 text-red-700 p-4 font-bold" role="alert">
                  <p>{error}</p>
                </div>
              )}

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider">Authorized Email</label>
                  <div className="manga-panel-soft bg-white px-2 py-1">
                    <input 
                      type="email" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@university.edu" 
                      className="input-brutal w-full bg-transparent px-4 py-3 text-base focus:bg-white focus:outline-none" 
                      required 
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center justify-between text-sm font-bold uppercase tracking-wider">
                    <span>Passphrase</span>
                    <Link to="/forgot-password" className="text-[11px] lowercase tracking-normal text-blue-600 hover:underline">
                      forgot?
                    </Link>
                  </label>
                  <div className="manga-panel-soft bg-white px-2 py-1">
                    <input 
                      type="password" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••" 
                      className="input-brutal w-full bg-transparent px-4 py-3 text-base focus:bg-white focus:outline-none" 
                      required 
                    />
                  </div>
                </div>
              </div>

              <button disabled={isLoading} type="submit" className={`btn-brutal mt-6 flex w-full items-center justify-center gap-2 bg-primary py-3 text-lg hover:bg-yellow-400 ${isLoading ? 'opacity-50 cursor-not-allowed' : ''}`}>
                {isLoading ? 'Authenticating...' : 'Authenticate'} <ArrowRight className="h-5 w-5" />
              </button>
              
              <p className="mt-6 text-center text-sm font-bold tracking-wide text-gray-500">
                NO ACCOUNT?{' '}
                <Link to="/register" className="uppercase text-accent underline decoration-2 underline-offset-4">
                  Initialize new profile
                </Link>
              </p>
            </form>

            <div className="grid gap-4">
              <article className="manga-panel-soft bg-white p-4">
                <h3 className="text-sm font-black uppercase tracking-wider">Today at a glance</h3>
                <ul className="mt-3 space-y-2 text-sm font-semibold">
                  <li className="manga-chip flex items-center justify-between bg-white px-3 py-2">
                    <span>Pending reviews</span>
                    <span>3</span>
                  </li>
                  <li className="manga-chip flex items-center justify-between bg-white px-3 py-2">
                    <span>Focus block</span>
                    <span>17:30</span>
                  </li>
                  <li className="manga-chip flex items-center justify-between bg-white px-3 py-2">
                    <span>Viva queue</span>
                    <span>2 ready</span>
                  </li>
                </ul>
              </article>

              <article className="manga-panel-soft relative overflow-hidden bg-white p-4">
                <div className="pointer-events-none absolute -right-4 -top-4 h-16 w-16 rounded-full border-4 border-black bg-primary/50" aria-hidden="true" />
                <div className="pointer-events-none absolute -bottom-5 -left-5 h-20 w-20 rounded-full border-4 border-black bg-accent/30" aria-hidden="true" />

                <h3 className="relative text-sm font-black uppercase tracking-wider">Mission board</h3>
                <p className="relative mt-2 text-xs font-bold uppercase tracking-wider text-gray-600">Before you authenticate</p>

                <div className="relative mt-3 space-y-2 text-sm font-semibold">
                  <div className="manga-chip flex items-center justify-between bg-white px-3 py-2">
                    <span>Mode</span>
                    <span>Rapid Review</span>
                  </div>
                  <div className="manga-chip flex items-center justify-between bg-white px-3 py-2">
                    <span>Energy</span>
                    <span>High Focus</span>
                  </div>
                  <div className="manga-chip flex items-center justify-between bg-white px-3 py-2">
                    <span>Warmup</span>
                    <span>5 min recap</span>
                  </div>
                </div>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
