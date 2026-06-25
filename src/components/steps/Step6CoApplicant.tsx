'use client';

import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step6Schema } from '@/schemas/loanFormSchemas';
import { useLoanForm } from '@/context/LoanFormContext';
import Input from '../common/Input';
import Select from '../common/Select';

interface Step6Props {
  onNext: () => void;
  onSkip?: () => void;
}

export default function Step6CoApplicant({ onNext, onSkip }: Step6Props) {
  const { state, updateField } = useLoanForm();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(step6Schema),
    mode: 'onSubmit',
    defaultValues: {
      coApplicantName: state.coApplicantName || '',
      coApplicantRelationship: state.coApplicantRelationship || '',
      coApplicantPAN: (state.coApplicantPAN || '').toUpperCase(),
      coApplicantIncome: state.coApplicantIncome ? parseFloat(state.coApplicantIncome).toString() : '',
      coApplicantConsent: state.coApplicantConsent || false,
    },
  });

  const handleFormSubmit = (data: any) => {
    // Auto-scroll to first error on validation failure
    const firstError = document.querySelector('[aria-invalid="true"]');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    updateField('coApplicantName', data.coApplicantName);
    updateField('coApplicantRelationship', data.coApplicantRelationship);
    updateField('coApplicantPAN', data.coApplicantPAN.toUpperCase());
    updateField('coApplicantIncome', data.coApplicantIncome.toString());
    updateField('coApplicantConsent', data.coApplicantConsent);
    updateField('coApplicantSignature', data.coApplicantSignature);
    onNext();
  };

  const relationshipOptions = [
    { value: 'Spouse', label: 'Spouse' },
    { value: 'Parent', label: 'Parent' },
    { value: 'Sibling', label: 'Sibling' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Co-Applicant:</span> Adding a co-applicant can increase your loan eligibility
          and improve approval chances. A co-applicant becomes equally responsible for loan repayment.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Co-Applicant Name <span className="text-red-500">*</span>
        </label>
        <Controller
          name="coApplicantName"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="text"
              placeholder="Enter co-applicant's full name"
              error={errors.coApplicantName?.message}
              aria-describedby={errors.coApplicantName ? 'coApplicantName-error' : undefined}
            />
          )}
        />
        {errors.coApplicantName && (
          <p id="coApplicantName-error" className="text-sm text-red-500 mt-1" role="alert">
            {errors.coApplicantName.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Relationship <span className="text-red-500">*</span>
        </label>
        <Controller
          name="coApplicantRelationship"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={relationshipOptions}
              placeholder="Select relationship"
              error={errors.coApplicantRelationship?.message}
              aria-describedby={errors.coApplicantRelationship ? 'coApplicantRelationship-error' : undefined}
            />
          )}
        />
        {errors.coApplicantRelationship && (
          <p id="coApplicantRelationship-error" className="text-sm text-red-500 mt-1" role="alert">
            {errors.coApplicantRelationship.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          PAN Number <span className="text-red-500">*</span>
        </label>
        <Controller
          name="coApplicantPAN"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="text"
              placeholder="ABCDE1234F"
              maxLength={10}
              onChange={e => field.onChange(e.target.value.toUpperCase())}
              error={errors.coApplicantPAN?.message}
              aria-describedby={errors.coApplicantPAN ? 'coApplicantPAN-error' : undefined}
            />
          )}
        />
        {errors.coApplicantPAN && (
          <p id="coApplicantPAN-error" className="text-sm text-red-500 mt-1" role="alert">
            {errors.coApplicantPAN.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Monthly Income (₹) <span className="text-red-500">*</span>
        </label>
        <Controller
          name="coApplicantIncome"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="number"
              placeholder="₹8,000 minimum"
              error={errors.coApplicantIncome?.message}
              aria-describedby={errors.coApplicantIncome ? 'coApplicantIncome-error' : undefined}
            />
          )}
        />
        {errors.coApplicantIncome && (
          <p id="coApplicantIncome-error" className="text-sm text-red-500 mt-1" role="alert">
            {errors.coApplicantIncome.message}
          </p>
        )}
      </div>

      <div>
        <Controller
          name="coApplicantConsent"
          control={control}
          render={({ field }) => (
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                {...field}
                type="checkbox"
                className="w-5 h-5 rounded border-gray-300 text-blue-600 mt-1"
                aria-describedby={errors.coApplicantConsent ? 'coApplicantConsent-error' : undefined}
              />
              <span className="text-sm text-gray-700">
                I authorize the co-applicant to be included in this loan application. The co-applicant
                has voluntarily agreed to co-apply for this loan and accepts all terms and conditions.
                <span className="text-red-500">*</span>
              </span>
            </label>
          )}
        />
        {errors.coApplicantConsent && (
          <p id="coApplicantConsent-error" className="text-sm text-red-500 mt-1" role="alert">
            {errors.coApplicantConsent.message}
          </p>
        )}
      </div>

      <div className="flex gap-4">
        <button
          type="submit"
          disabled={!isValid}
          className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
          aria-label="Continue to next step"
        >
          Continue
        </button>
        {onSkip && (
          <button
            type="button"
            onClick={onSkip}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 rounded-lg transition-colors"
            aria-label="Skip co-applicant"
          >
            Skip
          </button>
        )}
      </div>
    </form>
  );
}
