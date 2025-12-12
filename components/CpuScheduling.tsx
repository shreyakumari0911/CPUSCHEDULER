
import React, { useState, useMemo } from 'react';
import { 
  Play, 
  RotateCcw, 
  Plus, 
  Trash2, 
  Clock, 
  Timer, 
  Info, 
  TrendingUp, 
  Zap,
  LayoutGrid,
  BarChart3
} from 'lucide-react';

interface Process {
  id: number;
  arrivalTime: number;
  burstTime: number;
  priority: number;
  remainingTime?: number;
}

interface GanttBlock {
  processId: number | string;
  startTime: number;
  endTime: number;
}

type AlgoType = 'FCFS' | 'SJF' | 'SRTF' | 'RR' | 'Priority' | 'P-Priority';

const NEO_COLORS = [
  'bg-neo-pink', 'bg-neo-blue', 'bg-neo-yellow', 
  'bg-neo-green', 'bg-neo-orange', 'bg-neo-purple',
  'bg-neo-red', 'bg-slate-200'
];

const CpuScheduling: React.FC = () => {
  const [processes, setProcesses] = useState<Process[]>([
    { id: 1, arrivalTime: 0, burstTime: 5, priority: 2 },
    { id: 2, arrivalTime: 1, burstTime: 3, priority: 1 },
    { id: 3, arrivalTime: 2, burstTime: 8, priority: 3 },
    { id: 4, arrivalTime: 3, burstTime: 6, priority: 4 },
  ]);
  const [algo, setAlgo] = useState<AlgoType>('FCFS');
  const [timeQuantum, setTimeQuantum] = useState(2);
  const [viewMode, setViewMode] = useState<'single' | 'compare'>('single');

  const addProcess = () => {
    const nextId = processes.length > 0 ? Math.max(...processes.map(p => p.id)) + 1 : 1;
    setProcesses([...processes, { id: nextId, arrivalTime: 0, burstTime: 1, priority: 1 }]);
  };

  const removeProcess = (id: number) => {
    setProcesses(processes.filter(p => p.id !== id));
  };

  const updateProcess = (id: number, field: keyof Process, value: number) => {
    setProcesses(processes.map(p => p.id === id ? { ...p, [field]: value } : p));
  };

  const runAlgo = (selectedAlgo: AlgoType, currentProcesses: Process[]) => {
    const gantt: GanttBlock[] = [];
    const results: Record<number, { ct: number, tat: number, wt: number }> = {};
    let currentTime = 0;
    const procs = currentProcesses.map(p => ({ ...p, remainingTime: p.burstTime }));
    const completed: number[] = [];
    const n = procs.length;

    if (n === 0) return { gantt: [], results: {}, avgWt: 0, avgTat: 0, totalTime: 0 };

    if (selectedAlgo === 'FCFS') {
      const sorted = [...procs].sort((a, b) => a.arrivalTime - b.arrivalTime || a.id - b.id);
      sorted.forEach(p => {
        if (currentTime < p.arrivalTime) {
          gantt.push({ processId: 'IDLE', startTime: currentTime, endTime: p.arrivalTime });
          currentTime = p.arrivalTime;
        }
        const start = currentTime;
        currentTime += p.burstTime;
        gantt.push({ processId: p.id, startTime: start, endTime: currentTime });
        results[p.id] = { ct: currentTime, tat: currentTime - p.arrivalTime, wt: (currentTime - p.arrivalTime) - p.burstTime };
      });
    } else if (selectedAlgo === 'SJF') {
      let temp = [...procs];
      while (completed.length < n) {
        const available = temp.filter(p => p.arrivalTime <= currentTime && !completed.includes(p.id));
        if (available.length === 0) {
          const nextArrival = Math.min(...temp.filter(p => !completed.includes(p.id)).map(p => p.arrivalTime));
          gantt.push({ processId: 'IDLE', startTime: currentTime, endTime: nextArrival });
          currentTime = nextArrival;
          continue;
        }
        const best = available.reduce((prev, curr) => (prev.burstTime < curr.burstTime) ? prev : (prev.burstTime === curr.burstTime ? (prev.arrivalTime < curr.arrivalTime ? prev : curr) : curr));
        const start = currentTime;
        currentTime += best.burstTime;
        gantt.push({ processId: best.id, startTime: start, endTime: currentTime });
        results[best.id] = { ct: currentTime, tat: currentTime - best.arrivalTime, wt: (currentTime - best.arrivalTime) - best.burstTime };
        completed.push(best.id);
      }
    } else if (selectedAlgo === 'SRTF') {
      let temp = procs.map(p => ({ ...p }));
      while (completed.length < n) {
        const available = temp.filter(p => p.arrivalTime <= currentTime && !completed.includes(p.id));
        if (available.length === 0) {
          const next = Math.min(...temp.filter(p => !completed.includes(p.id)).map(p => p.arrivalTime));
          gantt.push({ processId: 'IDLE', startTime: currentTime, endTime: next });
          currentTime = next;
          continue;
        }
        const best = available.reduce((prev, curr) => (prev.remainingTime! < curr.remainingTime!) ? prev : curr);
        const start = currentTime;
        currentTime++;
        best.remainingTime!--;
        if (gantt.length > 0 && gantt[gantt.length - 1].processId === best.id) gantt[gantt.length - 1].endTime = currentTime;
        else gantt.push({ processId: best.id, startTime: start, endTime: currentTime });
        if (best.remainingTime === 0) {
          results[best.id] = { ct: currentTime, tat: currentTime - best.arrivalTime, wt: (currentTime - best.arrivalTime) - best.burstTime };
          completed.push(best.id);
        }
      }
    } else if (selectedAlgo === 'RR') {
      let queue: (typeof procs[0])[] = [];
      let temp = procs.map(p => ({ ...p }));
      let arrivals = [...temp].sort((a, b) => a.arrivalTime - b.arrivalTime || a.id - b.id);
      while (completed.length < n || queue.length > 0) {
        while (arrivals.length > 0 && arrivals[0].arrivalTime <= currentTime) queue.push(arrivals.shift()!);
        if (queue.length === 0 && arrivals.length > 0) {
          const next = arrivals[0].arrivalTime;
          gantt.push({ processId: 'IDLE', startTime: currentTime, endTime: next });
          currentTime = next;
          while (arrivals.length > 0 && arrivals[0].arrivalTime <= currentTime) queue.push(arrivals.shift()!);
        }
        if (queue.length > 0) {
          const currentProc = queue.shift()!;
          const start = currentTime;
          const slice = Math.min(currentProc.remainingTime!, timeQuantum);
          currentTime += slice;
          currentProc.remainingTime! -= slice;
          gantt.push({ processId: currentProc.id, startTime: start, endTime: currentTime });
          while (arrivals.length > 0 && arrivals[0].arrivalTime <= currentTime) queue.push(arrivals.shift()!);
          if (currentProc.remainingTime! > 0) queue.push(currentProc);
          else {
            results[currentProc.id] = { ct: currentTime, tat: currentTime - currentProc.arrivalTime, wt: (currentTime - currentProc.arrivalTime) - currentProc.burstTime };
            completed.push(currentProc.id);
          }
        }
      }
    } else if (selectedAlgo === 'Priority') {
      let temp = [...procs];
      while (completed.length < n) {
        const available = temp.filter(p => p.arrivalTime <= currentTime && !completed.includes(p.id));
        if (available.length === 0) {
          const next = Math.min(...temp.filter(p => !completed.includes(p.id)).map(p => p.arrivalTime));
          gantt.push({ processId: 'IDLE', startTime: currentTime, endTime: next });
          currentTime = next;
          continue;
        }
        const best = available.reduce((prev, curr) => (prev.priority < curr.priority) ? prev : (prev.priority === curr.priority ? (prev.arrivalTime < curr.arrivalTime ? prev : curr) : curr));
        const start = currentTime;
        currentTime += best.burstTime;
        gantt.push({ processId: best.id, startTime: start, endTime: currentTime });
        results[best.id] = { ct: currentTime, tat: currentTime - best.arrivalTime, wt: (currentTime - best.arrivalTime) - best.burstTime };
        completed.push(best.id);
      }
    } else if (selectedAlgo === 'P-Priority') {
      let temp = procs.map(p => ({ ...p }));
      while (completed.length < n) {
        const available = temp.filter(p => p.arrivalTime <= currentTime && !completed.includes(p.id));
        if (available.length === 0) {
          const next = Math.min(...temp.filter(p => !completed.includes(p.id)).map(p => p.arrivalTime));
          gantt.push({ processId: 'IDLE', startTime: currentTime, endTime: next });
          currentTime = next;
          continue;
        }
        const best = available.reduce((prev, curr) => (prev.priority < curr.priority) ? prev : (prev.priority === curr.priority ? (prev.arrivalTime < curr.arrivalTime ? prev : curr) : curr));
        const start = currentTime;
        currentTime++;
        best.remainingTime!--;
        if (gantt.length > 0 && gantt[gantt.length - 1].processId === best.id) gantt[gantt.length - 1].endTime = currentTime;
        else gantt.push({ processId: best.id, startTime: start, endTime: currentTime });
        if (best.remainingTime === 0) {
          results[best.id] = { ct: currentTime, tat: currentTime - best.arrivalTime, wt: (currentTime - best.arrivalTime) - best.burstTime };
          completed.push(best.id);
        }
      }
    }

    const avgWt = Object.values(results).reduce((acc, curr) => acc + curr.wt, 0) / n;
    const avgTat = Object.values(results).reduce((acc, curr) => acc + curr.tat, 0) / n;
    return { gantt, results, avgWt, avgTat, totalTime: currentTime };
  };

  const currentResult = useMemo(() => runAlgo(algo, processes), [processes, algo, timeQuantum]);
  
  const comparisonResults = useMemo(() => {
    if (viewMode !== 'compare') return [];
    return (['FCFS', 'SJF', 'SRTF', 'RR', 'Priority', 'P-Priority'] as AlgoType[]).map(a => ({
      name: a,
      ...runAlgo(a, processes)
    }));
  }, [processes, viewMode, timeQuantum]);

  return (
    <div className="space-y-12">
      <header className="bg-neo-blue border-4 border-black p-8 shadow-neo-lg flex flex-col md:flex-row md:items-center justify-between gap-6 rotate-[-1deg]">
        <div className="rotate-[1deg]">
          <h2 className="text-5xl font-display font-black tracking-tighter text-white drop-shadow-[4px_4px_0px_#000]">CPU SCHEDULER</h2>
          <p className="text-black font-bold mt-2 bg-neo-yellow px-3 py-1 border-2 border-black w-fit uppercase text-sm">Hardware-level Process Sequencing Engine</p>
        </div>
        <div className="flex bg-black p-2 neo-border rotate-[1deg]">
          <button 
            onClick={() => setViewMode('single')}
            className={`px-6 py-3 font-black uppercase text-sm transition-all ${viewMode === 'single' ? 'bg-neo-yellow translate-y-[-2px] translate-x-[-2px] shadow-neo' : 'text-white'}`}
          >
            Terminal View
          </button>
          <button 
            onClick={() => setViewMode('compare')}
            className={`px-6 py-3 font-black uppercase text-sm transition-all ${viewMode === 'compare' ? 'bg-neo-pink translate-y-[-2px] translate-x-[-2px] shadow-neo' : 'text-white'}`}
          >
            Benchmarking
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border-4 border-black p-6 shadow-neo-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-2 bg-black"></div>
            <h3 className="text-2xl font-display font-black mb-6 flex items-center gap-3">
              <Zap size={24} strokeWidth={3} className="text-neo-orange" /> KERNEL CONFIG
            </h3>
            
            <div className="space-y-6">
              {viewMode === 'single' && (
                <div>
                  <label className="block text-xs font-black uppercase mb-3 tracking-widest">Algorithm Protocol</label>
                  <div className="grid grid-cols-2 gap-3">
                    {(['FCFS', 'SJF', 'SRTF', 'RR', 'Priority', 'P-Priority'] as const).map(a => (
                      <button
                        key={a}
                        onClick={() => setAlgo(a)}
                        className={`px-4 py-3 font-black text-xs border-2 border-black transition-all ${
                          algo === a ? 'bg-neo-green translate-x-1 translate-y-1 shadow-none' : 'bg-white shadow-neo hover:bg-slate-50'
                        }`}
                      >
                        {a}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {(algo === 'RR' || viewMode === 'compare') && (
                <div className="p-4 bg-slate-50 border-4 border-black">
                  <label className="block text-xs font-black uppercase mb-2">Time Slice (Δt)</label>
                  <input 
                    type="number"
                    value={timeQuantum}
                    onChange={e => setTimeQuantum(Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-4 py-3 bg-white border-2 border-black font-mono font-bold focus:bg-neo-yellow transition-colors outline-none"
                  />
                </div>
              )}

              <div>
                <div className="flex items-center justify-between mb-4">
                  <label className="block text-xs font-black uppercase tracking-widest">Process Stack</label>
                  <button onClick={addProcess} className="bg-neo-green border-2 border-black p-1 shadow-neo active:shadow-none active:translate-x-1 active:translate-y-1 transition-all">
                    <Plus size={24} strokeWidth={3} />
                  </button>
                </div>
                <div className="max-h-[400px] overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                  {processes.map((p) => (
                    <div key={p.id} className="p-4 bg-white border-4 border-black shadow-neo relative group hover:rotate-[-1deg] transition-all">
                      <div className="grid grid-cols-3 gap-3">
                        <div>
                          <label className="text-[10px] font-black uppercase block mb-1">Arr.</label>
                          <input 
                            type="number" 
                            value={p.arrivalTime} 
                            onChange={e => updateProcess(p.id, 'arrivalTime', Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full bg-slate-50 border-2 border-black px-2 py-1 font-mono font-bold text-xs focus:bg-neo-yellow outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase block mb-1">Burst</label>
                          <input 
                            type="number" 
                            value={p.burstTime} 
                            onChange={e => updateProcess(p.id, 'burstTime', Math.max(1, parseInt(e.target.value) || 1))}
                            className="w-full bg-slate-50 border-2 border-black px-2 py-1 font-mono font-bold text-xs focus:bg-neo-yellow outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[10px] font-black uppercase block mb-1">Prio.</label>
                          <input 
                            type="number" 
                            value={p.priority} 
                            onChange={e => updateProcess(p.id, 'priority', Math.max(0, parseInt(e.target.value) || 0))}
                            className="w-full bg-slate-50 border-2 border-black px-2 py-1 font-mono font-bold text-xs focus:bg-neo-yellow outline-none"
                          />
                        </div>
                      </div>
                      <span className="absolute -left-3 -top-3 w-8 h-8 flex items-center justify-center bg-black text-white font-display font-black text-xs border-2 border-black shadow-neo-hover">
                        P{p.id}
                      </span>
                      <button 
                        onClick={() => removeProcess(p.id)}
                        className="absolute -right-3 -top-3 bg-neo-red text-white p-1 border-2 border-black shadow-neo-hover opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                      >
                        <Trash2 size={16} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
          
          {viewMode === 'single' && (
            <div className="grid grid-cols-2 gap-6">
              <div className="bg-neo-green p-6 border-4 border-black shadow-neo-lg text-center rotate-[2deg]">
                <Clock className="mx-auto mb-2 text-black" size={32} strokeWidth={3} />
                <span className="text-xs font-black uppercase tracking-widest">AVG WAIT</span>
                <div className="text-4xl font-display font-black mt-1">{currentResult.avgWt.toFixed(2)}</div>
              </div>
              <div className="bg-neo-pink p-6 border-4 border-black shadow-neo-lg text-center rotate-[-2deg]">
                <Timer className="mx-auto mb-2 text-black" size={32} strokeWidth={3} />
                <span className="text-xs font-black uppercase tracking-widest">AVG TAT</span>
                <div className="text-4xl font-display font-black mt-1">{currentResult.avgTat.toFixed(2)}</div>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-8 space-y-10">
          {viewMode === 'single' ? (
            <>
              <div className="bg-white border-4 border-black p-8 shadow-neo-lg">
                <h3 className="text-3xl font-display font-black mb-8 flex justify-between items-center underline decoration-neo-blue decoration-8 underline-offset-8">
                  TIMELINE
                  <span className="text-sm font-black bg-black text-white px-4 py-1 skew-x-[-12deg]">{algo}</span>
                </h3>
                <div className="overflow-x-auto pb-10 custom-scrollbar">
                  <div className="flex min-w-full h-24 items-end">
                    {currentResult.gantt.map((block, i) => {
                      const duration = block.endTime - block.startTime;
                      const widthPercent = (duration / currentResult.totalTime) * 100;
                      const color = block.processId === 'IDLE' ? 'bg-slate-200' : NEO_COLORS[typeof block.processId === 'number' ? block.processId % (NEO_COLORS.length - 1) : 0];

                      return (
                        <div 
                          key={i} 
                          style={{ width: `${widthPercent}%`, minWidth: '60px' }}
                          className={`h-20 flex flex-col items-center justify-center relative border-4 border-black transition-all hover:translate-y-[-8px] group ${color}`}
                        >
                          <span className="font-display font-black text-xl uppercase drop-shadow-[2px_2px_0px_#fff]">{block.processId === 'IDLE' ? '---' : `P${block.processId}`}</span>
                          <span className="absolute top-full mt-3 text-xs font-mono font-black bg-black text-white px-1 left-0 translate-x-[-50%] z-10">{block.startTime}</span>
                          {i === currentResult.gantt.length - 1 && (
                            <span className="absolute top-full mt-3 text-xs font-mono font-black bg-black text-white px-1 right-0 translate-x-[50%] z-10">{block.endTime}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="bg-black border-4 border-black p-1 shadow-neo-lg overflow-hidden">
                <table className="w-full text-left bg-white border-collapse">
                  <thead>
                    <tr className="bg-neo-yellow border-b-4 border-black">
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest border-r-4 border-black">Process</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-center border-r-4 border-black">Arr.</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-center border-r-4 border-black">Burst</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-center border-r-4 border-black">Finish</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-center border-r-4 border-black">TAT</th>
                      <th className="px-6 py-4 text-xs font-black uppercase tracking-widest text-center">Wait</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y-4 divide-black">
                    {[...processes].sort((a,b) => a.id - b.id).map(p => {
                      const res = currentResult.results[p.id];
                      return (
                        <tr key={p.id} className="hover:bg-slate-50 transition-colors font-bold">
                          <td className="px-6 py-4 flex items-center gap-3 border-r-4 border-black">
                            <div className={`w-6 h-6 border-2 border-black shadow-neo-hover ${NEO_COLORS[p.id % (NEO_COLORS.length - 1)]}`}></div>
                            <span className="font-display font-black text-lg italic">P{p.id}</span>
                          </td>
                          <td className="px-6 py-4 text-center font-mono text-lg border-r-4 border-black">{p.arrivalTime}</td>
                          <td className="px-6 py-4 text-center font-mono text-lg border-r-4 border-black">{p.burstTime}</td>
                          <td className="px-6 py-4 text-center font-mono text-lg font-black border-r-4 border-black bg-slate-50">{res?.ct ?? '-'}</td>
                          <td className="px-6 py-4 text-center font-mono text-lg font-black text-neo-blue border-r-4 border-black">{res?.tat ?? '-'}</td>
                          <td className="px-6 py-4 text-center font-mono text-lg font-black text-neo-pink">{res?.wt ?? '-'}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          ) : (
            <div className="space-y-10">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {comparisonResults.map((res, idx) => (
                  <div key={res.name} className={`bg-white border-4 border-black p-6 shadow-neo-lg hover:rotate-[1deg] transition-all flex flex-col justify-between ${idx % 3 === 0 ? 'bg-neo-yellow' : idx % 3 === 1 ? 'bg-neo-pink' : 'bg-neo-green'}`}>
                    <div className="flex justify-between items-center mb-6 overflow-hidden">
                      <span className={`${res.name.length > 8 ? 'text-2xl' : 'text-3xl'} font-display font-black tracking-tighter uppercase truncate mr-2`}>
                        {res.name}
                      </span>
                      <div className="bg-black text-white text-[10px] font-black px-2 py-1 uppercase tracking-widest shrink-0">KRNL_{idx}</div>
                    </div>
                    <div className="space-y-4">
                      <div className="bg-white border-4 border-black p-4 shadow-neo-hover">
                        <p className="text-[10px] font-black uppercase mb-1">AVG WAIT</p>
                        <p className="text-3xl font-display font-black">{res.avgWt.toFixed(2)}</p>
                      </div>
                      <div className="bg-white border-4 border-black p-4 shadow-neo-hover">
                        <p className="text-[10px] font-black uppercase mb-1">AVG TAT</p>
                        <p className="text-3xl font-display font-black">{res.avgTat.toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-neo-blue border-4 border-black p-8 shadow-neo-lg rotate-[1deg] text-white">
                <h4 className="text-2xl font-display font-black mb-4 uppercase text-black drop-shadow-[2px_2px_0px_#fff]">Efficiency Audit</h4>
                <p className="text-lg font-medium leading-relaxed italic border-l-8 border-black pl-6">
                  Benchmarks reveal that <strong className="bg-black text-neo-yellow px-2 uppercase font-black">SRTF</strong> and <strong className="bg-black text-neo-pink px-2 uppercase font-black">P-Priority</strong> minimize wait cycles, while <strong className="bg-black text-neo-green px-2 uppercase font-black">Round Robin</strong> ensures deterministic time-slicing across the entire process register.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CpuScheduling;
