"use client";

import { useSidebar } from "@/providers/sidebar-provider";
import { cn } from "@/lib/utils";

export default function MainContentWrapper({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isSideBarOpen, sideBarFullClosed } = useSidebar();

    return (
        <div className={cn(
            "h-full transition-all duration-300 ease-in-out",
            {
                "md:ml-[20rem]": isSideBarOpen && !sideBarFullClosed,
                "ml-[1rem]": !isSideBarOpen && !sideBarFullClosed,
                "ml-0": sideBarFullClosed
            }
        )}>
            {children}
        </div>
    );
}