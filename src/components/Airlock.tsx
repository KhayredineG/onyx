"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

export default function Airlock({ onUnlock }: { onUnlock: () => void }) {
    const [passcode, setPasscode] = useState("");
    const [isUnlocked, setIsUnlocked] = useState(false);
    const [error, setError] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would be an API call to check against process.env.ACCESS_KEY
        if (passcode === "onyx-alpha") {
            setIsUnlocked(true);
            setTimeout(onUnlock, 1000);
        } else {
            setError(true);
            setTimeout(() => setError(false), 500);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#0a0a0a] overflow-hidden">
            <AnimatePresence>
                {!isUnlocked && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.1 }}
                        className="w-full max-w-md p-8 border border-zinc-800 bg-[#0a0a0a] relative z-10"
                    >
                        <div className="flex flex-col items-center space-y-6">
                            <div className="p-4 rounded-full border border-zinc-800">
                                <Lock className="w-8 h-8 text-zinc-500" />
                            </div>
                            <div className="text-center space-y-2">
                                <h1 className="text-2xl font-light tracking-widest text-zinc-200">ONYX ACCESS</h1>
                                <p className="text-sm text-zinc-500 uppercase tracking-tighter">Enter security clearance key</p>
                            </div>
                            <form onSubmit={handleSubmit} className="w-full space-y-4">
                                <Input
                                    type="password"
                                    placeholder="PROTECTED"
                                    value={passcode}
                                    onChange={(e) => setPasscode(e.target.value)}
                                    className={`bg-zinc-900/50 border-zinc-800 text-center tracking-[0.5em] text-zinc-300 placeholder:text-zinc-700 transition-colors ${error ? "border-red-900" : ""
                                        }`}
                                />
                                <Button variant="outline" className="w-full border-zinc-800 hover:bg-zinc-900 transition-all uppercase tracking-widest font-light">
                                    Authenticate
                                </Button>
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Airlock Doors */}
            <motion.div
                initial={{ x: "-100%" }}
                animate={{ x: isUnlocked ? "-100%" : "0%" }}
                transition={{ duration: 1, ease: [0.7, 0, 0.3, 1] }}
                className="absolute left-0 top-0 bottom-0 w-1/2 bg-[#0a0a0a] border-r border-zinc-900 flex items-center justify-end"
            >
                <div className="w-px h-32 bg-zinc-800 mr-4" />
            </motion.div>
            <motion.div
                initial={{ x: "100%" }}
                animate={{ x: isUnlocked ? "100%" : "0%" }}
                transition={{ duration: 1, ease: [0.7, 0, 0.3, 1] }}
                className="absolute right-0 top-0 bottom-0 w-1/2 bg-[#0a0a0a] border-l border-zinc-900 flex items-center justify-start"
            >
                <div className="w-px h-32 bg-zinc-800 ml-4" />
            </motion.div>

            {/* Grid Pattern Overlay */}
            <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
                style={{ backgroundImage: 'linear-gradient(#fff 1px, transparent 1px), linear-gradient(90deg, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
        </div>
    );
}
