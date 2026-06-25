'use client';

import React, { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step3Schema } from '@/schemas/loanFormSchemas';
import { useLoanForm } from '@/context/LoanFormContext';
import { isValidAadhaar } from '@/utils/helpers';
import Input from '../common/Input';

interface Step3Props {
  onNext: () => void;
}

export default function Step3KYC({ onNext }: Step3Props) {
  const { state, updateField } = useLoanForm();
  const [panVerifying, setPanVerifying] = useState(false);
  const [aadhaarVerifying, setAadhaarVerifying] = useState(false);

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(step3Schema),
    mode: 'onSubmit',
    defaultValues: {
      panNumber: (state.panNumber || '').toUpperCase(),
      aadhaarNumber: state.aadhaarNumber || '',
      aadhaarConsent: state.aadhaarConsent || false,
      voterId: state.voterId || '',
      passport: state.passport || '',
    },
  });

  const panNumber = watch('panNumber');
  const aadhaarNumber = watch('aadhaarNumber');

  const handleVerifyPAN = async () => {
    if (panNumber && /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase())) {
      setPanVerifying(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateField('panVerified', true);
      setPanVerifying(false);
    }
  };

  const handleVerifyAadhaar = async () => {
    if (aadhaarNumber && isValidAadhaar(aadhaarNumber)) {
      setAadhaarVerifying(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      updateField('aadhaarVerified', true);
      setAadhaarVerifying(false);
    }
  };

  const handleFormSubmit = (data: any) => {
    // Auto-scroll to first error on validation failure
    const firstError = document.querySelector('[aria-invalid="true"]');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    updateField('panNumber', data.panNumber.toUpperCase());
    updateField('aadhaarNumber', data.aadhaarNumber);
    updateField('aadhaarConsent', data.aadhaarConsent);
    updateField('voterId', data.voterId);
    updateField('passport', data.passport);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">KYC Information:</span> This information will be verified against government databases
          to ensure authenticity and prevent fraud.
        </p>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          PAN Number <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <Controller
            name="panNumber"
            control={control}
            render={({ field }) => (
              <div className="flex-1">
                <Input
                  {...field}
                  type="text"
                  placeholder="ABCDE1234F"
                  maxLength={10}
                  onChange={e => field.onChange(e.target.value.toUpperCase())}
                  error={errors.panNumber?.message}
                  aria-describedby={errors.panNumber ? 'panNumber-error' : undefined}
                />
                {errors.panNumber && (
                  <p id="panNumber-error" className="text-sm text-red-500 mt-1" role="alert">
                    {errors.panNumber.message}
                  </p>
                )}
              </div>
            )}
          />
          <button
            type="button"
            onClick={handleVerifyPAN}
            disabled={panVerifying || !panNumber || !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber.toUpperCase())}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors self-start mt-0 h-10"
            aria-label="Verify PAN number"
          >
            {panVerifying ? 'Verifying...' : 'Verify'}
          </button>
        </div>
        {state.panVerified && (
          <p className="text-sm text-green-600 mt-2 flex items-center">
            ✓ PAN verified successfully
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Aadhaar Number <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-2">
          <Controller
            name="aadhaarNumber"
            control={control}
            render={({ field }) => (
              <div className="flex-1">
                <Input
                  {...field}
                  type="text"
                  placeholder="123456789012"
                  maxLength={12}
                  error={errors.aadhaarNumber?.message}
                  aria-describedby={errors.aadhaarNumber ? 'aadhaarNumber-error' : undefined}
                />
                {errors.aadhaarNumber && (
                  <p id="aadhaarNumber-error" className="text-sm text-red-500 mt-1" role="alert">
                    {errors.aadhaarNumber.message}
                  </p>
                )}
              </div>
            )}
          />
          <button
            type="button"
            onClick={handleVerifyAadhaar}
            disabled={aadhaarVerifying || !aadhaarNumber || !isValidAadhaar(aadhaarNumber)}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:bg-gray-300 text-white rounded-lg font-medium transition-colors self-start mt-0 h-10"
            aria-label="Verify Aadhaar number"
          >
            {aadhaarVerifying ? 'Verifying...' : 'Verify'}
          </button>
        </div>
        {state.aadhaarVerified && (
          <p className="text-sm text-green-600 mt-2 flex items-center">
            ✓ Aadhaar verified successfully
          </p>
        )}
      </div>

      <div>
        <Controller
          name="aadhaarConsent"
          control={control}
          render={({ field }) => (
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                {...field}
                type="checkbox"
                className="w-5 h-5 rounded border-gray-300 text-blue-600 mt-1"
                aria-describedby={errors.aadhaarConsent ? 'aadhaarConsent-error' : undefined}
              />
              <span className="text-sm text-gray-700">
                I authorize LendSwift to access my Aadhaar data for KYC verification
                <span className="text-red-500">*</span>
              </span>
            </label>
          )}
        />
        {errors.aadhaarConsent && (
          <p id="aadhaarConsent-error" className="text-sm text-red-500 mt-1" role="alert">
            {errors.aadhaarConsent.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Voter ID (Optional)
          </label>
          <Controller
            name="voterId"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                placeholder="Enter voter ID if available"
              />
            )}
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Passport Number (Optional)
          </label>
          <Controller
            name="passport"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                placeholder="Enter passport number if available"
              />
            )}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!isValid}
        className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-semibold py-3 rounded-lg transition-colors"
        aria-label="Continue to next step"
      >
        Continue to Next Step
      </button>
    </form>
  );
}
