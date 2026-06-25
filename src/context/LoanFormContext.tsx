'use client';

import React, { createContext, useContext, useReducer, useCallback, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface LoanFormState {
  currentStep: number;
  // Step 1: Loan Details
  loanType: string;
  loanAmount: string;
  loanTenure: string;
  loanPurpose: string;
  referralCode: string;
  // Step 2: Personal Info
  fullName: string;
  dateOfBirth: string;
  gender: string;
  maritalStatus: string;
  fatherName: string;
  motherName: string;
  email: string;
  emailVerified: boolean;
  mobile: string;
  mobileVerified: boolean;
  alternateMobile: string;
  // Step 3: KYC
  panNumber: string;
  panVerified: boolean;
  aadhaarNumber: string;
  aadhaarVerified: boolean;
  aadhaarConsent: boolean;
  voterId: string;
  passport: string;
  // Step 4: Address
  currentAddressLine1: string;
  currentAddressLine2: string;
  currentPinCode: string;
  currentCity: string;
  currentState: string;
  currentPostOffice: string;
  residenceType: string;
  monthlyRent: string;
  yearsAtCurrentAddress: string;
  sameAsPermanentAddress: boolean;
  permanentAddressLine1: string;
  permanentAddressLine2: string;
  permanentPinCode: string;
  permanentCity: string;
  permanentState: string;
  permanentPostOffice: string;
  // Step 5: Employment
  employmentType: string;
  companyName: string;
  designation: string;
  monthlyNetSalary: string;
  yearsOfExperience: string;
  businessName: string;
  businessType: string;
  annualTurnover: string;
  yearsInBusiness: string;
  monthlyIncome: string;
  gstNumber: string;
  // Step 6: Co-Applicant
  coApplicantName: string;
  coApplicantRelationship: string;
  coApplicantPAN: string;
  coApplicantPANVerified: boolean;
  coApplicantIncome: string;
  coApplicantConsent: boolean;
  coApplicantSignature: string | null;
  // Step 7: Documents & Signature
  uploadedDocuments: Record<string, File>;
  signature: string | null;
  // Step 8: Consent
  consent1: boolean;
  consent2: boolean;
  consent3: boolean;
  consent4: boolean;
  // Meta
  applicationId: string | null;
}

export const initialState: LoanFormState = {
  currentStep: 0,
  loanType: '',
  loanAmount: '',
  loanTenure: '',
  loanPurpose: '',
  referralCode: '',
  fullName: '',
  dateOfBirth: '',
  gender: '',
  maritalStatus: '',
  fatherName: '',
  motherName: '',
  email: '',
  emailVerified: false,
  mobile: '',
  mobileVerified: false,
  alternateMobile: '',
  panNumber: '',
  panVerified: false,
  aadhaarNumber: '',
  aadhaarVerified: false,
  aadhaarConsent: false,
  voterId: '',
  passport: '',
  currentAddressLine1: '',
  currentAddressLine2: '',
  currentPinCode: '',
  currentCity: '',
  currentState: '',
  currentPostOffice: '',
  residenceType: '',
  monthlyRent: '',
  yearsAtCurrentAddress: '',
  sameAsPermanentAddress: false,
  permanentAddressLine1: '',
  permanentAddressLine2: '',
  permanentPinCode: '',
  permanentCity: '',
  permanentState: '',
  permanentPostOffice: '',
  employmentType: '',
  companyName: '',
  designation: '',
  monthlyNetSalary: '',
  yearsOfExperience: '',
  businessName: '',
  businessType: '',
  annualTurnover: '',
  yearsInBusiness: '',
  monthlyIncome: '',
  gstNumber: '',
  coApplicantName: '',
  coApplicantRelationship: '',
  coApplicantPAN: '',
  coApplicantPANVerified: false,
  coApplicantIncome: '',
  coApplicantConsent: false,
  coApplicantSignature: null,
  uploadedDocuments: {},
  signature: null,
  consent1: false,
  consent2: false,
  consent3: false,
  consent4: false,
  applicationId: null,
};

type LoanFormAction =
  | { type: 'UPDATE_FIELD'; payload: { key: keyof LoanFormState; value: any } }
  | { type: 'UPDATE_STEP'; payload: number }
  | { type: 'RESET_FORM' }
  | { type: 'BATCH_UPDATE'; payload: Partial<LoanFormState> }
  | { type: 'CLEAR_EMPLOYMENT_FIELDS' }
  | { type: 'CLEAR_COAPP_DATA' }
  | { type: 'SET_APPLICATION_ID' };

function loanFormReducer(state: LoanFormState, action: LoanFormAction): LoanFormState {
  switch (action.type) {
    case 'UPDATE_FIELD':
      return { ...state, [action.payload.key]: action.payload.value };

    case 'UPDATE_STEP':
      return { ...state, currentStep: action.payload };

    case 'BATCH_UPDATE':
      return { ...state, ...action.payload };

    case 'RESET_FORM':
      return initialState;

    case 'CLEAR_EMPLOYMENT_FIELDS':
      return {
        ...state,
        companyName: '',
        designation: '',
        monthlyNetSalary: '',
        yearsOfExperience: '',
        businessName: '',
        businessType: '',
        annualTurnover: '',
        yearsInBusiness: '',
        monthlyIncome: '',
        gstNumber: '',
      };

    case 'CLEAR_COAPP_DATA':
      return {
        ...state,
        coApplicantName: '',
        coApplicantRelationship: '',
        coApplicantPAN: '',
        coApplicantPANVerified: false,
        coApplicantIncome: '',
        coApplicantConsent: false,
        coApplicantSignature: null,
      };

    case 'SET_APPLICATION_ID':
      return {
        ...state,
        applicationId: `LS-2026-${uuidv4().slice(0, 6).toUpperCase()}`,
      };

    default:
      return state;
  }
}

interface LoanFormContextType {
  state: LoanFormState;
  updateField: (key: keyof LoanFormState, value: any) => void;
  updateStep: (step: number) => void;
  resetForm: () => void;
  batchUpdate: (updates: Partial<LoanFormState>) => void;
  clearEmploymentFields: () => void;
  clearCoAppData: () => void;
  setApplicationId: () => void;
}

const LoanFormContext = createContext<LoanFormContextType | undefined>(undefined);

export function LoanFormProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(loanFormReducer, initialState);

  const updateField = useCallback((key: keyof LoanFormState, value: any) => {
    dispatch({ type: 'UPDATE_FIELD', payload: { key, value } });
  }, []);

  const updateStep = useCallback((step: number) => {
    dispatch({ type: 'UPDATE_STEP', payload: step });
  }, []);

  const resetForm = useCallback(() => {
    dispatch({ type: 'RESET_FORM' });
  }, []);

  const batchUpdate = useCallback((updates: Partial<LoanFormState>) => {
    dispatch({ type: 'BATCH_UPDATE', payload: updates });
  }, []);

  const clearEmploymentFields = useCallback(() => {
    dispatch({ type: 'CLEAR_EMPLOYMENT_FIELDS' });
  }, []);

  const clearCoAppData = useCallback(() => {
    dispatch({ type: 'CLEAR_COAPP_DATA' });
  }, []);

  const setApplicationId = useCallback(() => {
    dispatch({ type: 'SET_APPLICATION_ID' });
  }, []);

  return (
    <LoanFormContext.Provider
      value={{
        state,
        updateField,
        updateStep,
        resetForm,
        batchUpdate,
        clearEmploymentFields,
        clearCoAppData,
        setApplicationId,
      }}
    >
      {children}
    </LoanFormContext.Provider>
  );
}

export function useLoanForm() {
  const context = useContext(LoanFormContext);
  if (!context) {
    throw new Error('useLoanForm must be used within LoanFormProvider');
  }
  return context;
}
