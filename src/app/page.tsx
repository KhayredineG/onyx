"use client";

import { useEffect, useState, useTransition } from "react";
import Airlock from "@/components/Airlock";
import Editor from "@/components/Editor";
import TimeTravel from "@/components/TimeTravel";
import Tagging from "@/components/Tagging";
import { useOnyxStore } from "@/lib/store";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Search, Tag, X, Save, Trash2, ArrowLeft, Clock, Copy, User } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getPrompts, createPrompt, updatePrompt, deletePrompt, getPromptVersions, toggleArchivePrompt } from "@/lib/actions";
import { Toaster, toast } from "sonner";
import { Archive, ArchiveRestore } from "lucide-react";

export default function Home() {
  const { isUnlocked, setUnlocked, prompts, setPrompts, activePrompt, setActivePrompt } = useOnyxStore();
  const [mounted, setMounted] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [versions, setVersions] = useState<any[]>([]);
  const [currentVersionIndex, setCurrentVersionIndex] = useState(0);
  const [isGlitching, setIsGlitching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("All Prompts");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setMounted(true);
    if (isUnlocked) {
      loadPrompts();
    }
  }, [isUnlocked]);

  const loadPrompts = async () => {
    const data = await getPrompts();
    setPrompts(data as any);
  };

  const handleSelectPrompt = async (prompt: any) => {
    setActivePrompt(prompt);
    setIsEditing(true);
    const v = await getPromptVersions(prompt.id);
    setVersions(v);
    setCurrentVersionIndex(0);
  };

  const handleCreateNew = async () => {
    const p = await createPrompt("NEW_PROTOCOL", "System.Instruction: ");
    setActivePrompt(p as any);
    setIsEditing(true);
    setVersions([{ snapshotContent: p.content }]);
    setCurrentVersionIndex(0);
    loadPrompts();
  };

  const handleSave = async () => {
    if (!activePrompt) return;
    const promise = (async () => {
      const result = await updatePrompt(activePrompt.id, activePrompt.content, activePrompt.title, activePrompt.author || undefined);
      if (!result.success) {
        throw new Error(result.error);
      }
      return result.data;
    })();

    toast.promise(promise, {
      loading: "Committing protocol...",
      success: "Protocol committed to secure storage.",
      error: (data: any) => `Commit failed: ${data.message || "Unknown error"}`,
    });

    await promise;
    const v = await getPromptVersions(activePrompt.id);
    setVersions(v);
    setCurrentVersionIndex(0);
    loadPrompts();
  };

  const handleDelete = async () => {
    if (!activePrompt) return;
    await deletePrompt(activePrompt.id);
    setIsEditing(false);
    setActivePrompt(null);
    loadPrompts();
  };

  const handleArchiveToggle = async () => {
    if (!activePrompt) return;
    const newStatus = !activePrompt.isArchived;

    const promise = toggleArchivePrompt(activePrompt.id, activePrompt.isArchived);
    toast.promise(promise, {
      loading: "Updating archive status...",
      success: newStatus ? "Protocol archived." : "Protocol restored.",
      error: "Failed to update status."
    });

    await promise;
    setIsEditing(false);
    setActivePrompt(null);
    loadPrompts();
  };

  const handleVersionChange = (index: number) => {
    setIsGlitching(true);
    setCurrentVersionIndex(index);
    if (activePrompt) {
      setActivePrompt({ ...activePrompt, content: versions[index].snapshotContent });
    }
    setTimeout(() => setIsGlitching(false), 200);
  };

  if (!mounted) return null;

  return (
    <main className="min-h-screen bg-[#0a0a0a] text-zinc-300 font-sans selection:bg-zinc-800 selection:text-zinc-100">
      <AnimatePresence mode="wait">
        {!isUnlocked ? (
          <Airlock key="airlock" onUnlock={() => setUnlocked(true)} />
        ) : isEditing && activePrompt ? (
          <motion.div
            key="editor"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="h-screen flex flex-col"
          >
            {/* Editor Header */}
            <header className="flex items-center justify-between px-8 py-6 border-b border-zinc-900 bg-[#0a0a0a]">
              <div className="flex items-center space-x-6">
                <button onClick={() => setIsEditing(false)} className="p-2 hover:bg-zinc-900 text-zinc-500 hover:text-zinc-200 transition-all">
                  <ArrowLeft className="w-4 h-4" />
                </button>
                <div className="space-y-1">
                  <div className="flex items-center space-x-4">
                    <input
                      value={activePrompt.title}
                      onChange={(e) => setActivePrompt({ ...activePrompt, title: e.target.value })}
                      className="bg-transparent border-none focus:ring-0 text-zinc-100 uppercase tracking-[0.2em] font-light text-sm p-0 w-64"
                      placeholder="PROTOCOL_TITLE"
                    />
                    <div className="flex items-center space-x-2 border-l border-zinc-800 pl-4">
                      <User className="w-3 h-3 text-zinc-600" />
                      <input
                        value={activePrompt.author || ""}
                        onChange={(e) => setActivePrompt({ ...activePrompt, author: e.target.value })}
                        className="bg-transparent border-none focus:ring-0 text-zinc-400 uppercase tracking-widest font-mono text-xs p-0 w-32"
                        placeholder="AUTHOR_ID"
                      />
                    </div>
                  </div>
                  <p className="text-[9px] text-zinc-600 uppercase tracking-tighter">Edit Mode // Buffer active</p>
                </div>
              </div>
              <div className="flex items-center space-x-3">
                <Button onClick={handleArchiveToggle} variant="ghost" className="text-zinc-600 hover:text-zinc-300 hover:bg-zinc-900 text-[10px] uppercase tracking-widest font-light h-8">
                  {activePrompt.isArchived ? (
                    <><ArchiveRestore className="w-3.5 h-3.5 mr-2" /> Restore</>
                  ) : (
                    <><Archive className="w-3.5 h-3.5 mr-2" /> Archive</>
                  )}
                </Button>
                <Button onClick={handleDelete} variant="ghost" className="text-zinc-600 hover:text-red-400 hover:bg-red-950/20 text-[10px] uppercase tracking-widest font-light h-8">
                  <Trash2 className="w-3.5 h-3.5 mr-2" /> Decommission
                </Button>
                <Button onClick={handleSave} className="bg-zinc-100 text-zinc-900 hover:bg-zinc-300 text-[10px] uppercase tracking-widest font-bold h-8 rounded-none px-6">
                  <Save className="w-3.5 h-3.5 mr-2" /> Commit
                </Button>
              </div>
            </header>

            {/* Main Editor Area */}
            <div className="flex-1 overflow-auto p-16 flex justify-center">
              <div className="w-full max-w-4xl grid grid-cols-12 gap-12">
                <div className="col-span-8">
                  <Editor
                    initialContent={activePrompt.content}
                    onChange={(val) => setActivePrompt({ ...activePrompt, content: val })}
                    isGlitching={isGlitching}
                  />
                </div>
                <aside className="col-span-4 space-y-8 pt-2">
                  <Tagging
                    promptId={activePrompt.id}
                    tags={activePrompt.tags || []}
                  />
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-zinc-600">
                      <Clock className="w-3.5 h-3.5" />
                      <span className="text-[10px] uppercase tracking-[0.2em]">Metadata</span>
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] text-zinc-600 uppercase">Created: {new Date(activePrompt.createdAt).toLocaleDateString()}</p>
                      <p className="text-[9px] text-zinc-600 uppercase">Status: ENCRYPTED</p>
                    </div>
                  </div>
                </aside>
              </div>
            </div>

            {/* Time Travel Scrubber */}
            <TimeTravel
              versions={versions}
              currentIndex={currentVersionIndex}
              onIndexChange={handleVersionChange}
            />
          </motion.div>
        ) : (
          <motion.div
            key="dashboard"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="p-8 max-w-7xl mx-auto space-y-12"
          >
            {/* Navigation / Header */}
            <header className="flex items-center justify-between border-b border-zinc-900 pb-8">
              <div className="space-y-1">
                <h1 className="text-xl font-light tracking-[0.2em] text-zinc-100 uppercase">Onyx Terminal</h1>
                <p className="text-xs text-zinc-500 uppercase tracking-tighter">System Ready // Session: Alpha-01</p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="relative group">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-600 group-focus-within:text-zinc-400 transition-colors" />
                  <Input
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="SEARCH_INDEX"
                    className="pl-10 bg-zinc-950 border-zinc-800 focus-visible:ring-0 focus-visible:border-zinc-600 w-64 h-9 rounded-none text-xs tracking-widest"
                  />
                </div>
                <Button onClick={handleCreateNew} variant="outline" className="h-9 border-zinc-800 rounded-none hover:bg-zinc-900 uppercase tracking-widest text-xs font-light">
                  <Plus className="w-4 h-4 mr-2" /> New Entry
                </Button>
              </div>
            </header>

            {/* Content Grid */}
            <div className="grid grid-cols-12 gap-8">
              {/* Sidebar / Tags */}
              <aside className="col-span-3 space-y-8">
                <div className="space-y-4">
                  <h2 className="text-[10px] text-zinc-600 uppercase tracking-[0.3em] font-medium">Categories</h2>
                  <nav className="space-y-1">
                    {["All Prompts", "Production", "Research", "Archived"].map((item) => (
                      <button
                        key={item}
                        onClick={() => setActiveCategory(item)}
                        className={`w-full flex items-center justify-between px-3 py-2 text-xs uppercase tracking-widest transition-all border-l-2 ${activeCategory === item
                          ? "border-zinc-100 text-zinc-100 bg-zinc-900/50"
                          : "border-transparent text-zinc-500 hover:text-zinc-200 hover:border-zinc-700"
                          }`}
                      >
                        {item}
                        {activeCategory === item && <ChevronRight className="w-3 h-3" />}
                      </button>
                    ))}
                  </nav>
                </div>
              </aside>

              {/* Main List */}
              <section className="col-span-9 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  {prompts
                    .filter(p => {
                      // 1. Search Filtering
                      const matchesSearch =
                        p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        p.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (p.tags && p.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())));

                      if (!matchesSearch) return false;

                      // 2. Category Filtering
                      if (activeCategory === "Archived") return p.isArchived;
                      if (activeCategory === "All Prompts") return !p.isArchived;

                      // For other categories (Production/Research), check tags (if implemented) or just standard list
                      // For now, let's assume they are tag-based or placeholders. 
                      // If we want them to do something, we'd need tags. 
                      // Let's treat them as placeholders that show all non-archived for now, OR filter by tag if tag exists.
                      if (p.isArchived) return false; // Default: hide archived for all other views

                      // Optional: Filter by tag name matching category
                      if (["Production", "Research"].includes(activeCategory)) {
                        return p.tags?.includes(activeCategory.toUpperCase()) || p.tags?.includes(activeCategory);
                      }

                      return true;
                    })
                    .map((p) => (
                      <Card
                        key={p.id}
                        onClick={() => handleSelectPrompt(p)}
                        className="bg-zinc-950 border-zinc-900 rounded-none p-6 space-y-4 group hover:border-zinc-700 transition-colors cursor-pointer relative overflow-hidden"
                      >
                        <div className="flex justify-between items-start">
                          <div className="space-y-1">
                            <h3 className="text-sm font-light tracking-widest text-zinc-200 uppercase">{p.title}</h3>
                            <p className="text-[10px] text-zinc-600 uppercase">Modified {new Date(p.updatedAt).toLocaleTimeString()}</p>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                navigator.clipboard.writeText(p.content);
                                toast.success("Protocol content copied to clipboard");
                              }}
                              className="text-zinc-600 hover:text-zinc-200 transition-colors p-1"
                              title="Copy Content"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                            <Tag className="w-4 h-4 text-zinc-700 group-hover:text-zinc-500 transition-colors" />
                          </div>
                        </div>
                        <p className="text-xs text-zinc-500 line-clamp-3 leading-relaxed font-mono">
                          {p.content}
                        </p>
                        <div className="flex items-center space-x-2 pt-2">
                          <span className="text-[9px] px-1.5 py-0.5 border border-zinc-800 text-zinc-600 uppercase">ID: {p.id}</span>
                          <span className="text-[9px] px-1.5 py-0.5 border border-zinc-800 text-zinc-600 uppercase">AUTH: {p.author || "SYSTEM"}</span>
                        </div>
                      </Card>
                    ))}
                </div>
              </section>
            </div>
          </motion.div>
        )
        }
      </AnimatePresence>
      <Toaster theme="dark" position="bottom-right" toastOptions={{
        style: { background: "#09090b", border: "1px solid #27272a", color: "#e4e4e7" }
      }} />
    </main >
  );
}

function ChevronRight({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m9 18 6-6-6-6" /></svg>
  );
}
