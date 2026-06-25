'use client';

import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step8Schema } from '@/schemas/loanFormSchemas';
import { useLoanForm } from '@/context/LoanFormContext';
import { calculateEMI, formatINR, LOAN_RATES } from '@/utils/helpers';

interface Step8Props {
  onSubmit: () => void;
  onEditStep?: (stepIndex: number) => void;
}

export default function Step8Review({ onSubmit, onEditStep }: Step8Props) {
  const { state, updateField, setApplicationId } = useLoanForm();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(step8Schema),
    mode: 'onChange',
    defaultValues: {
      consent1: state.consent1 || false,
      consent2: state.consent2 || false,
      consent3: state.consent3 || false,
      consent4: state.consent4 || false,
    },
  });

  const loanAmount = parseFloat(state.loanAmount) || 0;
  const loanTenure = parseInt(state.loanTenure) || 0;
  const loanType = state.loanType as keyof typeof LOAN_RATES;
  const rate = LOAN_RATES[loanType] || 0;
  const emiDetails = calculateEMI(loanAmount, rate, loanTenure);

  const handleFormSubmit = (data: any) => {
    updateField('consent1', data.consent1);
    updateField('consent2', data.consent2);
    updateField('consent3', data.consent3);
    updateField('consent4', data.consent4);
    setApplicationId();
    onSubmit();
  };

  const reviewSections = [
    {
      title: 'Loan Details',
      stepIndex: 0,
      items: [
        { label: 'Loan Type', value: state.loanType },
        { label: 'Loan Amount', value: formatINR(loanAmount) },
        { label: 'Tenure', value: `${state.loanTenure} Months` },
        { label: 'Purpose', value: state.loanPurpose },
      ],
    },
    {
      title: 'Personal Information',
      stepIndex: 1,
      items: [
        { label: 'Full Name', value: state.fullName },
        { label: 'Date of Birth', value: state.dateOfBirth },
        { label: 'Gender', value: state.gender },
        { label: 'Marital Status', value: state.maritalStatus },
        { label: 'Email', value: state.email },
        { label: 'Mobile', value: state.mobile },
      ],
    },
    {
      title: 'KYC Information',
      stepIndex: 2,
      items: [
        { label: 'PAN Number', value: state.panNumber, verified: state.panVerified },
        { label: 'Aadhaar Number', value: state.aadhaarNumber, verified: state.aadhaarVerified },
      ],
    },
    {
      title: 'Address',
      stepIndex: 3,
      items: [
        { label: 'Current Address', value: `${state.currentAddressLine1}, ${state.currentCity} - ${state.currentPinCode}` },
        { label: 'Permanent Address', value: `${state.permanentAddressLine1}, ${state.permanentCity} - ${state.permanentPinCode}` },
      ],
    },
    {
      title: 'Employment',
      stepIndex: 4,
      items:
        state.employmentType === 'Salaried'
          ? [
              { label: 'Employment Type', value: 'Salaried' },
              { label: 'Company', value: state.companyName },
              { label: 'Designation', value: state.designation },
              { label: 'Monthly Salary', value: formatINR(parseFloat(state.monthlyNetSalary) || 0) },
            ]
          : [
              { label: 'Employment Type', value: 'Self-Employed' },
              { label: 'Business Name', value: state.businessName },
              { label: 'Business Type', value: state.businessType },
              { label: 'Annual Turnover', value: formatINR(parseFloat(state.annualTurnover) || 0) },
              { label: 'Monthly Income', value: formatINR(parseFloat(state.monthlyIncome) || 0) },
            ],
    },
  ];

  // Add co-applicant section if exists
  if (state.coApplicantName) {
    reviewSections.push({
      title: 'Co-Applicant',
      stepIndex: 5,
      items: [
        { label: 'Name', value: state.coApplicantName },
        { label: 'Relationship', value: state.coApplicantRelationship },
        { label: 'PAN', value: state.coApplicantPAN },
        { label: 'Income', value: formatINR(parseFloat(state.coApplicantIncome) || 0) },
      ],
    });
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {/* Loan Summary */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Loan Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">Monthly EMI</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{formatINR(emiDetails.emi)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">Interest Rate</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{rate}% p.a.</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">Processing Fee</p>
            <p className="text-xl font-bold text-gray-900 mt-1">{formatINR(emiDetails.processingFee)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-600 uppercase font-semibold">Total Repayment</p>
            <p className="text-xl font-bold text-green-600 mt-1">
              {formatINR(emiDetails.totalPayment + emiDetails.processingFee)}
            </p>
          </div>
        </div>

        <div className="border-t border-blue-200 mt-4 pt-4">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Total Interest</p>
              <p className="font-semibold text-gray-900">{formatINR(emiDetails.totalInterest)}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Amount to Pay</p>
              <p className="font-semibold text-gray-900">
                {formatINR(emiDetails.totalPayment + emiDetails.processingFee)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Review Sections */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Application Details</h3>

        {reviewSections.map((section, idx) => (
          <div key={idx} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">{section.title}</h4>
              {onEditStep && (
                <button
                  type="button"
                  onClick={() => onEditStep(section.stepIndex)}
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                  aria-label={`Edit ${section.title}`}
                >
                  Edit
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {section.items.map((item, itemIdx) => (
                <div key={itemIdx} className="text-sm">
                  <p className="text-gray-600">{item.label}</p>
                  <div className="flex items-center gap-2 mt-1">
                    <p className="font-medium text-gray-900">{item.value}</p>
                    {item.verified && (
                      <span className="text-xs text-green-600 font-medium">✓ Verified</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Consents */}
      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Consents & Agreements</h3>

        <div className="space-y-4">
          <Controller
            name="consent1"
            control={control}
            render={({ field }) => (
              <label className="flex items-start gap-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  {...field}
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 mt-1"
                  aria-describedby={errors.consent1 ? 'consent1-error' : undefined}
                />
                <span className="text-sm text-gray-700">
                  I have reviewed all the information provided in this application and confirm that it is accurate,
                  complete, and true to the best of my knowledge.
                  <span className="text-red-500">*</span>
                </span>
              </label>
            )}
          />
          {errors.consent1 && (
            <p id="consent1-error" className="text-sm text-red-500" role="alert">
              {errors.consent1.message}
            </p>
          )}

          <Controller
            name="consent2"
            control={control}
            render={({ field }) => (
              <label className="flex items-start gap-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  {...field}
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 mt-1"
                  aria-describedby={errors.consent2 ? 'consent2-error' : undefined}
                />
                <span className="text-sm text-gray-700">
                  I authorize LendSwift to verify my personal, financial, and employment details from relevant
                  authorities and institutions. I understand that this may include credit checks and background verification.
                  <span className="text-red-500">*</span>
                </span>
              </label>
            )}
          />
          {errors.consent2 && (
            <p id="consent2-error" className="text-sm text-red-500" role="alert">
              {errors.consent2.message}
            </p>
          )}

          <Controller
            name="consent3"
            control={control}
            render={({ field }) => (
              <label className="flex items-start gap-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  {...field}
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 mt-1"
                  aria-describedby={errors.consent3 ? 'consent3-error' : undefined}
                />
                <span className="text-sm text-gray-700">
                  I agree to the Terms & Conditions and Privacy Policy of LendSwift. I understand that my data will be
                  processed in accordance with the Privacy Policy.
                  <span className="text-red-500">*</span>
                </span>
              </label>
            )}
          />
          {errors.consent3 && (
            <p id="consent3-error" className="text-sm text-red-500" role="alert">
              {errors.consent3.message}
            </p>
          )}

          <Controller
            name="consent4"
            control={control}
            render={({ field }) => (
              <label className="flex items-start gap-3 cursor-pointer p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                <input
                  {...field}
                  type="checkbox"
                  className="w-5 h-5 rounded border-gray-300 text-blue-600 mt-1"
                  aria-describedby={errors.consent4 ? 'consent4-error' : undefined}
                />
                <span className="text-sm text-gray-700">
                  I acknowledge that I have read and understood all the information in this application, and I am
                  proceeding with the loan application of my own free will.
                  <span className="text-red-500">*</span>
                </span>
              </label>
            )}
          />
          {errors.consent4 && (
            <p id="consent4-error" className="text-sm text-red-500" role="alert">
              {errors.consent4.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={!isValid}
        className="w-full bg-green-600 hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
        aria-label="Submit application"
      >
        Submit Application
      </button>
    </form>
  );
}
