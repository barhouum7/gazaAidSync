"use client";

import { createContext, useContext, useState, useEffect } from 'react';

interface SidebarContextType {
    isSideBarOpen: boolean;
    setIsSideBarOpen: (open: boolean) => void;
    sideBarFullClosed: boolean;
    setSideBarFullClosed: (open: boolean) => void;
}

const SidebarContext = createContext<SidebarContextType | undefined>(undefined);

export function SidebarProvider({ children }: { children: React.ReactNode }) {
    const [isSideBarOpen, setIsSideBarOpen] = useState(false);
    const [sideBarFullClosed, setSideBarFullClosed] = useState(false);

    return (
        <SidebarContext.Provider value={{ isSideBarOpen, setIsSideBarOpen, sideBarFullClosed, setSideBarFullClosed }}>
            {children}
        </SidebarContext.Provider>
    );
}

export function useSidebar() {
    const context = useContext(SidebarContext);
    if (context === undefined) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
}