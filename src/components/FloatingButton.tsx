import React from 'react';
import { Plus } from 'lucide-react';
import { cn } from '../lib/utils';

interface FloatingButtonProps {
  onClick: () => void;
  icon?: React.ReactNode;
  className?: string;
}

export function FloatingButton({ onClick, icon, className }: FloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'fixed bottom-6 right-6 w-14 h-14 bg-accent-600 text-white rounded-full shadow-lg hover:bg-accent-700 active:scale-95 transition-all duration-200 flex items-center justify-center z-50 safe-bottom',
        className
      )}
    >
      {icon || <Plus size={24} />}
    </button>
  );
}
