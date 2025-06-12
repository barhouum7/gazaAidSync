"use client";

// This is a template component that can be used to wrap other components and rerender them with a fade-in effect.

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Template(
    { children }: { children: React.ReactNode }
) {
    const [isMounted, setIsMounted] = useState(false)

    // Set isMounted to true after the first render
    useEffect(() => {
        setIsMounted(true);
    }, []);

    // If the component is not mounted, return null
    if (!isMounted) return null;

    return (
        <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ ease: "easeInOut", duration: 0.75 }}
        >
            {/* Show a loader in case the component is loading */}
            {/* {isMounted && !children && (
                <div className="fixed inset-0 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-slate-500"></div>
                </div>
            )} */}

            {children}
        </motion.div>
    );
}