import React from 'react';
import { MessageSquare, Send, Bot, User } from 'lucide-react';

export default function Chat() {
  return (
    <div className="page-shell">
      <div className="flex-shrink-0">
        <h1 className="page-title flex items-center gap-3">
          <MessageSquare strokeWidth={2.5} />
          Neuro Assistant
        </h1>
        <p className="page-subtitle">Chat intuitively with your study materials.</p>
      </div>

      <div className="grid gap-4 xl:grid-cols-[1fr,320px]">
        <div className="card-brutal relative flex min-h-[620px] flex-col overflow-hidden bg-white p-0">
          <div className="max-h-[calc(100vh-18rem)] flex-1 space-y-5 overflow-y-auto bg-[#FAF9F6] p-5">
            <div className="flex gap-3">
              <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center border-2 border-black bg-primary shadow-brutal-sm">
                <Bot strokeWidth={2.5} />
              </div>
              <div className="relative inline-block max-w-[85%] rounded-bl-xl rounded-br-xl rounded-tr-xl border-2 border-black bg-white p-3 shadow-brutal-sm">
                <p className="font-medium">Hello! I'm ready to help you study. I see you have an upcoming test on Machine Learning. What would you like to review?</p>
              </div>
            </div>

            <div className="flex flex-row-reverse gap-3">
              <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center border-2 border-black bg-accent text-white shadow-brutal-sm">
                <User strokeWidth={2.5} />
              </div>
              <div className="relative inline-block max-w-[85%] rounded-bl-xl rounded-br-xl rounded-tl-xl border-2 border-black bg-secondary p-3 shadow-brutal-sm">
                <p className="font-bold">Explain Gradient Descent to me like I'm 5.</p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="mt-1 flex h-9 w-9 flex-shrink-0 items-center justify-center border-2 border-black bg-primary shadow-brutal-sm">
                <Bot strokeWidth={2.5} />
              </div>
              <div className="relative inline-block max-w-[85%] space-y-2 rounded-bl-xl rounded-br-xl rounded-tr-xl border-2 border-black bg-white p-3 text-sm shadow-brutal-sm sm:text-base">
                <p className="font-medium">Imagine you are blindfolded at the top of a bumpy hill, and you want to reach the absolute bottom.</p>
                <p className="font-medium">You feel the ground around you with your foot. You take a step in the direction that goes down the steepest.</p>
                <p className="font-medium">You keep doing this, step by step, until feeling around tells you everywhere else goes up. You've found the bottom!</p>
                <p className="mt-2 text-sm font-medium italic">Would you like a more technical explanation involving derivatives?</p>
              </div>
            </div>
          </div>

          <div className="border-t-4 border-black bg-white p-4">
            <div className="flex items-end gap-3">
              <div className="relative flex-1 border-4 border-black bg-white p-1 shadow-brutal-sm transition-all focus-within:translate-x-[2px] focus-within:translate-y-[2px] focus-within:shadow-none">
                <textarea className="h-[58px] min-h-[58px] w-full resize-none bg-transparent p-3 font-medium outline-none" placeholder="Ask about your syllabus..." />
              </div>
              <button className="flex h-[72px] cursor-pointer items-center justify-center border-4 border-black bg-black px-5 text-white shadow-brutal-sm transition-colors hover:bg-gray-800 active:translate-x-[2px] active:translate-y-[2px] active:shadow-none">
                <Send className="h-6 w-6" strokeWidth={3} />
              </button>
            </div>
          </div>
        </div>

        <aside className="space-y-4">
          <section className="card-brutal bg-white p-4">
            <h2 className="text-sm font-black uppercase tracking-wider">Current context</h2>
            <ul className="mt-3 space-y-2 text-sm font-semibold">
              <li className="surface-muted p-2">Topic: Gradient Descent</li>
              <li className="surface-muted p-2">Goal: Viva-ready explanation</li>
              <li className="surface-muted p-2">Difficulty: Intermediate</li>
            </ul>
          </section>

          <section className="card-brutal bg-secondary p-4">
            <h2 className="text-sm font-black uppercase tracking-wider">Quick actions</h2>
            <div className="mt-3 grid gap-2">
              <button className="border-2 border-black bg-white px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">Generate 5 viva questions</button>
              <button className="border-2 border-black bg-white px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">Summarize in 100 words</button>
              <button className="border-2 border-black bg-white px-3 py-2 text-left text-xs font-bold uppercase tracking-wider">Create a revision plan</button>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
