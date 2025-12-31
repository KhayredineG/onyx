"use client";

import { useState, useTransition } from "react";
import { X, Plus, Tag as TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { addTagToPrompt, removeTagFromPrompt } from "@/lib/actions";

interface TaggingProps {
    promptId: number;
    tags: string[];
}

export default function Tagging({ promptId, tags }: TaggingProps) {
    const [inputValue, setInputValue] = useState("");
    const [isPending, startTransition] = useTransition();

    const handleAddTag = (tag: string) => {
        startTransition(async () => {
            await addTagToPrompt(promptId, tag);
        });
    };

    const handleRemoveTag = (tag: string) => {
        startTransition(async () => {
            await removeTagFromPrompt(promptId, tag);
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault();
            handleAddTag(inputValue.trim());
            setInputValue("");
        }
    };

    return (
        <div className="space-y-3">
            <div className="flex items-center space-x-2 text-zinc-600">
                <TagIcon className="w-3.5 h-3.5" />
                <span className="text-[10px] uppercase tracking-[0.2em]">Taxonomy</span>
            </div>
            <div className="flex flex-wrap gap-2">
                {tags.map((tag) => (
                    <div
                        key={tag}
                        className="flex items-center space-x-1 px-2 py-0.5 border border-zinc-800 text-[10px] text-zinc-500 uppercase tracking-widest group hover:border-zinc-600 transition-colors"
                    >
                        <span>{tag}</span>
                        <button onClick={() => handleRemoveTag(tag)} disabled={isPending} className="hover:text-zinc-300 disabled:opacity-50">
                            <X className="w-2.5 h-2.5" />
                        </button>
                    </div>
                ))}
                <div className="relative">
                    <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={isPending ? "UPDATING..." : "ADD_TAG..."}
                        disabled={isPending}
                        className="bg-transparent border-none focus:ring-0 text-[10px] text-zinc-500 uppercase tracking-widest p-0 min-w-[80px]"
                    />
                </div>
            </div>
        </div>
    );
}
