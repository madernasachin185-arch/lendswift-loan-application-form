'use client';

import React, { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import clsx from 'clsx';
import { step1Schema } from '@/schemas/loanFormSchemas';
import { useLoanForm } from '@/context/LoanFormContext';
import { calculateEMI, formatINR, LOAN_RATES } from '@/utils/helpers';

interface Step1Props {
  onNext: () => void;
}

export default function Step1LoanDetails({ onNext }: Step1Props) {
  const { state, updateField } = useLoanForm();

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(step1Schema),
    mode: 'onChange',
    defaultValues: {
      loanType: state.loanType || '',
      loanAmount: state.loanAmount ? Number(state.loanAmount) : 0,
      loanTenure: state.loanTenure ? Number(state.loanTenure) : 0,
      loanPurpose: state.loanPurpose || '',
      referralCode: state.referralCode || '',
    },
  });

  const watchedValues = watch();
  const loanAmount = watchedValues.loanAmount || 0;
  const loanTenure = watchedValues.loanTenure || 0;
  const loanType = watchedValues.loanType as keyof typeof LOAN_RATES;

  // EMI Summary: only calculate when both values are valid numbers > 0
  const emiDetails = useMemo(() => {
    if (!loanAmount || !loanTenure || isNaN(loanAmount) || isNaN(loanTenure)) {
      return null;
    }
    if (!loanType || loanAmount <= 0 || loanTenure <= 0) {
      return null;
    }
    const rate = LOAN_RATES[loanType] || 0;
    return calculateEMI(loanAmount, rate, loanTenure);
  }, [loanAmount, loanTenure, loanType]);

  const handleFormSubmit = (data: any) => {
    updateField('loanType', data.loanType);
    updateField('loanAmount', data.loanAmount.toString());
    updateField('loanTenure', data.loanTenure.toString());
    updateField('loanPurpose', data.loanPurpose);
    updateField('referralCode', data.referralCode);
    onNext();
  };

  const loanPurposeOptions = {
    Personal: [
      'Debt Consolidation',
      'Home Renovation',
      'Education',
      'Wedding',
      'Travel',
      'Medical',
      'Other',
    ],
    Home: [
      'Home Purchase',
      'Home Construction',
      'Home Renovation',
      'Balance Transfer',
    ],
    Business: [
      'Working Capital',
      'Equipment Purchase',
      'Expansion',
      'Technology',
      'Inventory',
      'Other',
    ],
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      {/* Loan Type */}
      <div>
        <label htmlFor="loanType" className="block text-sm font-semibold text-gray-900 mb-2">
          Loan Type <span className="text-red-500">*</span>
        </label>
        <select
          {...register('loanType')}
          id="loanType"
          className={clsx(
            'w-full px-4 py-2 border rounded-lg transition-colors font-sans',
            'text-gray-900 bg-white',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            errors.loanType
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          )}
          aria-describedby={errors.loanType ? 'loanType-error' : undefined}
          aria-invalid={!!errors.loanType}
        >
          <option value="">Select loan type</option>
          <option value="Personal">Personal Loan</option>
          <option value="Home">Home Loan</option>
          <option value="Business">Business Loan</option>
        </select>
        {errors.loanType && (
          <p id="loanType-error" className="text-sm text-red-500 mt-1" role="alert">
            {errors.loanType.message}
          </p>
        )}
      </div>

      {/* Loan Amount */}
      <div>
        <label htmlFor="loanAmount" className="block text-sm font-semibold text-gray-900 mb-2">
          Loan Amount (₹) <span className="text-red-500">*</span>
        </label>
        <input
          {...register('loanAmount', { valueAsNumber: true })}
          id="loanAmount"
          type="number"
          placeholder="₹50,000 to ₹1,00,00,000"
          min={50000}
          max={10000000}
          className={clsx(
            'w-full px-4 py-2 border rounded-lg transition-colors font-sans',
            'text-gray-900 bg-white placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            errors.loanAmount
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          )}
          aria-describedby={errors.loanAmount ? 'loanAmount-error' : undefined}
          aria-invalid={!!errors.loanAmount}
        />
        {errors.loanAmount && (
          <p id="loanAmount-error" className="text-sm text-red-500 mt-1" role="alert">
            {errors.loanAmount.message}
          </p>
        )}
      </div>

      {/* Loan Tenure */}
      <div>
        <label htmlFor="loanTenure" className="block text-sm font-semibold text-gray-900 mb-2">
          Loan Tenure (Months) <span className="text-red-500">*</span>
        </label>
        <input
          {...register('loanTenure', { valueAsNumber: true })}
          id="loanTenure"
          type="number"
          placeholder="6 to 360 months"
          min={6}
          max={360}
          className={clsx(
            'w-full px-4 py-2 border rounded-lg transition-colors font-sans',
            'text-gray-900 bg-white placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            errors.loanTenure
              ? 'border-red-500 bg-red-50'
              : 'border-gray-300 hover:border-gray-400'
          )}
          aria-describedby={errors.loanTenure ? 'loanTenure-error' : undefined}
          aria-invalid={!!errors.loanTenure}
        />
        {errors.loanTenure && (
          <p id="loanTenure-error" className="text-sm text-red-500 mt-1" role="alert">
            {errors.loanTenure.message}
          </p>
        )}
      </div>

      {/* Loan Purpose */}
      {loanType && (
        <div>
          <label htmlFor="loanPurpose" className="block text-sm font-semibold text-gray-900 mb-2">
            Loan Purpose <span className="text-red-500">*</span>
          </label>
          <select
            {...register('loanPurpose')}
            id="loanPurpose"
            className={clsx(
              'w-full px-4 py-2 border rounded-lg transition-colors font-sans',
              'text-gray-900 bg-white',
              'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
              errors.loanPurpose
                ? 'border-red-500 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
            )}
            aria-describedby={errors.loanPurpose ? 'loanPurpose-error' : undefined}
            aria-invalid={!!errors.loanPurpose}
          >
            <option value="">Select loan purpose</option>
            {(loanPurposeOptions[loanType as keyof typeof loanPurposeOptions] || []).map(purpose => (
              <option key={purpose} value={purpose}>
                {purpose}
              </option>
            ))}
          </select>
          {errors.loanPurpose && (
            <p id="loanPurpose-error" className="text-sm text-red-500 mt-1" role="alert">
              {errors.loanPurpose.message}
            </p>
          )}
        </div>
      )}

      {/* Referral Code */}
      <div>
        <label htmlFor="referralCode" className="block text-sm font-semibold text-gray-900 mb-2">
          Referral Code
        </label>
        <input
          {...register('referralCode')}
          id="referralCode"
          type="text"
          placeholder="Optional referral code"
          className={clsx(
            'w-full px-4 py-2 border rounded-lg transition-colors font-sans',
            'text-gray-900 bg-white placeholder:text-gray-400',
            'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent',
            'border-gray-300 hover:border-gray-400'
          )}
        />
      </div>

      {/* Loan Summary - EMI */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 space-y-3">
        <h3 className="font-semibold text-gray-900">Loan Summary</h3>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-gray-600">Monthly EMI</p>
            <p className="font-semibold text-gray-900">
              {emiDetails ? formatINR(emiDetails.emi) : '—'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Interest Rate</p>
            <p className="font-semibold text-gray-900">
              {loanType ? `${LOAN_RATES[loanType]}% p.a.` : '—'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Processing Fee</p>
            <p className="font-semibold text-gray-900">
              {emiDetails ? formatINR(emiDetails.processingFee) : '—'}
            </p>
          </div>
          <div>
            <p className="text-gray-600">Total Interest</p>
            <p className="font-semibold text-gray-900">
              {emiDetails ? formatINR(emiDetails.totalInterest) : '—'}
            </p>
          </div>
          <div className="col-span-2 border-t border-blue-200 pt-3">
            <p className="text-gray-600">Total Repayment</p>
            <p className="font-semibold text-gray-900">
              {emiDetails ? formatINR(emiDetails.totalPayment + emiDetails.processingFee) : '—'}
            </p>
          </div>
        </div>
      </div>

      {/* Submit Button */}
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
