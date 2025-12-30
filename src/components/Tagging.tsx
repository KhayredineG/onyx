"use client";

import { useState } from "react";
import { X, Plus, Tag as TagIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

interface TaggingProps {
    tags: string[];
    onAddTag: (tag: string) => void;
    onRemoveTag: (tag: string) => void;
}

export default function Tagging({ tags, onAddTag, onRemoveTag }: TaggingProps) {
    const [inputValue, setInputValue] = useState("");

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter" && inputValue.trim()) {
            e.preventDefault();
            onAddTag(inputValue.trim());
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
                        <button onClick={() => onRemoveTag(tag)} className="hover:text-zinc-300">
                            <X className="w-2.5 h-2.5" />
                        </button>
                    </div>
                ))}
                <div className="relative">
                    <input
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="ADD_TAG..."
                        className="bg-transparent border-none focus:ring-0 text-[10px] text-zinc-500 uppercase tracking-widest p-0 min-w-[80px]"
                    />
                </div>
            </div>
        </div>
    );
}
