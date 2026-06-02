import { Search } from "lucide-react";

export default function Dashboard() {
  return (
    <div className="min-h-[100dvh] bg-zinc-950 px-4 py-24 sm:px-6 lg:px-8 flex flex-col items-center">
      {/* Hero Section */}
      <div className="w-full max-w-4xl flex flex-col items-center text-center mb-24">
        <div className="inline-flex rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.2em] font-medium bg-white/5 text-zinc-400 mb-8 border border-white/10">
          Intelligence Engine
        </div>
        <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter leading-none mb-6">
          Uncover the logic behind <span className="text-zinc-500">competitor traffic.</span>
        </h1>
        <p className="text-lg text-zinc-400 max-w-2xl leading-relaxed mb-12">
          Extract content strategy, site architecture, and programmatic SEO tactics automatically. Paste a URL to begin the architectural audit.
        </p>

        {/* Search Input - Double Bezel Structure */}
        <div className="w-full max-w-2xl p-1.5 rounded-full bg-white/5 border border-white/10 flex items-center shadow-2xl">
          <div className="flex-1 rounded-[calc(9999px-0.375rem)] bg-zinc-900 border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] flex items-center px-4 py-3 group focus-within:ring-1 focus-within:ring-white/20 transition-all">
            <Search className="w-5 h-5 text-zinc-500 mr-3" />
            <input 
              type="text" 
              placeholder="https://competitor.com" 
              className="w-full bg-transparent border-none outline-none text-zinc-100 placeholder:text-zinc-600 font-mono text-sm"
            />
          </div>
          <button className="ml-2 bg-white text-black px-6 py-3 rounded-full font-medium text-sm hover:scale-[0.98] transition-transform flex items-center">
            Analyze
            <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center ml-3">
              ↗
            </span>
          </button>
        </div>
      </div>

      {/* Grid Archetype: Asymmetrical Bento */}
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Card 1 */}
        <div className="md:col-span-8 p-1.5 rounded-[2rem] bg-white/5 border border-white/10">
          <div className="w-full h-full min-h-[300px] rounded-[calc(2rem-0.375rem)] bg-zinc-950 border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] p-8 flex flex-col justify-end relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/40 via-zinc-950 to-zinc-950 pointer-events-none" />
             <h3 className="text-2xl font-medium tracking-tight mb-2 relative z-10">Strategy Overview</h3>
             <p className="text-zinc-500 text-sm relative z-10">Run an analysis to populate competitor traffic tactics.</p>
          </div>
        </div>

        {/* Card 2 */}
        <div className="md:col-span-4 p-1.5 rounded-[2rem] bg-white/5 border border-white/10">
          <div className="w-full h-full min-h-[300px] rounded-[calc(2rem-0.375rem)] bg-zinc-950 border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] p-8 flex flex-col justify-end">
             <h3 className="text-xl font-medium tracking-tight mb-2">Internal Links</h3>
             <p className="text-zinc-500 text-sm">Awaiting target domain.</p>
          </div>
        </div>

      </div>
    </div>
  );
}
