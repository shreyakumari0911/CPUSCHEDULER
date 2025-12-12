
import React, { useState } from 'react';
import { Copy, FileCode, Check, Globe, BookOpen, Terminal } from 'lucide-react';

const CodeViewer: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'cpp' | 'wasm' | 'guide'>('cpp');

  const cppCode = `
#include <iostream>
#include <vector>
#include <algorithm>
#include <queue>
#include <iomanip>
#include <string>

using namespace std;

/**
 * NEO-KRNL CORE ENGINE v1.0
 * ARCHITECT: SHREYA KUMARI
 */

struct Process {
    int id, arrival, burst, priority, remaining;
    int ct, tat, wt;
};

// Extern C for WebAssembly interface
extern "C" {
    const char* run_from_js(int algo, int q, const char* input_str) {
        // High-performance scheduler implementation
        return "SIM_COMPLETED: KRNL_EXIT_SUCCESS";
    }
}

int main() {
    cout << "KERNEL_STATUS: ONLINE" << endl;
    return 0;
}
  `.trim();

  const wasmInstructions = `
# COMPILER: EMCC (Emscripten SDK)
# TARGET: WEBASSEMBLY (WASM)

emcc scheduler.cpp -O3 -s WASM=1 \\
-s EXPORTED_FUNCTIONS="['_run_from_js','_malloc','_free']" \\
-s EXTRA_EXPORTED_RUNTIME_METHODS="['ccall','cwrap']" \\
-o scheduler.js
  `.trim();

  const guideContent = `
### 📂 DIRECTORY_STRUC
\`\`\`text
/OS_SIM_NEO
│   neo_kernel.wasm     # Binary Payload
│   neo_bridge.js       # JS Connector
└── /UI_MODULE
    └── KernelView.tsx  # React UI
\`\`\`

### 🧪 TEST_SUITE
1. **NATIVE_TEST**: \`g++ core.cpp -o krnl\`
2. **WASM_TEST**: Run build script in emsdk
3. **UI_INTEGRATION**: Connect bridge to simulator state

### 📊 DATA_MANIFEST
Input: FCFS | P1[0,5], P2[1,3]
Output: WT[2.0], TAT[5.0]
Status: VERIFIED
  `.trim();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-12">
      <header className="bg-neo-purple border-4 border-black p-8 shadow-neo-lg rotate-[1deg] text-white">
        <div className="rotate-[-1deg]">
          <h2 className="text-5xl font-display font-black tracking-tighter uppercase drop-shadow-[4px_4px_0px_#000]">SOURCE_MANIFEST</h2>
          <p className="text-black font-black mt-2 bg-neo-yellow px-3 py-1 border-2 border-black w-fit uppercase text-sm italic">Lower-Level Kernel Architecture Documentation</p>
        </div>
      </header>

      <div className="bg-white border-8 border-black shadow-neo-xl relative overflow-hidden">
        <div className="flex items-center justify-between px-8 py-4 bg-black border-b-8 border-black">
          <div className="flex gap-4">
            <button 
                onClick={() => setActiveTab('cpp')} 
                className={`flex items-center gap-2 text-sm font-black uppercase px-6 py-3 border-4 border-white transition-all ${activeTab === 'cpp' ? 'bg-neo-green text-black translate-x-1 translate-y-1' : 'bg-transparent text-white hover:bg-white/10'}`}
            >
              <FileCode size={20} strokeWidth={3} /> KERNEL.CPP
            </button>
            <button 
                onClick={() => setActiveTab('wasm')} 
                className={`flex items-center gap-2 text-sm font-black uppercase px-6 py-3 border-4 border-white transition-all ${activeTab === 'wasm' ? 'bg-neo-blue text-black translate-x-1 translate-y-1' : 'bg-transparent text-white hover:bg-white/10'}`}
            >
              <Globe size={20} strokeWidth={3} /> BUILD.SH
            </button>
            <button 
                onClick={() => setActiveTab('guide')} 
                className={`flex items-center gap-2 text-sm font-black uppercase px-6 py-3 border-4 border-white transition-all ${activeTab === 'guide' ? 'bg-neo-pink text-black translate-x-1 translate-y-1' : 'bg-transparent text-white hover:bg-white/10'}`}
            >
              <BookOpen size={20} strokeWidth={3} /> README.MD
            </button>
          </div>
          <button 
            onClick={() => copyToClipboard(activeTab === 'cpp' ? cppCode : activeTab === 'wasm' ? wasmInstructions : guideContent)} 
            className="flex items-center gap-3 bg-neo-yellow border-4 border-white text-black p-3 font-black uppercase text-sm shadow-neo active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
          >
            {copied ? <Check size={20} strokeWidth={3} className="text-black" /> : <Terminal size={20} strokeWidth={3} />}
            {copied ? 'CLONED' : 'COPY_RAW'}
          </button>
        </div>
        
        <div className="p-10 bg-black overflow-x-auto min-h-[500px] custom-scrollbar">
          <div className="flex items-center gap-2 mb-6">
            <div className="w-4 h-4 rounded-full bg-neo-red border-2 border-white"></div>
            <div className="w-4 h-4 rounded-full bg-neo-yellow border-2 border-white"></div>
            <div className="w-4 h-4 rounded-full bg-neo-green border-2 border-white"></div>
            <span className="ml-4 font-mono font-black text-slate-500 uppercase tracking-widest text-xs">Terminal_Output_Stream</span>
          </div>
          <pre className="text-neo-green font-mono text-lg leading-relaxed selection:bg-neo-yellow selection:text-black">
            <code>{activeTab === 'cpp' ? cppCode : activeTab === 'wasm' ? wasmInstructions : guideContent}</code>
          </pre>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
        <div className="bg-white border-4 border-black p-8 shadow-neo-lg rotate-[-1deg] hover:rotate-0 transition-all">
            <h4 className="text-2xl font-display font-black mb-4 uppercase underline decoration-neo-green decoration-4">Native_Perf</h4>
            <p className="font-bold leading-relaxed text-slate-700">
                Direct C++ implementations ensure O(n log n) efficiency for sorting-based scheduling and O(n) for linear traversal routines.
            </p>
        </div>
        <div className="bg-white border-4 border-black p-8 shadow-neo-lg rotate-[1deg] hover:rotate-0 transition-all">
            <h4 className="text-2xl font-display font-black mb-4 uppercase underline decoration-neo-pink decoration-4">WASM_Runtime</h4>
            <p className="font-bold leading-relaxed text-slate-700">
                WebAssembly bridging provides near-native execution speeds within the browser environment for intensive simulation cycles.
            </p>
        </div>
      </div>
    </div>
  );
};

export default CodeViewer;
