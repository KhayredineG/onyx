"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";

interface EditorProps {
    initialContent: string;
    onChange: (content: string) => void;
    isGlitching?: boolean;
}

export default function Editor({ initialContent, onChange, isGlitching }: EditorProps) {
    const [content, setContent] = useState(initialContent);

    useEffect(() => {
        setContent(initialContent);
    }, [initialContent]);

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const val = e.target.value;
        setContent(val);
        onChange(val);
    };

    // Basic variable highlighting logic could be added here overlayed
    // For now, focus on the minimalist look and glitch transition

    return (
        <div className="relative w-full h-full min-h-[500px] group">
            <motion.div
                animate={isGlitching ? {
                    filter: ["blur(0px)", "blur(4px)", "blur(0px)"],
                    x: [0, -2, 2, -1, 0],
                    opacity: [1, 0.8, 1],
                } : {}}
                transition={{ duration: 0.2 }}
                className="w-full h-full"
            >
                <textarea
                    value={content}
                    onChange={handleChange}
                    className="w-full h-full bg-transparent border-none focus:ring-0 text-zinc-300 font-mono text-sm leading-relaxed resize-none placeholder:text-zinc-800 p-0"
                    placeholder="START_TYPING..."
                    spellCheck={false}
                />
            </motion.div>

            {/* Grid line indicator */}
            <div className="absolute left-[-2rem] top-0 bottom-0 w-px bg-zinc-900 group-focus-within:bg-zinc-800 transition-colors" />
        </div>
    );
}
