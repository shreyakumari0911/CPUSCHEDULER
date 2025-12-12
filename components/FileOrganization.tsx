
import React, { useState } from 'react';
import { Folder, File, Plus, UserPlus, Trash2, LayoutGrid, Layers, Monitor } from 'lucide-react';

interface FileItem {
  name: string;
  size: string;
}

interface Directory {
  name: string;
  files: FileItem[];
}

const FileOrganization: React.FC = () => {
  const [view, setView] = useState<'Single' | 'Two'>('Single');
  const [singleFiles, setSingleFiles] = useState<FileItem[]>([]);
  const [userDirs, setUserDirs] = useState<Directory[]>([
    { name: 'USER_A', files: [] },
    { name: 'USER_B', files: [] }
  ]);

  const [newFileName, setNewFileName] = useState('');
  const [selectedUser, setSelectedUser] = useState(0);

  const addFileSingle = () => {
    if (!newFileName) return;
    if (singleFiles.find(f => f.name === newFileName)) {
      alert("FS_ERROR: Duplicate Name");
      return;
    }
    setSingleFiles([...singleFiles, { name: newFileName, size: '2kb' }]);
    setNewFileName('');
  };

  const addFileTwo = () => {
    if (!newFileName) return;
    const newDirs = [...userDirs];
    if (newDirs[selectedUser].files.find(f => f.name === newFileName)) {
      alert("FS_ERROR: Duplicate Name");
      return;
    }
    newDirs[selectedUser].files.push({ name: newFileName, size: '2kb' });
    setUserDirs(newDirs);
    setNewFileName('');
  };

  const addUser = () => {
    const name = prompt("Enter username:");
    if (name) setUserDirs([...userDirs, { name: name.toUpperCase(), files: [] }]);
  };

  return (
    <div className="space-y-10">
      <header className="bg-neo-green border-4 border-black p-8 shadow-neo-lg rotate-[1deg]">
        <div className="rotate-[-1deg]">
          <h2 className="text-5xl font-display font-black tracking-tighter uppercase drop-shadow-[4px_4px_0px_#000]">FILE SYSTEMS</h2>
          <p className="text-black font-black mt-2 bg-white px-3 py-1 border-2 border-black w-fit uppercase text-sm italic">Directory Hierarchy Simulation Module</p>
        </div>
      </header>

      <div className="flex gap-6 p-2 bg-black neo-border w-fit mx-auto lg:mx-0 rotate-[-1deg]">
        <button 
          onClick={() => setView('Single')}
          className={`flex items-center gap-3 px-8 py-4 font-black uppercase text-lg transition-all ${
            view === 'Single' ? 'bg-neo-yellow translate-x-[-4px] translate-y-[-4px] shadow-neo' : 'text-white'
          }`}
        >
          <LayoutGrid size={24} strokeWidth={3} /> Flat System
        </button>
        <button 
          onClick={() => setView('Two')}
          className={`flex items-center gap-3 px-8 py-4 font-black uppercase text-lg transition-all ${
            view === 'Two' ? 'bg-neo-pink translate-x-[-4px] translate-y-[-4px] shadow-neo' : 'text-white'
          }`}
        >
          <Layers size={24} strokeWidth={3} /> 2-Tier
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        <div className="lg:col-span-4 space-y-8">
          <div className="bg-white border-4 border-black p-6 shadow-neo-lg">
            <h3 className="text-2xl font-display font-black mb-6 flex items-center gap-3 underline decoration-neo-orange decoration-4">
              <Monitor size={28} strokeWidth={3} className="text-black" /> FS MANAGER
            </h3>
            {view === 'Two' && (
              <div className="mb-6">
                <label className="text-xs font-black uppercase block mb-2 tracking-widest">Active User Context</label>
                <select 
                  className="w-full p-4 font-black bg-slate-100 border-4 border-black outline-none focus:bg-neo-yellow transition-all"
                  onChange={e => setSelectedUser(parseInt(e.target.value))}
                >
                  {userDirs.map((u, i) => <option key={i} value={i}>{u.name}</option>)}
                </select>
              </div>
            )}
            <div className="flex flex-col gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase block mb-1 tracking-widest">New File Identifier</label>
                <input 
                  type="text" 
                  placeholder="SYS_MANIFEST.LOG"
                  value={newFileName}
                  onChange={e => setNewFileName(e.target.value)}
                  className="w-full px-6 py-4 bg-slate-50 border-4 border-black font-mono font-black text-lg outline-none focus:bg-neo-green transition-all shadow-neo-hover placeholder:opacity-20"
                />
              </div>
              <button 
                onClick={view === 'Single' ? addFileSingle : addFileTwo}
                className="bg-neo-blue text-white py-5 border-4 border-black font-black uppercase tracking-widest text-xl shadow-neo active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-3"
              >
                <Plus size={28} strokeWidth={3} /> CREATE_FILE
              </button>
              {view === 'Two' && (
                <button 
                  onClick={addUser}
                  className="bg-neo-yellow text-black py-4 border-4 border-black font-black uppercase tracking-widest shadow-neo active:shadow-none active:translate-x-1 active:translate-y-1 transition-all flex items-center justify-center gap-3"
                >
                  <UserPlus size={24} strokeWidth={3} /> NEW_USER_DIR
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="lg:col-span-8">
          <div className="bg-white border-4 border-black p-10 shadow-neo-lg min-h-[500px] relative overflow-hidden">
             <div className="absolute top-0 left-0 w-full h-4 bg-black"></div>
            <h3 className="text-4xl font-display font-black mb-12 flex items-center gap-4 italic underline decoration-8 decoration-neo-green underline-offset-8">
              <Folder className="text-neo-yellow fill-black" size={48} strokeWidth={3} /> ROOT/
            </h3>

            {view === 'Single' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-8">
                {singleFiles.length === 0 && (
                  <div className="col-span-full py-20 border-4 border-dashed border-slate-300 flex flex-col items-center opacity-40">
                    <p className="text-3xl font-display font-black uppercase tracking-tighter italic">Drive_Is_Empty</p>
                  </div>
                )}
                {singleFiles.map((file, i) => (
                  <div key={i} className="group p-6 bg-white border-4 border-black shadow-neo-lg flex flex-col items-center gap-4 hover:bg-neo-yellow hover:rotate-[-2deg] transition-all relative">
                    <File size={48} strokeWidth={3} className="text-black" />
                    <span className="text-sm font-black text-black break-all text-center leading-tight uppercase font-mono">{file.name}</span>
                    <button 
                      onClick={() => setSingleFiles(singleFiles.filter((_, idx) => idx !== i))}
                      className="absolute -top-3 -right-3 bg-neo-red text-white p-2 border-2 border-black shadow-neo-hover opacity-0 group-hover:opacity-100 transition-all hover:scale-110"
                    >
                      <Trash2 size={16} strokeWidth={3} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-12">
                {userDirs.map((dir, userIdx) => (
                  <div key={userIdx} className="bg-slate-50 border-4 border-black p-8 shadow-neo relative hover:translate-x-[-4px] hover:translate-y-[-4px] hover:shadow-neo-lg transition-all group">
                    <div className="flex items-center justify-between mb-8 pb-4 border-b-4 border-black">
                      <div className="flex items-center gap-4 font-display font-black text-2xl uppercase tracking-tighter italic">
                        <Folder className="text-neo-blue fill-black" size={32} strokeWidth={3} /> {dir.name}/
                      </div>
                      <span className="text-sm font-black bg-black text-white px-3 py-1 skew-x-[-12deg]">{dir.files.length} ITEMS</span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                      {dir.files.length === 0 && <p className="col-span-full text-slate-400 font-black uppercase text-center py-6 border-2 border-dashed border-slate-300">Null_Pointer_Exception</p>}
                      {dir.files.map((file, fileIdx) => (
                        <div key={fileIdx} className="p-4 bg-white border-4 border-black flex flex-col items-center gap-2 shadow-neo-hover hover:bg-neo-pink hover:rotate-2 transition-all">
                          <File size={28} strokeWidth={3} className="text-black" />
                          <span className="text-[11px] font-black font-mono break-all text-center uppercase tracking-tighter leading-none">{file.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FileOrganization;
