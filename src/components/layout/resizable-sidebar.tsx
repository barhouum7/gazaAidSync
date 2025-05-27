'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, GripVertical } from 'lucide-react';
import { Button } from '../ui/button';

interface ResizableSidebarProps {
  children: React.ReactNode;
  defaultWidth?: number;
  minWidth?: number;
  maxWidth?: number;
}

const ResizableSidebar = ({
  children,
  defaultWidth = 620,
  minWidth = 320,
  maxWidth = 640,
}: ResizableSidebarProps) => {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

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

  return (
    <motion.div
      ref={sidebarRef}
      className="relative flex h-full"
      initial={false}
      animate={{
        width: isCollapsed ? 0 : width,
        opacity: isCollapsed ? 0 : 1,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 30,
      }}
    >
      <div className="h-full w-full overflow-hidden">
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </div>

      {/* Resize handle */}
      <motion.div
        className={`absolute top-0 right-0 w-1 h-full cursor-col-resize flex items-center justify-center group ${
          isResizing ? 'bg-blue-500' : 'bg-gray-200'
        }`}
        whileHover={{ width: '4px' }}
        onMouseDown={startResizing}
      >
        <div className="absolute opacity-100 bg-white p-1 rounded-md shadow-md">
          <GripVertical className="h-4 w-4 text-gray-500" />
        </div>
      </motion.div>

      {/* Collapse/Expand button */}
      <AnimatePresence>
        <motion.div
          className="absolute top-4 -right-12 z-50"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
        >
          <Button
            variant="secondary"
            size="icon"
            className="rounded-full shadow-lg bg-white hover:bg-gray-100"
            onClick={() => setIsCollapsed(!isCollapsed)}
          >
            {isCollapsed ? (
              <ChevronRight className="h-4 w-4" />
            ) : (
              <ChevronLeft className="h-4 w-4" />
            )}
          </Button>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
};

export default ResizableSidebar;