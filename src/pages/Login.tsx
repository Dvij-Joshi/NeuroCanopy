import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Network, Zap, ShieldCheck, Sparkles, Timer } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-12">
      <aside className="relative hidden border-r-4 border-black bg-accent lg:col-span-5 lg:flex lg:flex-col lg:p-10">
        <div
          className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'repeating-linear-gradient(45deg, #000 0, #000 2px, transparent 0, transparent 50%)', backgroundSize: '20px 20px' }}
        />

        <div className="relative z-10 flex h-full flex-col justify-between gap-8">
          <Link to="/" className="inline-flex w-max items-center gap-3 border-4 border-black bg-white px-4 py-2 shadow-[4px_4px_0px_rgba(0,0,0,1)] transition-transform hover:-translate-y-1">
            <Network className="h-8 w-8" strokeWidth={3} />
            <span className="text-2xl font-black uppercase tracking-tighter">NeuroCanopy</span>
          </Link>

          <div className="space-y-6">
            <div className="w-max -rotate-1 border-4 border-black bg-primary px-4 py-2 text-sm font-black uppercase tracking-wider shadow-[6px_6px_0px_rgba(0,0,0,1)]">
              Returning Student Access
            </div>
            <h1 className="text-5xl font-black uppercase leading-[0.9]">Re-enter the canopy</h1>
            <p className="max-w-lg border-l-4 border-black bg-white/60 pl-4 text-lg font-bold">
              Continue your focus plan, review high-risk topics, and pick up exactly where your last study sprint ended.
            </p>
          </div>

          <div className="grid gap-3">
            <div className="flex items-center gap-3 border-2 border-black bg-white px-3 py-2 font-bold uppercase text-sm">
              <ShieldCheck className="h-5 w-5 text-green-700" /> SSO + encrypted sessions
            </div>
            <div className="flex items-center gap-3 border-2 border-black bg-white px-3 py-2 font-bold uppercase text-sm">
              <Timer className="h-5 w-5" /> Median login time: 11s
            </div>
            <div className="flex items-center gap-3 border-2 border-black bg-white px-3 py-2 font-bold uppercase text-sm">
              <Sparkles className="h-5 w-5" /> Last sync: 2 min ago
            </div>
          </div>
        </div>
      </aside>

      <section className="relative flex items-center justify-center p-5 sm:p-8 lg:col-span-7">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(circle at 1.5px 1.5px, rgba(0,0,0,0.09) 1.5px, transparent 0)', backgroundSize: '24px 24px' }}
        />

        <div className="relative z-10 w-full max-w-2xl space-y-4">
          <div className="text-center lg:hidden">
            <Link to="/" className="inline-flex items-center gap-2 border-2 border-black bg-primary px-3 py-1 shadow-brutal-sm">
              <Network className="h-6 w-6" />
              <span className="text-xl font-black uppercase tracking-tighter">NeuroCanopy</span>
            </Link>
          </div>

          <div className="grid gap-4 lg:grid-cols-[1.35fr,0.8fr]">
            <form onSubmit={handleSubmit} className="card-brutal bg-white p-6 sm:p-8 shadow-[8px_8px_0px_rgba(0,0,0,1)]">
              <div className="mb-6 border-b-4 border-black pb-5">
                <h2 className="flex items-center gap-2 text-3xl sm:text-4xl font-black uppercase tracking-tight">
                  <Zap className="text-primary" fill="currentColor" /> Log In
                </h2>
                <p className="mt-1 font-medium text-gray-600">Welcome back. Authenticate to continue your plan.</p>
              </div>

              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold uppercase tracking-wider">Authorized Email</label>
                  <input type="email" placeholder="student@university.edu" className="input-brutal w-full bg-gray-50 px-4 py-3 text-base focus:bg-white" required />
                </div>

                <div className="space-y-2">
                  <label className="flex items-center justify-between text-sm font-bold uppercase tracking-wider">
                    <span>Passphrase</span>
                    <Link to="#" className="text-[11px] lowercase tracking-normal text-blue-600 hover:underline">
                      forgot?
                    </Link>
                  </label>
                  <input type="password" placeholder="••••••••" className="input-brutal w-full bg-gray-50 px-4 py-3 text-base focus:bg-white" required />
                </div>
              </div>

              <button type="submit" className="btn-brutal mt-6 flex w-full items-center justify-center gap-2 bg-primary py-3 text-lg hover:bg-yellow-400">
                Authenticate <ArrowRight className="h-5 w-5" />
              </button>

              <p className="mt-5 text-center text-sm font-bold">
                NO ACCOUNT?{' '}
                <Link to="/register" className="uppercase text-accent underline decoration-2 underline-offset-4">
                  Initialize new profile
                </Link>
              </p>
            </form>

            <div className="grid gap-4">
              <article className="card-brutal bg-white p-4">
                <h3 className="text-sm font-black uppercase tracking-wider">Today at a glance</h3>
                <ul className="mt-3 space-y-2 text-sm font-semibold">
                  <li className="flex items-center justify-between border-2 border-black bg-[#f4f1eb] px-2 py-1">
                    <span>Pending reviews</span>
                    <span>3</span>
                  </li>
                  <li className="flex items-center justify-between border-2 border-black bg-[#f4f1eb] px-2 py-1">
                    <span>Focus block</span>
                    <span>17:30</span>
                  </li>
                  <li className="flex items-center justify-between border-2 border-black bg-[#f4f1eb] px-2 py-1">
                    <span>Viva queue</span>
                    <span>2 ready</span>
                  </li>
                </ul>
              </article>

              <article className="card-brutal bg-secondary p-4">
                <h3 className="text-sm font-black uppercase tracking-wider">Ops status</h3>
                <p className="mt-2 text-sm font-semibold">All systems green. Sync latency below target threshold.</p>
              </article>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
