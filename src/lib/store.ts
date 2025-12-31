import { create } from "zustand";

interface Prompt {
    id: number;
    title: string;
    content: string;
    createdAt: Date;
    updatedAt: Date;
    tags?: string[];
    author?: string | null;
    isArchived: boolean;
}

interface OnyxState {
    prompts: Prompt[];
    activePrompt: Prompt | null;
    isUnlocked: boolean;
    setUnlocked: (unlocked: boolean) => void;
    setPrompts: (prompts: Prompt[]) => void;
    setActivePrompt: (prompt: Prompt | null) => void;
    addPrompt: (prompt: Prompt) => void;
    updatePrompt: (id: number, updates: Partial<Prompt>) => void;
    deletePrompt: (id: number) => void;
}

export const useOnyxStore = create<OnyxState>((set) => ({
    prompts: [],
    activePrompt: null,
    isUnlocked: false,
    setUnlocked: (unlocked) => set({ isUnlocked: unlocked }),
    setPrompts: (prompts) => set({ prompts }),
    setActivePrompt: (prompt) => set({ activePrompt: prompt }),
    addPrompt: (prompt) => set((state) => ({ prompts: [prompt, ...state.prompts] })),
    updatePrompt: (id, updates) =>
        set((state) => ({
            prompts: state.prompts.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
    deletePrompt: (id) =>
        set((state) => ({
            prompts: state.prompts.filter((p) => p.id !== id),
        })),
}));
