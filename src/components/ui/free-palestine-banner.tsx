"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";

export default function FreePalestineBanner() {
    const [isVisible, setIsVisible] = useState(false);
    const [isClosed, setIsClosed] = useState(false);
    const isDarkMode = false;

    // Smooth show on mount
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 200);
        return () => clearTimeout(timer);
    }, []);

    const handleClose = () => {
        setIsClosed(true);
        setTimeout(() => setIsVisible(false), 400);
    };

    const title = "🇵🇸 Stand With Gaza";
    const description =
        "Every voice matters. Together, we can raise awareness and demand an end to the suffering. Stand up for justice, peace, and humanity — #FreePalestine.";
    const linkTo = "https://twitter.com/search?q=%23FreePalestine";

    if (!isVisible) return null;

    return (
        <div
        className={`relative sm:sticky top-0 z-50 flex items-center overflow-hidden 
            backdrop-blur-sm transition-all duration-500 ease-in-out 
            ${isClosed ? "opacity-0 -translate-y-3" : "opacity-100 translate-y-0"} 
            ${isDarkMode ? "bg-gray-800/70 text-gray-100" : "bg-gray-50/70 text-gray-900"} 
            px-4 py-3 md:px-6`}
        >
        {/* Background Blurs */}
        <div
            className="absolute left-[max(-7rem,calc(50%-52rem))] top-1/2 -z-10 -translate-y-1/2 blur-2xl"
            aria-hidden="true"
        >
            <BlurDiv />
        </div>
        <div
            className="absolute left-[max(45rem,calc(50%+8rem))] top-1/2 -z-10 -translate-y-1/2 blur-2xl"
            aria-hidden="true"
        >
            <BlurDiv />
        </div>

        {/* Banner Text */}
        <p className="mx-auto text-sm sm:leading-6 text-center max-w-md sm:max-w-6xl">
            <Link
            href={linkTo}
            target="_blank"
            className="hover:underline hover:text-red-600 transition-colors"
            >
            <strong className="font-semibold text-green-700 dark:text-green-400">
                {title}
            </strong>
            <svg
                viewBox="0 0 2 2"
                className="mx-2 inline h-0.5 w-0.5 fill-current"
                aria-hidden="true"
            >
                <circle cx={1} cy={1} r={1} />
            </svg>
            {description}
            </Link>
        </p>

        {/* Close Button */}
        <button
            onClick={handleClose}
            className="cursor-pointer absolute right-3 top-2 p-1.5 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            aria-label="Close banner"
        >
            <X className="h-4 w-4" />
        </button>
        </div>
    );
}

const BlurDiv = () => (
    <div
        className="aspect-[577/310] w-[36.0625rem] bg-gradient-to-r from-[#149954] to-[#E4312b] opacity-80 md:opacity-50"
        style={{
        clipPath:
            "polygon(74.8% 41.9%, 97.2% 73.2%, 100% 34.9%, 92.5% 0.4%, 87.5% 0%, 75% 28.6%, 58.5% 54.6%, 50.1% 56.8%, 46.9% 44%, 48.3% 17.4%, 24.7% 53.9%, 0% 27.9%, 11.9% 74.2%, 24.9% 54.1%, 68.6% 100%, 74.8% 41.9%)",
        }}
    />
);


// CC: https://github.com/Safouene1/support-palestine-banner/tree/master