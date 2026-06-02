"use client";

import { useState, useEffect } from "react";
import { Search, Loader2 } from "lucide-react";

export default function Dashboard() {
  const [url, setUrl] = useState("");
  const [status, setStatus] = useState<"IDLE" | "PENDING" | "CRAWLING" | "COMPLETED" | "FAILED">("IDLE");
  const [websiteId, setWebsiteId] = useState<string | null>(null);
  const [data, setData] = useState<any>(null);

  const startCrawl = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setStatus("PENDING");
    setData(null);

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    try {
      const res = await fetch(`${apiUrl}/api/crawl`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const result = await res.json();
      
      if (result.success) {
        setWebsiteId(result.websiteId);
        setStatus("CRAWLING");
      } else {
        setStatus("FAILED");
      }
    } catch (err) {
      setStatus("FAILED");
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

    if (status === "CRAWLING" && websiteId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`${apiUrl}/api/crawl/${websiteId}`);
          const result = await res.json();

          if (result.success) {
            const dbStatus = result.website.status;
            if (dbStatus === "COMPLETED") {
              setStatus("COMPLETED");
              setData(result.website);
              clearInterval(interval);
            } else if (dbStatus === "FAILED") {
              setStatus("FAILED");
              clearInterval(interval);
            }
          }
        } catch (err) {
          // ignore network errors while polling
        }
      }, 2000);
    }

    return () => clearInterval(interval);
  }, [status, websiteId]);

  // Derive insights
  const pages = data?.pages || [];
  const allKeywords = pages.flatMap((p: any) => p.keywords || []);
  // deduplicate and sort keywords
  const uniqueKeywordsMap = new Map();
  allKeywords.forEach((k: any) => {
    if (!uniqueKeywordsMap.has(k.term) || uniqueKeywordsMap.get(k.term).score < k.score) {
      uniqueKeywordsMap.set(k.term, k);
    }
  });
  const topKeywords = Array.from(uniqueKeywordsMap.values()).sort((a: any, b: any) => b.score - a.score).slice(0, 5);

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
        <form onSubmit={startCrawl} className="w-full max-w-2xl p-1.5 rounded-full bg-white/5 border border-white/10 flex items-center shadow-2xl">
          <div className="flex-1 rounded-[calc(9999px-0.375rem)] bg-zinc-900 border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] flex items-center px-4 py-3 group focus-within:ring-1 focus-within:ring-white/20 transition-all">
            <Search className="w-5 h-5 text-zinc-500 mr-3" />
            <input 
              type="url" 
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://competitor.com" 
              className="w-full bg-transparent border-none outline-none text-zinc-100 placeholder:text-zinc-600 font-mono text-sm"
              disabled={status === "PENDING" || status === "CRAWLING"}
            />
          </div>
          <button 
            type="submit"
            disabled={status === "PENDING" || status === "CRAWLING"}
            className="ml-2 bg-white text-black px-6 py-3 rounded-full font-medium text-sm hover:scale-[0.98] transition-transform flex items-center disabled:opacity-50 disabled:hover:scale-100"
          >
            {status === "PENDING" || status === "CRAWLING" ? (
              <span className="flex items-center">
                Processing <Loader2 className="w-4 h-4 ml-2 animate-spin" />
              </span>
            ) : (
              <span className="flex items-center">
                Analyze
                <span className="w-6 h-6 rounded-full bg-black/10 flex items-center justify-center ml-3">↗</span>
              </span>
            )}
          </button>
        </form>
      </div>

      {/* Grid Archetype: Asymmetrical Bento */}
      <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Card 1: Strategy Overview / Keywords */}
        <div className="md:col-span-8 p-1.5 rounded-[2rem] bg-white/5 border border-white/10">
          <div className="w-full h-full min-h-[300px] rounded-[calc(2rem-0.375rem)] bg-zinc-950 border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] p-8 flex flex-col justify-end relative overflow-hidden">
             <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-zinc-800/40 via-zinc-950 to-zinc-950 pointer-events-none" />
             
             {status === "COMPLETED" ? (
               <div className="relative z-10 w-full h-full flex flex-col">
                 <h3 className="text-2xl font-medium tracking-tight mb-6">Top Semantic Entities</h3>
                 <div className="flex flex-wrap gap-3 mt-auto">
                   {topKeywords.map((kw: any) => (
                     <div key={kw.id} className="px-4 py-2 rounded-full bg-zinc-900 border border-white/10 text-sm font-medium text-zinc-300">
                       {kw.term} <span className="text-zinc-600 ml-2">{kw.score}</span>
                     </div>
                   ))}
                   {topKeywords.length === 0 && <span className="text-zinc-500">No entities extracted.</span>}
                 </div>
               </div>
             ) : (
               <>
                 <h3 className="text-2xl font-medium tracking-tight mb-2 relative z-10">Strategy Overview</h3>
                 <p className="text-zinc-500 text-sm relative z-10">Run an analysis to populate competitor traffic tactics.</p>
               </>
             )}
          </div>
        </div>

        {/* Card 2: Technical Metrics */}
        <div className="md:col-span-4 p-1.5 rounded-[2rem] bg-white/5 border border-white/10">
          <div className="w-full h-full min-h-[300px] rounded-[calc(2rem-0.375rem)] bg-zinc-950 border border-white/5 shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)] p-8 flex flex-col justify-end">
             <h3 className="text-xl font-medium tracking-tight mb-6">Crawl Metrics</h3>
             {status === "COMPLETED" && pages.length > 0 ? (
               <div className="flex flex-col gap-4">
                 <div>
                   <div className="text-3xl font-light tracking-tighter">{pages.length}</div>
                   <div className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Pages Crawled</div>
                 </div>
                 <div>
                   <div className="text-3xl font-light tracking-tighter">{pages[0]?.wordCount || 0}</div>
                   <div className="text-xs text-zinc-500 uppercase tracking-widest mt-1">Word Count</div>
                 </div>
               </div>
             ) : (
               <p className="text-zinc-500 text-sm">Awaiting target domain.</p>
             )}
          </div>
        </div>

      </div>
    </div>
  );
}
