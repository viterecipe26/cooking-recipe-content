
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

interface ToastProps {
  message: string;
  onClose: () => void;
  show: boolean;
  duration?: number;
}

const CheckCircleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);

export const Toast: React.FC<ToastProps> = ({ message, onClose, show, duration = 5000 }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [displayMessage, setDisplayMessage] = useState(message);

  // Sync visibility and message state. 
  // We store the message locally to keep displaying it while the toast fades out (even if parent clears it).
  useEffect(() => {
    if (show) {
      setIsVisible(true);
      if (message) setDisplayMessage(message);
    } else {
      setIsVisible(false);
    }
  }, [show, message]);

  // Auto-close timer
  useEffect(() => {
    if (isVisible && duration > 0) {
      const timer = setTimeout(() => {
        onClose();
      }, duration);
      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  // Ensure document is available (client-side)
  if (typeof document === 'undefined') return null;

  // Use Portal to render outside of any transformed parent containers, ensuring perfect centering.
  return createPortal(
    <div
      className={`fixed top-1/2 left-1/2 z-[9999] -translate-x-1/2 -translate-y-1/2 transition-all duration-500 cubic-bezier(0.16, 1, 0.3, 1) ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'
      }`}
      role="alert"
      aria-live="assertive"
    >
      <div className="flex items-center gap-4 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 text-white px-8 py-5 rounded-2xl shadow-2xl min-w-[320px] max-w-md ring-1 ring-white/10">
        <div className="flex-shrink-0 bg-green-500/10 rounded-full p-2">
            <CheckCircleIcon />
        </div>
        <div className="flex flex-col">
            <span className="text-base font-semibold text-slate-100">{displayMessage}</span>
        </div>
        <button
          onClick={onClose}
          className="ml-auto -mr-2 p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg focus:outline-none transition-colors"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>,
    document.body
  );
};
