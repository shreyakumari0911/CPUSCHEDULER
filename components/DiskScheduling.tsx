
import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Play, RotateCcw, TrendingUp, HardDrive } from 'lucide-react';

const DiskScheduling: React.FC = () => {
  const [headPosition, setHeadPosition] = useState(50);
  const [requests, setRequests] = useState("82, 170, 43, 140, 24, 16, 190");
  const [algorithm, setAlgorithm] = useState<'FCFS' | 'SCAN' | 'C-SCAN'>('FCFS');
  const [maxCylinders] = useState(200);

  const simulationData = useMemo(() => {
    const reqs = requests.split(',').map(r => parseInt(r.trim())).filter(r => !isNaN(r));
    if (reqs.length === 0) return { path: [], seekTime: 0 };

    let path: { step: number, cylinder: number }[] = [];
    let seekTime = 0;
    let current = headPosition;

    path.push({ step: 0, cylinder: current });

    if (algorithm === 'FCFS') {
      reqs.forEach((r, i) => {
        seekTime += Math.abs(r - current);
        current = r;
        path.push({ step: i + 1, cylinder: current });
      });
    } else if (algorithm === 'SCAN') {
      const sorted = [...reqs].sort((a, b) => a - b);
      const right = sorted.filter(r => r >= headPosition);
      const left = sorted.filter(r => r < headPosition).reverse();
      
      let step = 1;
      right.forEach(r => {
        seekTime += Math.abs(r - current);
        current = r;
        path.push({ step: step++, cylinder: current });
      });
      if (left.length > 0) {
        seekTime += Math.abs(maxCylinders - 1 - current);
        current = maxCylinders - 1;
        path.push({ step: step++, cylinder: current });
        left.forEach(r => {
          seekTime += Math.abs(r - current);
          current = r;
          path.push({ step: step++, cylinder: current });
        });
      }
    } else if (algorithm === 'C-SCAN') {
      const sorted = [...reqs].sort((a, b) => a - b);
      const right = sorted.filter(r => r >= headPosition);
      const left = sorted.filter(r => r < headPosition);

      let step = 1;
      right.forEach(r => {
        seekTime += Math.abs(r - current);
        current = r;
        path.push({ step: step++, cylinder: current });
      });
      if (left.length > 0) {
        seekTime += Math.abs(maxCylinders - 1 - current);
        current = maxCylinders - 1;
        path.push({ step: step++, cylinder: current });
        seekTime += Math.abs(0 - current);
        current = 0;
        path.push({ step: step++, cylinder: current });
        left.forEach(r => {
          seekTime += Math.abs(r - current);
          current = r;
          path.push({ step: step++, cylinder: current });
        });
      }
    }

    return { path, seekTime };
  }, [algorithm, headPosition, requests, maxCylinders]);

  return (
    <div className="space-y-12">
      <header className="bg-neo-blue border-4 border-black p-8 shadow-neo-lg rotate-[-1deg] text-white">
        <div className="rotate-[1deg]">
          <h2 className="text-5xl font-display font-black tracking-tighter uppercase drop-shadow-[4px_4px_0px_#000]">DISK ARM KERNEL</h2>
          <p className="text-black font-black mt-2 bg-neo-yellow px-3 py-1 border-2 border-black w-fit uppercase text-sm italic">Seek Optimization & Head Traversal Control</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-10">
        <div className="lg:col-span-1 space-y-8">
          <div className="bg-white border-4 border-black p-6 shadow-neo-lg">
            <h3 className="text-2xl font-display font-black mb-8 underline decoration-neo-pink decoration-4">INPUT_VECTORS</h3>
            <div className="space-y-8">
              <div>
                <label className="block text-xs font-black uppercase mb-3 tracking-widest">Arm Logic</label>
                <div className="grid grid-cols-1 gap-3">
                  {(['FCFS', 'SCAN', 'C-SCAN'] as const).map(algo => (
                    <button
                      key={algo}
                      onClick={() => setAlgorithm(algo)}
                      className={`px-6 py-4 font-black uppercase text-sm border-4 border-black transition-all ${
                        algorithm === algo ? 'bg-neo-pink text-white translate-x-1 translate-y-1 shadow-none' : 'bg-white shadow-neo hover:bg-slate-50'
                      }`}
                    >
                      {algo}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase mb-3 tracking-widest">Initial Sector Position</label>
                <input 
                  type="number"
                  value={headPosition}
                  onChange={e => setHeadPosition(Math.max(0, Math.min(maxCylinders - 1, parseInt(e.target.value) || 0)))}
                  className="w-full px-4 py-4 bg-slate-50 border-4 border-black font-mono font-black text-xl outline-none focus:bg-neo-green transition-all shadow-neo-hover"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase mb-3 tracking-widest">Traversal Queue</label>
                <textarea 
                  value={requests}
                  onChange={e => setRequests(e.target.value)}
                  className="w-full px-4 py-4 bg-slate-50 border-4 border-black font-mono font-black text-sm outline-none h-40 resize-none focus:bg-neo-yellow transition-all shadow-neo-hover placeholder:opacity-20 custom-scrollbar"
                  placeholder="Comma separated cylinders (0-199)"
                />
              </div>
            </div>
          </div>

          <div className="bg-black border-4 border-black p-8 text-white shadow-neo-lg flex flex-col items-center text-center rotate-[-2deg] hover:rotate-0 transition-transform">
            <div className="p-4 bg-neo-pink border-4 border-white shadow-neo mb-4">
                <HardDrive size={48} strokeWidth={3} className="text-black" />
            </div>
            <h4 className="text-xs font-black uppercase tracking-widest opacity-80 mb-2">SEEK_TIME_OVERHEAD</h4>
            <div className="text-6xl font-display font-black text-neo-yellow drop-shadow-[4px_4px_0px_#E67E22]">{simulationData.seekTime}</div>
            <p className="text-sm font-black mt-2 uppercase tracking-widest bg-white text-black px-2 skew-x-[-12deg]">Cylinders_Mapped</p>
          </div>
        </div>

        <div className="lg:col-span-3">
          <div className="bg-white border-4 border-black p-10 shadow-neo-lg relative overflow-hidden h-full min-h-[600px]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-neo-green border-b-4 border-l-4 border-black rotate-[-12deg] translate-x-16 translate-y-[-16px] flex items-end justify-start p-6">
                <TrendingUp size={48} strokeWidth={3} />
            </div>
            <h3 className="text-4xl font-display font-black mb-12 underline decoration-8 decoration-neo-blue underline-offset-8 italic">HEAD_MOVEMENT_VECTOR</h3>
            <div className="h-[500px] w-full bg-slate-50 border-4 border-black p-6 shadow-neo-hover relative">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart 
                  data={simulationData.path} 
                  layout="vertical" 
                  margin={{ top: 20, right: 40, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="0" stroke="#000" strokeWidth={1} opacity={0.1} />
                  <XAxis 
                    type="number" 
                    domain={[0, maxCylinders - 1]} 
                    orientation="top" 
                    stroke="#000" 
                    tick={{fontWeight: 'black', fontSize: 14}}
                    label={{ value: 'CYLINDER_INDEX', position: 'insideBottom', offset: -10, fontWeight: 'black', fontSize: 12 }}
                  />
                  <YAxis 
                    dataKey="step" 
                    type="number" 
                    reversed 
                    hide 
                  />
                  <Tooltip 
                    cursor={{ stroke: '#000', strokeWidth: 4, strokeDasharray: '8 8' }}
                    contentStyle={{ 
                        background: '#000', 
                        color: '#fff', 
                        border: '4px solid #F4D03F', 
                        borderRadius: '0px',
                        boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'
                    }}
                    labelStyle={{ display: 'none' }}
                    itemStyle={{ fontWeight: 'black', fontSize: '14px', textTransform: 'uppercase' }}
                    formatter={(val: number) => [`Pos: ${val}`, 'ARM_X']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="cylinder" 
                    stroke="#000" 
                    strokeWidth={6} 
                    dot={{ r: 10, fill: '#FF78C4', strokeWidth: 4, stroke: '#000' }}
                    activeDot={{ r: 14, fill: '#2ECC71', stroke: '#000', strokeWidth: 4 }}
                    animationDuration={1500}
                    animationEasing="ease-in-out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-8 flex flex-wrap items-center gap-10 justify-center">
              <div className="flex items-center gap-4 bg-neo-pink border-4 border-black px-4 py-2 shadow-neo-hover">
                <span className="w-4 h-4 bg-white border-2 border-black rounded-full"></span>
                <span className="text-sm font-black uppercase tracking-widest">Arm_Current</span>
              </div>
              <div className="flex items-center gap-4 bg-neo-yellow border-4 border-black px-4 py-2 shadow-neo-hover">
                <span className="w-8 h-2 bg-black"></span>
                <span className="text-sm font-black uppercase tracking-widest">Path_Vector</span>
              </div>
              <div className="flex items-center gap-4 bg-neo-green border-4 border-black px-4 py-2 shadow-neo-hover">
                <span className="text-sm font-mono font-black italic">000 - {maxCylinders - 1}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DiskScheduling;
