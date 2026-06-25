'use client';

import React, { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step5SalariedSchema, step5SelfEmployedSchema } from '@/schemas/loanFormSchemas';
import { useLoanForm } from '@/context/LoanFormContext';
import Input from '../common/Input';
import Select from '../common/Select';

interface Step5Props {
  onNext: () => void;
}

export default function Step5Employment({ onNext }: Step5Props) {
  const { state, updateField, clearEmploymentFields } = useLoanForm();
  const employmentType = state.employmentType;

  const schema = employmentType === 'Self-Employed' ? step5SelfEmployedSchema : step5SalariedSchema;

  const {
    control,
    handleSubmit,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
    mode: 'onSubmit',
    defaultValues:
      employmentType === 'Self-Employed'
        ? {
            employmentType: 'Self-Employed',
            businessName: state.businessName || '',
            businessType: state.businessType || '',
            annualTurnover: state.annualTurnover ? parseFloat(state.annualTurnover).toString() : '',
            yearsInBusiness: state.yearsInBusiness ? parseFloat(state.yearsInBusiness).toString() : '',
            monthlyIncome: state.monthlyIncome ? parseFloat(state.monthlyIncome).toString() : '',
            gstNumber: (state.gstNumber || '').toUpperCase(),
          }
        : {
            employmentType: 'Salaried',
            companyName: state.companyName || '',
            designation: state.designation || '',
            monthlyNetSalary: state.monthlyNetSalary ? parseFloat(state.monthlyNetSalary).toString() : '',
            yearsOfExperience: state.yearsOfExperience ? parseFloat(state.yearsOfExperience).toString() : '',
          },
  });

  const watchedEmploymentType = useWatch({ control, name: 'employmentType' });

  useEffect(() => {
    if (watchedEmploymentType !== employmentType) {
      clearEmploymentFields();
    }
  }, [watchedEmploymentType, employmentType, clearEmploymentFields]);

  const handleFormSubmit = (data: any) => {
    // Auto-scroll to first error on validation failure
    const firstError = document.querySelector('[aria-invalid="true"]');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    updateField('employmentType', data.employmentType);

    if (data.employmentType === 'Salaried') {
      updateField('companyName', data.companyName);
      updateField('designation', data.designation);
      updateField('monthlyNetSalary', data.monthlyNetSalary.toString());
      updateField('yearsOfExperience', data.yearsOfExperience.toString());
    } else {
      updateField('businessName', data.businessName);
      updateField('businessType', data.businessType);
      updateField('annualTurnover', data.annualTurnover.toString());
      updateField('yearsInBusiness', data.yearsInBusiness.toString());
      updateField('monthlyIncome', data.monthlyIncome.toString());
      updateField('gstNumber', data.gstNumber.toUpperCase());
    }

    onNext();
  };

  const businessTypes = [
    { value: 'Sole Proprietorship', label: 'Sole Proprietorship' },
    { value: 'Partnership', label: 'Partnership' },
    { value: 'Private Limited', label: 'Private Limited' },
    { value: 'Public Limited', label: 'Public Limited' },
    { value: 'LLP', label: 'LLP' },
    { value: 'Other', label: 'Other' },
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Employment Type <span className="text-red-500">*</span>
        </label>
        <Controller
          name="employmentType"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={[
                { value: 'Salaried', label: 'Salaried' },
                { value: 'Self-Employed', label: 'Self-Employed' },
              ]}
              placeholder="Select employment type"
              aria-describedby="employmentType-hint"
            />
          )}
        />
        <p id="employmentType-hint" className="text-xs text-gray-600 mt-1">
          Changing this will clear previously entered employment details
        </p>
      </div>

      {watchedEmploymentType === 'Salaried' && (
        <div className="space-y-6 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900">Salaried Employment Details</h3>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Company Name <span className="text-red-500">*</span>
            </label>
            <Controller
              name="companyName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder="Your employer's company name"
                  error={errors.companyName?.message}
                  aria-describedby={errors.companyName ? 'companyName-error' : undefined}
                />
              )}
            />
            {errors.companyName && (
              <p id="companyName-error" className="text-sm text-red-500 mt-1" role="alert">
                {errors.companyName.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Designation <span className="text-red-500">*</span>
              </label>
              <Controller
                name="designation"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="text"
                    placeholder="Your job designation"
                    error={errors.designation?.message}
                    aria-describedby={errors.designation ? 'designation-error' : undefined}
                  />
                )}
              />
              {errors.designation && (
                <p id="designation-error" className="text-sm text-red-500 mt-1" role="alert">
                  {errors.designation.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Years of Experience <span className="text-red-500">*</span>
              </label>
              <Controller
                name="yearsOfExperience"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    step="0.5"
                    placeholder="0"
                    error={errors.yearsOfExperience?.message}
                    aria-describedby={errors.yearsOfExperience ? 'yearsOfExperience-error' : undefined}
                  />
                )}
              />
              {errors.yearsOfExperience && (
                <p id="yearsOfExperience-error" className="text-sm text-red-500 mt-1" role="alert">
                  {errors.yearsOfExperience.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Monthly Net Salary (₹) <span className="text-red-500">*</span>
            </label>
            <Controller
              name="monthlyNetSalary"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  placeholder="₹15,000 minimum"
                  error={errors.monthlyNetSalary?.message}
                  aria-describedby={errors.monthlyNetSalary ? 'monthlyNetSalary-error' : undefined}
                />
              )}
            />
            {errors.monthlyNetSalary && (
              <p id="monthlyNetSalary-error" className="text-sm text-red-500 mt-1" role="alert">
                {errors.monthlyNetSalary.message}
              </p>
            )}
          </div>
        </div>
      )}

      {watchedEmploymentType === 'Self-Employed' && (
        <div className="space-y-6 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900">Self-Employed Business Details</h3>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Business Name <span className="text-red-500">*</span>
            </label>
            <Controller
              name="businessName"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder="Your business name"
                  error={errors.businessName?.message}
                  aria-describedby={errors.businessName ? 'businessName-error' : undefined}
                />
              )}
            />
            {errors.businessName && (
              <p id="businessName-error" className="text-sm text-red-500 mt-1" role="alert">
                {errors.businessName.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Business Type <span className="text-red-500">*</span>
            </label>
            <Controller
              name="businessType"
              control={control}
              render={({ field }) => (
                <Select
                  {...field}
                  options={businessTypes}
                  placeholder="Select business type"
                  error={errors.businessType?.message}
                  aria-describedby={errors.businessType ? 'businessType-error' : undefined}
                />
              )}
            />
            {errors.businessType && (
              <p id="businessType-error" className="text-sm text-red-500 mt-1" role="alert">
                {errors.businessType.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Annual Turnover (₹) <span className="text-red-500">*</span>
              </label>
              <Controller
                name="annualTurnover"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    placeholder="₹1,00,000 minimum"
                    error={errors.annualTurnover?.message}
                    aria-describedby={errors.annualTurnover ? 'annualTurnover-error' : undefined}
                  />
                )}
              />
              {errors.annualTurnover && (
                <p id="annualTurnover-error" className="text-sm text-red-500 mt-1" role="alert">
                  {errors.annualTurnover.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Years in Business <span className="text-red-500">*</span>
              </label>
              <Controller
                name="yearsInBusiness"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    step="0.5"
                    placeholder="Minimum 2 years"
                    error={errors.yearsInBusiness?.message}
                    aria-describedby={errors.yearsInBusiness ? 'yearsInBusiness-error' : undefined}
                  />
                )}
              />
              {errors.yearsInBusiness && (
                <p id="yearsInBusiness-error" className="text-sm text-red-500 mt-1" role="alert">
                  {errors.yearsInBusiness.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Monthly Income (₹) <span className="text-red-500">*</span>
            </label>
            <Controller
              name="monthlyIncome"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  placeholder="₹8,000 minimum"
                  error={errors.monthlyIncome?.message}
                  aria-describedby={errors.monthlyIncome ? 'monthlyIncome-error' : undefined}
                />
              )}
            />
            {errors.monthlyIncome && (
              <p id="monthlyIncome-error" className="text-sm text-red-500 mt-1" role="alert">
                {errors.monthlyIncome.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              GST Number <span className="text-red-500">*</span>
            </label>
            <Controller
              name="gstNumber"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder="15-digit GST number"
                  maxLength={15}
                  onChange={e => field.onChange(e.target.value.toUpperCase())}
                  error={errors.gstNumber?.message}
                  aria-describedby={errors.gstNumber ? 'gstNumber-error' : undefined}
                />
              )}
            />
            {errors.gstNumber && (
              <p id="gstNumber-error" className="text-sm text-red-500 mt-1" role="alert">
                {errors.gstNumber.message}
              </p>
            )}
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
