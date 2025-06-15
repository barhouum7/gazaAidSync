'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, GripVertical, SidebarCloseIcon, SidebarOpenIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface ResizableSidebarProps {
  children: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
  onWidthChange?: (width: number, collapsed: boolean) => void;
}

export default function ResizableSidebar({
  children,
  defaultWidth = 420,
  minWidth = 220,
  maxWidth = 420,
  onWidthChange,
}: ResizableSidebarProps) {
  const { theme } = useTheme();

  // mounted state to handle hydration
  const [mounted, setMounted] = useState(false);

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Notify parent on width/collapse change
  useEffect(() => {
    if (onWidthChange) onWidthChange(isCollapsed ? 0 : width, isCollapsed);
  }, [width, isCollapsed, onWidthChange]);

  const startResizing = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setIsResizing(true);

    const startX = e.pageX;
    const startWidth = width;

    const handleMouseMove = (e: MouseEvent) => {
      if (sidebarRef.current) {
        const newWidth = startWidth + (e.pageX - startX);
        if (newWidth >= minWidth && newWidth <= maxWidth) {
          setWidth(newWidth);
        }
      }
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      setIsResizing(false);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  }, [width, minWidth, maxWidth]);

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  return (
    <>
      <motion.div
        ref={sidebarRef}
        className="
        relative h-full my-52 overflow-hidden
        flex-shrink-0 py-20 flex flex-col items-center justify-center -ml-3
        bg-background dark:bg-background-dark border-r border-border dark:border-border-dark
        transition-all duration-300 ease-in-out rounded-lg shadow-lg
        "
        initial={false}
        animate={{
          width: isCollapsed ? 0 : width,
          height: isCollapsed ? 0 : "100%",
          opacity: isCollapsed ? 0 : 1,
        }}
        transition={{
          type: "spring",
          stiffness: 300,
          damping: 30,
        }}
      >
        <AnimatePresence>
          {!isCollapsed && (
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2 }}
            >
            <div className="h-full w-full overflow-hidden">
              <div className="h-full overflow-y-auto">{children}</div>
            </div>
          </motion.div>
          )}
        </AnimatePresence>

        {/* Resize handle */}
        <motion.div
          className={`absolute top-0 right-0 w-1 h-full cursor-col-resize flex items-center justify-center group ${
            isResizing ? "bg-blue-500" : "bg-gray-200"
          }`}
          whileHover={{ width: "4px" }}
          onMouseDown={startResizing}
        >
          <div className="z-40 absolute opacity-100 bg-white p-1 rounded-md shadow-md">
            <GripVertical className="h-4 w-4 text-gray-500" />
          </div>
        </motion.div>
      </motion.div>

      {/* Collapse/Expand button */}
      <AnimatePresence>
        <motion.div
          className={cn(
            "fixed top-16 z-50 left-2",
          )}
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Button
            variant={theme === 'dark' ? 'secondary' : 'outline'}
            size="icon"
            className="rounded-full shadow-lg"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {/* {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )} */}
            {/* {isCollapsed ? (
              <SidebarOpenIcon className="h-4 w-4" />
            ) : (
              <SidebarCloseIcon className="h-4 w-4" />
            )} */}
            {isCollapsed ? '→' : '←'}
          </Button>
        </motion.div>
      </AnimatePresence>
    </>
  );
};