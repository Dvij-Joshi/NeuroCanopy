import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Mail, Network, Send, Sparkles } from 'lucide-react';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <div className="manga-shell min-h-screen lg:grid lg:grid-cols-12">
      <div className="manga-grain" aria-hidden="true" />
      <div className="manga-speed-lines hidden lg:block" aria-hidden="true" />

      <aside className="relative hidden overflow-hidden border-r-4 border-black bg-[#ffe36e] lg:col-span-5 lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div
          className="absolute inset-0 opacity-25"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1.6px 1.6px, rgba(0,0,0,0.35) 1.6px, transparent 0), linear-gradient(135deg, rgba(255,255,255,0.22) 0 50%, transparent 50% 100%)',
            backgroundSize: '14px 14px, 100% 100%',
          }}
        />

        <div className="relative z-10">
          <Link to="/" className="manga-banner w-max bg-white transition-transform hover:-translate-y-1">
            <Network className="h-8 w-8" strokeWidth={3} />
            <span className="text-2xl font-black uppercase tracking-tighter">NeuroCanopy</span>
          </Link>

          <div className="mt-8 space-y-5">
            <div className="manga-sticker -rotate-2 bg-primary text-black">Password Recovery</div>
            <h1 className="max-w-md text-5xl font-black uppercase leading-[0.92] tracking-tight">
              Reset your access
            </h1>
            <p className="manga-panel-soft max-w-lg bg-white/90 px-5 py-4 text-lg font-bold leading-relaxed">
              Drop your registered email and we will send a secure reset link so you can get back to your study flow.
            </p>
          </div>
        </div>

        <div className="relative z-10 hidden lg:block">
          <div className="manga-panel-soft mx-auto w-full max-w-md rotate-[-2deg] bg-white/95 p-4">
            <div className="relative h-32 overflow-hidden rounded-xl border-4 border-black bg-[#fff7d1]">
              <div
                className="absolute inset-0 opacity-50"
                style={{
                  backgroundImage:
                    'repeating-radial-gradient(circle at center, rgba(0,0,0,0.12) 0 2px, transparent 2px 10px)',
                  backgroundSize: '120% 120%',
                }}
              />
              <div className="absolute left-4 top-5 h-14 w-14 rounded-full border-4 border-dashed border-black" aria-hidden="true" />
              <div className="absolute right-6 top-4 h-12 w-12 rotate-12 border-4 border-black bg-secondary/40" aria-hidden="true" />
              <div className="absolute bottom-4 left-1/2 h-16 w-16 -translate-x-1/2 rounded-full border-4 border-black bg-accent/25" aria-hidden="true" />
              <div className="absolute bottom-6 right-6 flex gap-2" aria-hidden="true">
                <span className="h-2 w-2 rounded-full bg-black" />
                <span className="h-2 w-2 rounded-full bg-black" />
                <span className="h-2 w-2 rounded-full bg-black" />
              </div>
            </div>
          </div>

          <div className="mx-auto mt-4 flex max-w-md items-center justify-center gap-4" aria-hidden="true">
            <div className="h-10 w-10 rounded-full border-4 border-black bg-white/80" />
            <div className="h-2 w-12 rounded-full bg-black" />
            <div className="h-10 w-10 rotate-12 border-4 border-black bg-primary/70" />
            <div className="h-2 w-12 rounded-full bg-black" />
            <div className="h-10 w-10 rounded-full border-4 border-dashed border-black bg-white/80" />
          </div>
        </div>

        <div className="relative z-10 space-y-3">
          <div className="manga-panel-soft flex items-center gap-3 bg-white px-4 py-3 text-sm font-bold uppercase">
            <Sparkles className="h-5 w-5" /> Recovery links are time-limited
          </div>
          <div className="manga-panel-soft flex items-center gap-3 bg-white px-4 py-3 text-sm font-bold uppercase">
            <Mail className="h-5 w-5" /> Use your authorized email
          </div>
        </div>
      </aside>

      <section className="relative flex items-center justify-center p-5 sm:p-8 lg:col-span-7">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              'radial-gradient(circle at 1.5px 1.5px, rgba(0,0,0,0.1) 1.5px, transparent 0), linear-gradient(180deg, rgba(255,255,255,0.72) 0%, rgba(250,249,246,0.94) 100%)',
            backgroundSize: '22px 22px, 100% 100%',
          }}
        />

        <div className="pointer-events-none absolute left-8 top-8 hidden h-24 w-24 -rotate-12 rounded-full border-4 border-dashed border-black/70 lg:block" aria-hidden="true" />
        <div className="pointer-events-none absolute bottom-10 right-10 hidden h-16 w-16 rotate-12 border-4 border-black bg-secondary/35 lg:block" aria-hidden="true" />
        <div className="pointer-events-none absolute right-20 top-1/3 hidden rounded-full border-4 border-black bg-white px-3 py-1 text-xs font-black uppercase tracking-widest lg:block" aria-hidden="true">
          swoosh
        </div>

        <div className="relative z-10 w-full max-w-5xl space-y-4">
          <div className="text-center lg:hidden">
            <Link to="/" className="manga-banner inline-flex items-center gap-2 bg-primary px-4 py-2">
              <Network className="h-6 w-6" />
              <span className="text-xl font-black uppercase tracking-tighter">NeuroCanopy</span>
            </Link>
          </div>

          <div className="grid items-start gap-4 lg:grid-cols-[1.35fr,0.8fr]">
            <form onSubmit={handleSubmit} className="manga-card bg-white p-6 sm:p-8">
              <div className="mb-6 border-b-4 border-black pb-5">
                <h2 className="text-3xl font-black uppercase tracking-tight sm:text-4xl">Forgot Password</h2>
                <p className="mt-2 font-medium text-gray-600">Enter your email to receive a reset link.</p>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold uppercase tracking-wider">Authorized Email</label>
                <div className="manga-panel-soft bg-white px-2 py-1">
                  <div className="flex items-center gap-2">
                    <Mail className="ml-2 h-5 w-5 text-gray-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="student@university.edu"
                      className="input-brutal w-full border-0 bg-transparent px-2 py-3 text-base"
                      required
                    />
                  </div>
                </div>
              </div>

              <button type="submit" className="btn-brutal mt-6 flex w-full items-center justify-center gap-2 bg-primary py-3 text-lg hover:bg-yellow-400">
                Send Reset Link <Send className="h-5 w-5" />
              </button>

              {sent && (
                <div className="manga-panel-soft mt-5 bg-[#fff7d1] px-4 py-3 text-sm font-bold">
                  If your account exists, a reset link has been sent to your email.
                </div>
              )}

              <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t-4 border-black pt-4">
                <Link to="/login" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-wide hover:underline">
                  <ArrowLeft className="h-4 w-4" /> Back to Login
                </Link>
                <Link to="/register" className="text-sm font-black uppercase tracking-wide text-accent hover:underline">
                  Create new profile
                </Link>
              </div>
            </form>

            <div className="manga-panel-soft relative overflow-hidden bg-white p-4 sm:p-5">
              <div className="pointer-events-none absolute -right-5 -top-5 h-20 w-20 rounded-full border-4 border-black bg-primary/40" aria-hidden="true" />
              <h3 className="text-sm font-black uppercase tracking-[0.2em]">Sketch Space</h3>
              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <div className="rounded-2xl border-4 border-black border-dashed bg-[#fffdf7] p-3 text-center">
                  <p className="text-[11px] font-black uppercase tracking-wider">Step 1</p>
                  <p className="mt-1 text-xs font-bold">Type email</p>
                </div>
                <div className="rounded-2xl border-4 border-black border-dashed bg-[#fffdf7] p-3 text-center">
                  <p className="text-[11px] font-black uppercase tracking-wider">Step 2</p>
                  <p className="mt-1 text-xs font-bold">Check inbox</p>
                </div>
                <div className="rounded-2xl border-4 border-black border-dashed bg-[#fffdf7] p-3 text-center">
                  <p className="text-[11px] font-black uppercase tracking-wider">Step 3</p>
                  <p className="mt-1 text-xs font-bold">Reset fast</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
