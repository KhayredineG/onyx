"use client";

import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface TimeTravelProps {
    versions: any[];
    currentIndex: number;
    onIndexChange: (index: number) => void;
}

export default function TimeTravel({ versions, currentIndex, onIndexChange }: TimeTravelProps) {
    if (versions.length <= 1) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 h-16 bg-[#0a0a0a] border-t border-zinc-900 flex items-center px-8 z-40">
            <div className="flex items-center space-x-6 w-full max-w-7xl mx-auto">
                <div className="flex items-center space-x-2 text-zinc-600">
                    <Clock className="w-4 h-4" />
                    <span className="text-[10px] uppercase tracking-[0.2em]">Time Travel</span>
                </div>

                <div className="flex-1 relative h-8 flex items-center group">
                    <input
                        type="range"
                        min="0"
                        max={versions.length - 1}
                        value={currentIndex}
                        onChange={(e) => onIndexChange(parseInt(e.target.value))}
                        className="w-full appearance-none bg-zinc-900 h-px cursor-pointer accent-zinc-500"
                    />
                    {/* Version Indicators */}
                    <div className="absolute inset-0 flex justify-between items-center pointer-events-none px-1">
                        {versions.map((_, i) => (
                            <div
                                key={i}
                                className={`w-1 h-3 border-l ${i <= currentIndex ? "border-zinc-500" : "border-zinc-800"} transition-colors`}
                            />
                        ))}
                    </div>
                </div>

                <div className="text-[10px] text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                    Snapshot: {versions.length - currentIndex} / {versions.length}
                </div>
            </div>
        </div>
    );
}
