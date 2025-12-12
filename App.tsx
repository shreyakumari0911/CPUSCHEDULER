
import React, { useState } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Cpu, 
  Layers, 
  FolderTree, 
  Disc, 
  Code,
  Menu,
  X,
  Activity,
  Terminal
} from 'lucide-react';

import MemoryAllocation from './components/MemoryAllocation';
import PageReplacement from './components/PageReplacement';
import FileOrganization from './components/FileOrganization';
import DiskScheduling from './components/DiskScheduling';
import CpuScheduling from './components/CpuScheduling';
import CodeViewer from './components/CodeViewer';

interface SidebarLinkProps {
  to: string;
  icon: any;
  label: string;
  active: boolean;
}

const SidebarLink: React.FC<SidebarLinkProps> = ({ to, icon: Icon, label, active }) => (
  <Link
    to={to}
    className={`flex items-center gap-4 px-6 py-4 border-2 border-black transition-all mb-4 ${
      active 
        ? 'bg-neo-yellow translate-x-1 translate-y-1 shadow-none' 
        : 'bg-white shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:bg-slate-50 hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[6px_6px_0px_0px_rgba(0,0,0,1)]'
    }`}
  >
    <Icon size={24} strokeWidth={3} />
    <span className="font-display font-black text-lg uppercase tracking-tight">{label}</span>
  </Link>
);

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();

  const navigation = [
    { path: '/', label: 'CPU', icon: Activity },
    { path: '/memory-allocation', label: 'Memory', icon: Cpu },
    { path: '/page-replacement', label: 'Paging', icon: Layers },
    { path: '/file-organization', label: 'Files', icon: FolderTree },
    { path: '/disk-scheduling', label: 'Disk', icon: Disc },
    { path: '/cpp-source', label: 'Module Code', icon: Code },
  ];

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Mobile Menu Button */}
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed bottom-8 right-8 z-50 p-4 bg-neo-pink border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 transition-all"
      >
        {isOpen ? <X size={32} strokeWidth={3} /> : <Menu size={32} strokeWidth={3} />}
      </button>

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-40 w-80 bg-white border-r-4 border-black p-8 transform transition-transform duration-500 ease-[cubic-bezier(0.87,0,0.13,1)]
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0
      `}>
        <div className="flex flex-col h-full">
          <div className="flex items-center gap-4 mb-12 p-4 bg-neo-green border-4 border-black shadow-[6px_6px_0px_0px_rgba(0,0,0,1)] rotate-[-2deg]">
            <Terminal size={32} strokeWidth={3} />
            <h1 className="text-3xl font-display font-black tracking-tighter">NEO-KRNL</h1>
          </div>
          
          <nav className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {navigation.map((item) => (
              <SidebarLink 
                key={item.path}
                to={item.path}
                label={item.label}
                icon={item.icon}
                active={location.pathname === item.path}
              />
            ))}
          </nav>
          
          <div className="mt-8 pt-6 border-t-4 border-black">
            <div className="p-5 bg-neo-blue border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] rotate-[1deg]">
              <p className="text-xs font-black uppercase mb-1 tracking-widest">System Architect</p>
              <p className="text-xl font-display font-black leading-tight">Shreya Kumari</p>
              <p className="text-sm font-bold opacity-80 font-mono mt-1">ID: 22BSA10327</p>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 lg:ml-80 p-6 lg:p-12 transition-all">
        <div className="max-w-6xl mx-auto animate-in fade-in slide-in-from-bottom-8 duration-500">
          {children}
        </div>
      </main>
    </div>
  );
};

export default function App() {
  return (
    <HashRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<CpuScheduling />} />
          <Route path="/memory-allocation" element={<MemoryAllocation />} />
          <Route path="/page-replacement" element={<PageReplacement />} />
          <Route path="/file-organization" element={<FileOrganization />} />
          <Route path="/disk-scheduling" element={<DiskScheduling />} />
          <Route path="/cpp-source" element={<CodeViewer />} />
        </Routes>
      </Layout>
    </HashRouter>
  );
}
