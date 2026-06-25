'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useLoanForm } from '@/context/LoanFormContext';
import Step1LoanDetails from './steps/Step1LoanDetails';
import Step2PersonalInfo from './steps/Step2PersonalInfo';
import Step3KYC from './steps/Step3KYC';
import Step4Address from './steps/Step4Address';
import Step5Employment from './steps/Step5Employment';
import Step6CoApplicant from './steps/Step6CoApplicant';
import Step7Documents from './steps/Step7Documents';
import Step8Review from './steps/Step8Review';

interface StepConfig {
  id: number;
  title: string;
  component: React.ComponentType<any>;
  isVisible: (state: any) => boolean;
}

const STEPS: StepConfig[] = [
  { id: 1, title: 'Loan Details', component: Step1LoanDetails, isVisible: () => true },
  { id: 2, title: 'Personal Info', component: Step2PersonalInfo, isVisible: () => true },
  { id: 3, title: 'KYC Verification', component: Step3KYC, isVisible: () => true },
  { id: 4, title: 'Address', component: Step4Address, isVisible: () => true },
  { id: 5, title: 'Employment', component: Step5Employment, isVisible: () => true },
  {
    id: 6,
    title: 'Co-Applicant',
    component: Step6CoApplicant,
    isVisible: (state: any) => {
      if (state.loanType === 'Home') return true;
      if (state.loanType === 'Personal' && parseFloat(state.loanAmount) > 500000) return true;
      if (state.loanType === 'Business' && parseFloat(state.loanAmount) > 2000000) return true;
      return false;
    },
  },
  { id: 7, title: 'Documents & Signature', component: Step7Documents, isVisible: () => true },
  { id: 8, title: 'Review & Submit', component: Step8Review, isVisible: () => true },
];

interface WizardProps {
  onComplete: () => void;
}

export default function Wizard({ onComplete }: WizardProps) {
  const { state, updateStep, clearCoAppData } = useLoanForm();
  const [activeStepIndex, setActiveStepIndex] = useState(state.currentStep || 0);

  // Get visible steps
  const visibleSteps = useMemo(() => {
    return STEPS.filter(step => step.isVisible(state));
  }, [state]);

  // Update active step index if it exceeds visible steps
  useEffect(() => {
    if (activeStepIndex >= visibleSteps.length) {
      setActiveStepIndex(Math.max(0, visibleSteps.length - 1));
    }
  }, [visibleSteps, activeStepIndex]);

  const currentStep = visibleSteps[activeStepIndex];
  const progressPercentage = ((activeStepIndex + 1) / visibleSteps.length) * 100;

  const handleNext = () => {
    if (activeStepIndex < visibleSteps.length - 1) {
      const newIndex = activeStepIndex + 1;
      setActiveStepIndex(newIndex);
      updateStep(newIndex);
    }
  };

  const handlePrevious = () => {
    if (activeStepIndex > 0) {
      const newIndex = activeStepIndex - 1;
      setActiveStepIndex(newIndex);
      updateStep(newIndex);
    }
  };

  const handleSkipCoApplicant = () => {
    // Clear co-applicant data and move to next step
    clearCoAppData();
    handleNext();
  };

  const handleEditStep = (stepIndex: number) => {
    const stepToEdit = STEPS.findIndex(s => s.id === stepIndex + 1);
    const visibleStepIndex = visibleSteps.findIndex(s => s.id === STEPS[stepToEdit].id);
    if (visibleStepIndex !== -1) {
      setActiveStepIndex(visibleStepIndex);
      updateStep(visibleStepIndex);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || (e.shiftKey && e.key === 'Enter')) {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [activeStepIndex, visibleSteps]);

  const CurrentStepComponent = currentStep.component;
  const isCoApplicantStep = currentStep.id === 6;

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-lg font-semibold text-gray-900">
            {currentStep.title}
          </h2>
          <span className="text-sm text-gray-600">
            Step {activeStepIndex + 1} of {visibleSteps.length}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
          <div
            className="bg-blue-600 h-full transition-all duration-300"
            style={{ width: `${progressPercentage}%` }}
            role="progressbar"
            aria-valuenow={activeStepIndex + 1}
            aria-valuemin={1}
            aria-valuemax={visibleSteps.length}
          />
        </div>
        <p className="text-xs text-gray-600 mt-2">{Math.round(progressPercentage)}% Complete</p>
      </div>

      {/* Step Content */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 md:p-8">
        {isCoApplicantStep ? (
          <CurrentStepComponent onNext={handleNext} onSkip={handleSkipCoApplicant} />
        ) : currentStep.id === 8 ? (
          <CurrentStepComponent onSubmit={onComplete} onEditStep={handleEditStep} />
        ) : (
          <CurrentStepComponent onNext={handleNext} />
        )}
      </div>

      {/* Navigation */}
      <div className="flex gap-4 mt-6">
        <button
          onClick={handlePrevious}
          disabled={activeStepIndex === 0}
          className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-900 font-semibold py-3 rounded-lg transition-colors"
          aria-label="Go to previous step"
        >
          Previous
        </button>
        <button
          onClick={handleNext}
          disabled={activeStepIndex === visibleSteps.length - 1}
          className="flex-1 bg-gray-200 hover:bg-gray-300 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed text-gray-900 font-semibold py-3 rounded-lg transition-colors"
          aria-label="Go to next step"
        >
          Next
        </button>
      </div>

      {/* Step Indicators */}
      <div className="mt-8 flex justify-center gap-2 flex-wrap">
        {visibleSteps.map((step, idx) => (
          <button
            key={step.id}
            onClick={() => {
              setActiveStepIndex(idx);
              updateStep(idx);
            }}
            className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
              idx === activeStepIndex
                ? 'bg-blue-600 text-white'
                : idx < activeStepIndex
                  ? 'bg-green-100 text-green-700 hover:bg-green-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
            aria-label={`Go to step ${step.id}: ${step.title}`}
            aria-current={idx === activeStepIndex ? 'step' : undefined}
          >
            {step.id}
          </button>
        ))}
      </div>
    </div>
  );
}
