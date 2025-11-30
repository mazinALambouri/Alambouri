import React from 'react';
import { ArrowLeft } from 'lucide-react';
import { cn } from '../lib/utils';

interface HeaderProps {
  title: string;
  subtitle?: string;
  onBack?: () => void;
  action?: React.ReactNode;
  className?: string;
}

export function Header({ title, subtitle, onBack, action, className }: HeaderProps) {
  return (
    <header className={cn('bg-white border-b border-gray-200 safe-top', className)}>
      <div className="px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3 flex-1">
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 -ml-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
          )}
          <div className="flex-1">
            <h1 className="text-xl font-bold text-gray-900">{title}</h1>
            {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
          </div>
        </div>
        {action && <div>{action}</div>}
      </div>
    </header>
  );
}
