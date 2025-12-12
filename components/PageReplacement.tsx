
import React, { useState } from 'react';
import { Play, RotateCcw, AlertCircle, Layers } from 'lucide-react';

const PageReplacement: React.FC = () => {
  const [framesCount, setFramesCount] = useState(3);
  const [referenceString, setReferenceString] = useState("1, 2, 3, 4, 1, 2, 5, 1, 2, 3, 4, 5");
  const [results, setResults] = useState<{
    fifo: any[];
    lru: any[];
    optimal: any[];
  } | null>(null);

  const runSimulation = () => {
    const refs = referenceString.split(',').map(s => s.trim()).filter(s => s !== "");
    
    const simulateFIFO = () => {
      let frames: (string | null)[] = Array(framesCount).fill(null);
      let faults = 0;
      let queue: string[] = [];
      const history = [];

      for (const ref of refs) {
        let isFault = false;
        if (!frames.includes(ref)) {
          faults++;
          isFault = true;
          if (queue.length === framesCount) {
            const victim = queue.shift();
            frames = frames.map(f => f === victim ? ref : f);
          } else {
            const emptyIdx = frames.indexOf(null);
            frames[emptyIdx] = ref;
          }
          queue.push(ref);
        }
        history.push({ frames: [...frames], isFault });
      }
      return { history, faults };
    };

    const simulateLRU = () => {
      let frames: (string | null)[] = Array(framesCount).fill(null);
      let faults = 0;
      let order: string[] = [];
      const history = [];

      for (const ref of refs) {
        let isFault = false;
        if (!frames.includes(ref)) {
          faults++;
          isFault = true;
          if (order.length === framesCount) {
            const victim = order.shift();
            frames = frames.map(f => f === victim ? ref : f);
          } else {
            const emptyIdx = frames.indexOf(null);
            frames[emptyIdx] = ref;
          }
          order.push(ref);
        } else {
          order = order.filter(o => o !== ref);
          order.push(ref);
        }
        history.push({ frames: [...frames], isFault });
      }
      return { history, faults };
    };

    const simulateOptimal = () => {
      let frames: (string | null)[] = Array(framesCount).fill(null);
      let faults = 0;
      const history = [];

      for (let i = 0; i < refs.length; i++) {
        const ref = refs[i];
        let isFault = false;
        if (!frames.includes(ref)) {
          faults++;
          isFault = true;
          if (frames.every(f => f !== null)) {
            let victimIdx = -1;
            let farthest = -1;
            for (let j = 0; j < frames.length; j++) {
              const nextOccurrence = refs.slice(i + 1).indexOf(frames[j]!);
              if (nextOccurrence === -1) {
                victimIdx = j;
                break;
              }
              if (nextOccurrence > farthest) {
                farthest = nextOccurrence;
                victimIdx = j;
              }
            }
            frames[victimIdx] = ref;
          } else {
            const emptyIdx = frames.indexOf(null);
            frames[emptyIdx] = ref;
          }
        }
        history.push({ frames: [...frames], isFault });
      }
      return { history, faults };
    };

    setResults({
      fifo: [simulateFIFO()],
      lru: [simulateLRU()],
      optimal: [simulateOptimal()]
    });
  };

  return (
    <div className="space-y-12">
      <header className="bg-neo-pink border-4 border-black p-8 shadow-neo-lg rotate-[-1deg] text-black">
        <div className="rotate-[1deg]">
          <h2 className="text-5xl font-display font-black tracking-tighter uppercase drop-shadow-[4px_4px_0px_#fff]">PAGING KERNEL</h2>
          <p className="text-white font-black mt-2 bg-black px-3 py-1 border-2 border-black w-fit uppercase text-sm italic">Virtual Memory Management Simulator</p>
        </div>
      </header>

      <div className="bg-white border-4 border-black p-8 shadow-neo-lg relative">
        <div className="absolute -top-6 -right-6 animate-float">
            <div className="bg-neo-yellow border-4 border-black p-4 shadow-neo flex items-center justify-center rotate-12">
                <Layers size={48} strokeWidth={3} />
            </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-end">
          <div>
            <label className="block text-xs font-black uppercase mb-3 tracking-widest">Memory Frames (Physical Slots)</label>
            <input 
              type="number" 
              value={framesCount} 
              onChange={e => setFramesCount(Math.max(1, parseInt(e.target.value) || 3))}
              className="w-full px-6 py-4 bg-slate-50 border-4 border-black font-mono font-black text-xl outline-none focus:bg-neo-yellow transition-all shadow-neo-hover"
            />
          </div>
          <div>
            <label className="block text-xs font-black uppercase mb-3 tracking-widest">Page Reference Stream</label>
            <input 
              type="text" 
              value={referenceString} 
              onChange={e => setReferenceString(e.target.value)}
              placeholder="e.g. 1, 2, 3, 4"
              className="w-full px-6 py-4 bg-slate-50 border-4 border-black font-mono font-black text-xl outline-none focus:bg-neo-pink transition-all shadow-neo-hover placeholder:opacity-30"
            />
          </div>
        </div>
        
        <div className="mt-10 flex gap-6">
          <button 
            onClick={runSimulation}
            className="flex-1 bg-neo-blue border-4 border-black py-5 font-black uppercase tracking-widest text-xl text-white shadow-neo active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-4"
          >
            <Play size={28} strokeWidth={3} /> START SIMULATION
          </button>
          <button 
            onClick={() => { setResults(null); }}
            className="px-6 bg-slate-200 border-4 border-black shadow-neo active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
          >
            <RotateCcw size={32} strokeWidth={3} />
          </button>
        </div>
      </div>

      {results && (
        <div className="space-y-16">
          {(['fifo', 'lru', 'optimal'] as const).map(algo => (
            <div key={algo} className="bg-white border-4 border-black shadow-neo-lg overflow-x-auto p-1">
              <div className="flex items-center justify-between p-6 bg-black text-white">
                <h3 className="text-4xl font-display font-black uppercase tracking-tighter skew-x-[-12deg]">{algo}</h3>
                <div className="flex items-center gap-4 px-6 py-3 bg-neo-pink text-black border-4 border-white font-black text-lg shadow-neo rotate-[1deg]">
                  <AlertCircle size={24} strokeWidth={3} /> FAULTS: {results[algo][0].faults}
                </div>
              </div>

              <div className="p-4 overflow-x-auto custom-scrollbar">
                <table className="w-full border-4 border-black border-collapse">
                  <thead>
                    <tr className="bg-neo-yellow">
                      <th className="p-4 border-4 border-black text-xs font-black uppercase text-black italic">Ref_Stream</th>
                      {referenceString.split(',').map((r, i) => (
                        <th key={i} className="p-4 border-4 border-black text-xl font-display font-black text-black text-center min-w-[60px]">
                          {r.trim()}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {[...Array(framesCount)].map((_, frameIdx) => (
                      <tr key={frameIdx} className="bg-white">
                        <td className="p-4 border-4 border-black text-xs font-black uppercase bg-slate-50">Frame_{frameIdx}</td>
                        {results[algo][0].history.map((step: any, stepIdx: number) => (
                          <td key={stepIdx} className={`p-4 border-4 border-black text-center font-display font-black text-2xl ${step.frames[frameIdx] ? 'bg-white' : 'bg-slate-100 opacity-20'}`}>
                            {step.frames[frameIdx] ?? 'ø'}
                          </td>
                        ))}
                      </tr>
                    ))}
                    <tr className="bg-slate-50">
                      <td className="p-4 border-4 border-black text-xs font-black uppercase text-slate-500">Kernel_Hit</td>
                      {results[algo][0].history.map((step: any, i: number) => (
                        <td key={i} className={`p-4 border-4 border-black text-center`}>
                          {step.isFault ? (
                            <div className="w-8 h-8 mx-auto bg-neo-red border-2 border-black rotate-45 shadow-neo-hover"></div>
                          ) : (
                            <span className="text-3xl font-display font-black text-neo-green drop-shadow-[2px_2px_0px_#000]">HIT</span>
                          )}
                        </td>
                      ))}
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PageReplacement;
