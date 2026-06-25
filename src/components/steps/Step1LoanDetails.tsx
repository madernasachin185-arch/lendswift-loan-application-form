'use client';

import React, { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step1Schema } from '@/schemas/loanFormSchemas';
import { useLoanForm } from '@/context/LoanFormContext';
import { calculateEMI, formatINR, LOAN_RATES } from '@/utils/helpers';
import Input from '../common/Input';
import Select from '../common/Select';

interface Step1Props {
  onNext: () => void;
}

export default function Step1LoanDetails({ onNext }: Step1Props) {
  const { state, updateField } = useLoanForm();

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(step1Schema),
    mode: 'onChange',
    defaultValues: {
      loanType: state.loanType || '',
      loanAmount: state.loanAmount ? parseInt(state.loanAmount).toString() : '',
      loanTenure: state.loanTenure ? state.loanTenure.toString() : '',
      loanPurpose: state.loanPurpose || '',
      referralCode: state.referralCode || '',
    },
  });

  const watchedValues = watch();
  const loanAmount = watchedValues.loanAmount ? parseFloat(watchedValues.loanAmount) : 0;
  const loanTenure = watchedValues.loanTenure ? parseInt(watchedValues.loanTenure) : 0;
  const loanType = watchedValues.loanType as keyof typeof LOAN_RATES;

  const emiDetails = useMemo(() => {
    if (!loanAmount || !loanTenure || !loanType) return null;
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
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Loan Type <span className="text-red-500">*</span>
        </label>
        <Controller
          name="loanType"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={[
                { value: 'Personal', label: 'Personal Loan' },
                { value: 'Home', label: 'Home Loan' },
                { value: 'Business', label: 'Business Loan' },
              ]}
              placeholder="Select loan type"
              error={errors.loanType?.message}
              aria-describedby={errors.loanType ? 'loanType-error' : undefined}
            />
          )}
        />
        {errors.loanType && (
          <p id="loanType-error" className="text-sm text-red-500 mt-1" role="alert">
            {errors.loanType.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Loan Amount (₹) <span className="text-red-500">*</span>
        </label>
        <Controller
          name="loanAmount"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="number"
              placeholder="₹50,000 to ₹1,00,00,000"
              error={errors.loanAmount?.message}
              min="50000"
              max="10000000"
              aria-describedby={errors.loanAmount ? 'loanAmount-error' : undefined}
            />
          )}
        />
        {errors.loanAmount && (
          <p id="loanAmount-error" className="text-sm text-red-500 mt-1" role="alert">
            {errors.loanAmount.message}
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Loan Tenure (Months) <span className="text-red-500">*</span>
        </label>
        <Controller
          name="loanTenure"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="number"
              placeholder="6 to 360 months"
              error={errors.loanTenure?.message}
              min="6"
              max="360"
              aria-describedby={errors.loanTenure ? 'loanTenure-error' : undefined}
            />
          )}
        />
        {errors.loanTenure && (
          <p id="loanTenure-error" className="text-sm text-red-500 mt-1" role="alert">
            {errors.loanTenure.message}
          </p>
        )}
      </div>

      {loanType && (
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Loan Purpose <span className="text-red-500">*</span>
          </label>
          <Controller
            name="loanPurpose"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={(loanPurposeOptions[loanType as keyof typeof loanPurposeOptions] || []).map(
                  purpose => ({
                    value: purpose,
                    label: purpose,
                  })
                )}
                placeholder="Select loan purpose"
                error={errors.loanPurpose?.message}
                aria-describedby={errors.loanPurpose ? 'loanPurpose-error' : undefined}
              />
            )}
          />
          {errors.loanPurpose && (
            <p id="loanPurpose-error" className="text-sm text-red-500 mt-1" role="alert">
              {errors.loanPurpose.message}
            </p>
          )}
        </div>
      )}

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">Referral Code</label>
        <Controller
          name="referralCode"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="text"
              placeholder="Optional referral code"
            />
          )}
        />
      </div>

      {emiDetails && (
        <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6 space-y-3">
          <h3 className="font-semibold text-gray-900">Loan Summary</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-gray-600">Monthly EMI</p>
              <p className="font-semibold text-gray-900">{formatINR(emiDetails.emi)}</p>
            </div>
            <div>
              <p className="text-gray-600">Interest Rate</p>
              <p className="font-semibold text-gray-900">{LOAN_RATES[loanType]}% p.a.</p>
            </div>
            <div>
              <p className="text-gray-600">Processing Fee</p>
              <p className="font-semibold text-gray-900">{formatINR(emiDetails.processingFee)}</p>
            </div>
            <div>
              <p className="text-gray-600">Total Interest</p>
              <p className="font-semibold text-gray-900">{formatINR(emiDetails.totalInterest)}</p>
            </div>
            <div className="col-span-2 border-t border-blue-200 pt-3">
              <p className="text-gray-600">Total Repayment</p>
              <p className="font-semibold text-gray-900">{formatINR(emiDetails.totalPayment + emiDetails.processingFee)}</p>
            </div>
          </div>
        </div>
      )}

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
