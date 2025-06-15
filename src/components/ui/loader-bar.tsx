"use client";

import { cn } from "@/lib/utils";
import { Progress } from "@heroui/progress";

export default function LoaderBar({ className }: { className?: string }) {
    return (
        <Progress
            size="sm"
            // isStriped
            isIndeterminate
            aria-label="Loading..."
            // className="max-w-md"
            className={cn(
                "z-[1000] min-w-screen bg-secondary-500",
                className,
            )}
        />
    );
}