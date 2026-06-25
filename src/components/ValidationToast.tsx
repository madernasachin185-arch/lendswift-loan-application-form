'use client';

import React from 'react';

interface ValidationToastProps {
  message: string;
  onClose: () => void;
}

export default function ValidationToast({ message, onClose }: ValidationToastProps) {
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-red-600 text-white px-6 py-4 rounded-xl shadow-2xl flex items-center gap-3 animate-slide-down max-w-sm w-full mx-4">
      <span className="text-2xl flex-shrink-0">⚠️</span>
      <div className="flex-1">
        <p className="font-bold text-sm">Please fix the errors</p>
        <p className="text-xs opacity-90">{message}</p>
      </div>
      <button
        onClick={onClose}
        className="ml-auto text-white text-lg flex-shrink-0 hover:opacity-75 transition-opacity"
        aria-label="Close validation message"
      >
        ✕
      </button>
    </div>
  );
}
