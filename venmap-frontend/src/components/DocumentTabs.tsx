import React, { memo, useCallback } from 'react';
import { X } from 'lucide-react';
import type { DocumentType } from '../utils/database';

interface DocumentTab {
  id: DocumentType;
  title: string;
  icon: React.ReactNode;
  hasContent: boolean;
}

interface DocumentTabsProps {
  activeTab: DocumentType;
  availableTabs: DocumentTab[];
  onTabChange: (tabId: DocumentType) => void;
  onTabClose?: (tabId: DocumentType) => void;
  className?: string;
}

const DocumentTabs: React.FC<DocumentTabsProps> = memo(({
  activeTab,
  availableTabs,
  onTabChange,
  onTabClose,
  className = ''
}) => {
  const handleTabClick = useCallback((tabId: DocumentType) => {
    if (tabId !== activeTab) {
      onTabChange(tabId);
    }
  }, [activeTab, onTabChange]);

  const handleTabClose = useCallback((e: React.MouseEvent, tabId: DocumentType) => {
    e.stopPropagation();
    onTabClose?.(tabId);
  }, [onTabClose]);

  if (availableTabs.length <= 1) {
    return null; // Don't show tabs if there's only one or no tabs
  }

  return (
    <div className={`flex border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 ${className}`}>
      {availableTabs.map((tab) => (
        <div
          key={tab.id}
          className={`
            relative flex items-center gap-2 px-4 py-2 cursor-pointer transition-all duration-200
            ${activeTab === tab.id
              ? 'bg-blue-50 dark:bg-blue-900/20 border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
              : 'hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-600 dark:text-gray-300'
            }
          `}
          onClick={() => handleTabClick(tab.id)}
          role="tab"
          aria-selected={activeTab === tab.id}
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              handleTabClick(tab.id);
            }
          }}
        >
          <span className="flex items-center gap-2 text-sm font-medium">
            {tab.icon}
            {tab.title}
            {!tab.hasContent && (
              <span className="w-2 h-2 bg-orange-400 rounded-full" title="No content" />
            )}
          </span>
          
          {onTabClose && availableTabs.length > 1 && tab.id !== 'businessPlan' && (
            <button
              onClick={(e) => handleTabClose(e, tab.id)}
              className="ml-2 p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              title={`Close ${tab.title}`}
              aria-label={`Close ${tab.title} tab`}
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>
      ))}
    </div>
  );
});

DocumentTabs.displayName = 'DocumentTabs';


export default DocumentTabs;