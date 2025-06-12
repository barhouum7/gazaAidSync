"use client";

import { createContext, useContext, useState, ReactNode } from 'react';
import { SidebarProvider } from './sidebar-provider';

interface LayoutContextType {
    mainContentWidth: string;
}

const LayoutContext = createContext<LayoutContextType | undefined>(undefined);

export function LayoutStateProvider({ children }: { children: ReactNode }) {
    return (
        <SidebarProvider>
            {children}
        </SidebarProvider>
    );
}

export function useLayout() {
    const context = useContext(LayoutContext);
    if (context === undefined) {
        throw new Error('useLayout must be used within a LayoutStateProvider');
    }
    return context;
}