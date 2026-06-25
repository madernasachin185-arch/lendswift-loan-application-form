'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useLoanForm } from '@/context/LoanFormContext';
import { saveDraft, loadDraft, deleteDraft } from '@/utils/helpers';
import Wizard from '@/components/Wizard';
import SuccessPage from '@/components/SuccessPage';

interface DraftWarning {
  show: boolean;
  hasDraft: boolean;
  loanType: string;
}

export default function LoanApplicationPage() {
  const { state, batchUpdate, resetForm } = useLoanForm();
  const [isApplicationComplete, setIsApplicationComplete] = useState(false);
  const [draftWarning, setDraftWarning] = useState<DraftWarning>({ show: false, hasDraft: false, loanType: '' });
  const [mounted, setMounted] = useState(false);

  // Check for existing draft on mount
  useEffect(() => {
    setMounted(true);

    const checkForDraft = () => {
      const loanType = state.loanType || 'pending';
      const draft = loadDraft(loanType);

      if (draft && draft.data) {
        setDraftWarning({ show: true, hasDraft: true, loanType });
      }
    };

    const timer = setTimeout(checkForDraft, 100);
    return () => clearTimeout(timer);
  }, [state.loanType]);

  // Auto-save draft every 30 seconds
  useEffect(() => {
    if (!mounted || !state.loanType) return;

    const autoSaveInterval = setInterval(() => {
      const dataToSave = {
        ...state,
        uploadedDocuments: {}, // Don't save files
      };

      saveDraft(dataToSave, state.loanType);
      console.log('[v0] Draft auto-saved for', state.loanType);
    }, 30000); // 30 seconds

    return () => clearInterval(autoSaveInterval);
  }, [state, mounted]);

  const handleLoadDraft = useCallback(() => {
    const loanType = state.loanType || 'pending';
    const draft = loadDraft(loanType);

    if (draft && draft.data) {
      batchUpdate(draft.data);
      setDraftWarning({ show: false, hasDraft: false, loanType: '' });
    }
  }, [state.loanType, batchUpdate]);

  const handleDeleteDraft = useCallback(() => {
    const loanType = state.loanType || 'pending';
    deleteDraft(loanType);
    setDraftWarning({ show: false, hasDraft: false, loanType: '' });
  }, [state.loanType]);

  const handleApplicationComplete = useCallback(() => {
    setIsApplicationComplete(true);
    // Clear draft after successful submission
    if (state.loanType) {
      deleteDraft(state.loanType);
    }
  }, [state.loanType]);

  const handleStartNewApplication = useCallback(() => {
    resetForm();
    setIsApplicationComplete(false);
    setDraftWarning({ show: false, hasDraft: false, loanType: '' });
  }, [resetForm]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 py-8 px-4">
      {/* Header */}
      <div className="max-w-2xl mx-auto mb-8">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">LS</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">LendSwift</h1>
        </div>
        <p className="text-gray-600">Digital Loan Application Platform</p>
      </div>

      {/* Draft Recovery Modal */}
      {draftWarning.show && draftWarning.hasDraft && (
        <div className="max-w-2xl mx-auto mb-6">
          <div className="bg-blue-50 border border-blue-300 rounded-lg p-4 flex items-start gap-4">
            <div className="flex-shrink-0 w-5 h-5 text-blue-600 mt-0.5">
              <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
                <path
                  fillRule="evenodd"
                  d="M18 5v8a2 2 0 01-2 2h-5l-5 4v-4H4a2 2 0 01-2-2V5a2 2 0 012-2h12a2 2 0 012 2zm-11-1a1 1 0 11-2 0 1 1 0 012 0z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-900">Draft Found</h3>
              <p className="text-sm text-gray-700 mt-1">
                We found a saved draft for your {draftWarning.loanType} loan application. Would you like to continue or start fresh?
              </p>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleLoadDraft}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors"
                  aria-label="Load saved draft"
                >
                  Load Draft
                </button>
                <button
                  onClick={handleDeleteDraft}
                  className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-900 rounded-lg text-sm font-medium transition-colors"
                  aria-label="Start fresh application"
                >
                  Start Fresh
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-2xl mx-auto">
        {isApplicationComplete ? (
          <SuccessPage onStartNew={handleStartNewApplication} />
        ) : (
          <Wizard onComplete={handleApplicationComplete} />
        )}
      </div>

      {/* Footer */}
      <div className="max-w-2xl mx-auto mt-12 text-center text-sm text-gray-600">
        <p>
          LendSwift &copy; 2026. All rights reserved. | 
          <a href="#" className="text-blue-600 hover:text-blue-700 ml-1">
            Privacy Policy
          </a>
        </p>
      </div>
    </div>
  );
}
