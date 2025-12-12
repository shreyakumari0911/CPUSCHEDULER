
import React, { useState } from 'react';
import { Play, RotateCcw, Plus, Trash2, Cpu } from 'lucide-react';

interface Block {
  id: number;
  start: number;
  size: number;
  allocated: boolean;
  processId: number | null;
}

interface Process {
  id: number;
  size: number;
}

const MemoryAllocation: React.FC = () => {
  const [totalMemory, setTotalMemory] = useState(100);
  const [processes, setProcesses] = useState<Process[]>([
    { id: 1, size: 10 },
    { id: 2, size: 20 },
    { id: 3, size: 5 }
  ]);
  const [allocationMode, setAllocationMode] = useState<'First' | 'Best' | 'Worst'>('First');
  const [blocks, setBlocks] = useState<Block[]>([]);
  const [history, setHistory] = useState<string[]>([]);

  const reset = () => {
    setBlocks([{ id: 0, start: 0, size: totalMemory, allocated: false, processId: null }]);
    setHistory([]);
  };

  const simulate = () => {
    let currentBlocks: Block[] = [{ id: 0, start: 0, size: totalMemory, allocated: false, processId: null }];
    const log: string[] = [];

    processes.forEach(proc => {
      let targetIndex = -1;

      if (allocationMode === 'First') {
        targetIndex = currentBlocks.findIndex(b => !b.allocated && b.size >= proc.size);
      } else if (allocationMode === 'Best') {
        let minSize = Infinity;
        currentBlocks.forEach((b, idx) => {
          if (!b.allocated && b.size >= proc.size && b.size < minSize) {
            minSize = b.size;
            targetIndex = idx;
          }
        });
      } else if (allocationMode === 'Worst') {
        let maxSize = -1;
        currentBlocks.forEach((b, idx) => {
          if (!b.allocated && b.size >= proc.size && b.size > maxSize) {
            maxSize = b.size;
            targetIndex = idx;
          }
        });
      }

      if (targetIndex !== -1) {
        const block = currentBlocks[targetIndex];
        const remainingSize = block.size - proc.size;
        
        const newAllocatedBlock: Block = {
          ...block,
          size: proc.size,
          allocated: true,
          processId: proc.id
        };

        const newBlocks = [...currentBlocks];
        newBlocks[targetIndex] = newAllocatedBlock;

        if (remainingSize > 0) {
          newBlocks.splice(targetIndex + 1, 0, {
            id: Date.now() + Math.random(),
            start: block.start + proc.size,
            size: remainingSize,
            allocated: false,
            processId: null
          });
        }
        currentBlocks = newBlocks;
        log.push(`OK: Process ${proc.id} assigned via ${allocationMode.toUpperCase()} Fit.`);
      } else {
        log.push(`FAIL: Process ${proc.id} (${proc.size}u) requires more contiguous space.`);
      }
    });

    setBlocks(currentBlocks);
    setHistory(log);
  };

  return (
    <div className="space-y-10">
      <header className="bg-neo-yellow border-4 border-black p-8 shadow-neo-lg rotate-[1deg]">
        <div className="rotate-[-1deg]">
          <h2 className="text-5xl font-display font-black tracking-tighter uppercase drop-shadow-[4px_4px_0px_#000]">MEMORY MAPPING</h2>
          <p className="text-black font-black mt-2 bg-white px-3 py-1 border-2 border-black w-fit uppercase text-sm italic">Simulating Contiguous Memory Allocation Strategies</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white border-4 border-black p-6 shadow-neo-lg">
            <h3 className="text-2xl font-display font-black mb-6 flex items-center gap-3 underline decoration-neo-pink decoration-4">
              <Cpu size={28} strokeWidth={3} className="text-neo-blue" /> SYSTEM CONFIG
            </h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-xs font-black uppercase mb-2 tracking-widest">Address Space Capacity</label>
                <input 
                  type="number" 
                  value={totalMemory} 
                  onChange={e => setTotalMemory(Math.max(1, parseInt(e.target.value) || 0))}
                  className="w-full px-4 py-3 bg-slate-50 border-2 border-black font-mono font-black focus:bg-neo-yellow transition-colors outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase mb-3 tracking-widest">Allocation Strategy</label>
                <div className="flex gap-3">
                  {(['First', 'Best', 'Worst'] as const).map(mode => (
                    <button
                      key={mode}
                      onClick={() => setAllocationMode(mode)}
                      className={`flex-1 py-3 font-black uppercase text-xs border-2 border-black transition-all ${
                        allocationMode === mode ? 'bg-neo-blue text-white translate-x-1 translate-y-1 shadow-none' : 'bg-white shadow-neo hover:bg-slate-50'
                      }`}
                    >
                      {mode}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-black uppercase tracking-widest">Process Queue</h3>
                  <button 
                    onClick={() => setProcesses([...processes, { id: processes.length + 1, size: 10 }])}
                    className="bg-neo-green border-2 border-black p-1 shadow-neo active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                  >
                    <Plus size={20} strokeWidth={3} />
                  </button>
                </div>
                <div className="max-h-60 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                  {processes.map((p, idx) => (
                    <div key={idx} className="flex items-center gap-3 p-3 bg-white border-2 border-black shadow-neo-hover">
                      <span className="text-xs font-black bg-black text-white px-2 py-1 italic">P{p.id}</span>
                      <input 
                        type="number"
                        value={p.size}
                        onChange={e => {
                          const newProcesses = [...processes];
                          newProcesses[idx].size = Math.max(1, parseInt(e.target.value) || 0);
                          setProcesses(newProcesses);
                        }}
                        className="flex-1 px-3 py-1 bg-slate-50 border-2 border-black font-mono font-bold text-sm outline-none focus:bg-neo-yellow"
                      />
                      <button 
                        onClick={() => setProcesses(processes.filter((_, i) => i !== idx))}
                        className="text-neo-red hover:scale-110 transition-transform"
                      >
                        <Trash2 size={20} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <button 
                  onClick={simulate}
                  className="flex-1 bg-neo-green border-4 border-black py-4 font-black uppercase tracking-widest text-lg shadow-neo active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-3"
                >
                  <Play size={24} strokeWidth={3} /> EXECUTE
                </button>
                <button 
                  onClick={reset}
                  className="p-4 bg-slate-200 border-4 border-black shadow-neo active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
                >
                  <RotateCcw size={24} strokeWidth={3} />
                </button>
              </div>
            </div>
          </div>
        </div>

        <div className="lg:col-span-2 space-y-10">
          <div className="bg-white border-4 border-black p-8 shadow-neo-lg relative overflow-hidden">
            <h3 className="text-3xl font-display font-black mb-10 underline decoration-neo-green decoration-8 underline-offset-8">RAM MAP_VISUALIZER</h3>
            
            <div className="relative h-32 w-full bg-black border-4 border-black shadow-neo flex">
              {blocks.length === 0 && (
                <div className="w-full h-full flex items-center justify-center bg-white text-black font-black uppercase text-xl italic tracking-widest animate-pulse">
                  Init_Kernel_Required
                </div>
              )}
              {blocks.map((block, idx) => (
                <div 
                  key={idx}
                  style={{ width: `${(block.size / totalMemory) * 100}%` }}
                  className={`h-full relative border-r-4 border-black transition-all duration-500 group cursor-help ${
                    block.allocated ? 'bg-neo-pink' : 'bg-white'
                  }`}
                >
                  <div className="absolute inset-0 flex flex-col items-center justify-center overflow-hidden px-2">
                    {block.allocated ? (
                      <>
                        <span className="text-xl font-display font-black leading-none drop-shadow-[2px_2px_0px_#fff]">P{block.processId}</span>
                        <span className="text-xs font-black bg-black text-white px-1 mt-1">{block.size}U</span>
                      </>
                    ) : (
                      <span className="text-xs font-black uppercase tracking-tighter opacity-40 rotate-[-90deg]">FREE_{block.size}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12">
              <h3 className="text-xl font-black uppercase mb-6 tracking-widest flex items-center gap-3">
                <div className="w-8 h-2 bg-neo-pink border-2 border-black"></div> KERNEL LOGS
              </h3>
              <div className="bg-black border-4 border-black p-6 font-mono text-sm space-y-2 h-64 overflow-y-auto custom-scrollbar">
                {history.length === 0 ? (
                  <p className="text-slate-500 italic uppercase">System status: Idle. Awaiting user instructions...</p>
                ) : (
                  history.map((log, i) => (
                    <p key={i} className={`flex gap-4 ${log.includes('FAIL') ? 'text-neo-red font-black' : 'text-neo-green'}`}>
                      <span className="text-slate-500 font-bold shrink-0">[{i + 1}]</span>
                      <span className="uppercase tracking-tight">{log}</span>
                    </p>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemoryAllocation;
