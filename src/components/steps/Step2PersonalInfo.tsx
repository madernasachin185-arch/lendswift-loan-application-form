'use client';

import React from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step2Schema } from '@/schemas/loanFormSchemas';
import { useLoanForm } from '@/context/LoanFormContext';
import Input from '../common/Input';
import Select from '../common/Select';

interface Step2Props {
  onNext: () => void;
}

export default function Step2PersonalInfo({ onNext }: Step2Props) {
  const { state, updateField } = useLoanForm();

  const {
    control,
    handleSubmit,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(step2Schema),
    mode: 'onSubmit',
    defaultValues: {
      fullName: state.fullName || '',
      dateOfBirth: state.dateOfBirth || '',
      gender: state.gender || '',
      maritalStatus: state.maritalStatus || '',
      fatherName: state.fatherName || '',
      motherName: state.motherName || '',
      email: state.email || '',
      mobile: state.mobile || '',
      alternateMobile: state.alternateMobile || '',
    },
  });

  const handleFormSubmit = (data: any) => {
    // Auto-scroll to first error on validation failure
    const firstError = document.querySelector('[aria-invalid="true"]');
    if (firstError) {
      firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    updateField('fullName', data.fullName);
    updateField('dateOfBirth', data.dateOfBirth);
    updateField('gender', data.gender);
    updateField('maritalStatus', data.maritalStatus);
    updateField('fatherName', data.fatherName);
    updateField('motherName', data.motherName);
    updateField('email', data.email);
    updateField('mobile', data.mobile);
    updateField('alternateMobile', data.alternateMobile);
    updateField('emailVerified', false);
    updateField('mobileVerified', false);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Full Name <span className="text-red-500">*</span>
        </label>
        <Controller
          name="fullName"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="text"
              placeholder="Enter your full name"
              error={errors.fullName?.message}
              aria-invalid={!!errors.fullName}
              aria-describedby={errors.fullName ? 'fullName-error' : undefined}
            />
          )}
        />
        {errors.fullName && (
          <p id="fullName-error" className="text-sm text-red-500 mt-1" role="alert">
            {errors.fullName.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Date of Birth <span className="text-red-500">*</span>
          </label>
          <Controller
            name="dateOfBirth"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="date"
                error={errors.dateOfBirth?.message}
                aria-invalid={!!errors.dateOfBirth}
                aria-describedby={errors.dateOfBirth ? 'dateOfBirth-error' : undefined}
              />
            )}
          />
          {errors.dateOfBirth && (
            <p id="dateOfBirth-error" className="text-sm text-red-500 mt-1" role="alert">
              {errors.dateOfBirth.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Gender <span className="text-red-500">*</span>
          </label>
          <Controller
            name="gender"
            control={control}
            render={({ field }) => (
              <Select
                {...field}
                options={[
                  { value: 'Male', label: 'Male' },
                  { value: 'Female', label: 'Female' },
                  { value: 'Other', label: 'Other' },
                ]}
                placeholder="Select gender"
                error={errors.gender?.message}
                aria-describedby={errors.gender ? 'gender-error' : undefined}
              />
            )}
          />
          {errors.gender && (
            <p id="gender-error" className="text-sm text-red-500 mt-1" role="alert">
              {errors.gender.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Marital Status <span className="text-red-500">*</span>
        </label>
        <Controller
          name="maritalStatus"
          control={control}
          render={({ field }) => (
            <Select
              {...field}
              options={[
                { value: 'Single', label: 'Single' },
                { value: 'Married', label: 'Married' },
                { value: 'Divorced', label: 'Divorced' },
                { value: 'Widowed', label: 'Widowed' },
              ]}
              placeholder="Select marital status"
              error={errors.maritalStatus?.message}
              aria-describedby={errors.maritalStatus ? 'maritalStatus-error' : undefined}
            />
          )}
        />
        {errors.maritalStatus && (
          <p id="maritalStatus-error" className="text-sm text-red-500 mt-1" role="alert">
            {errors.maritalStatus.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Father&apos;s Name <span className="text-red-500">*</span>
          </label>
          <Controller
            name="fatherName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                placeholder="Enter father's name"
                error={errors.fatherName?.message}
                aria-describedby={errors.fatherName ? 'fatherName-error' : undefined}
              />
            )}
          />
          {errors.fatherName && (
            <p id="fatherName-error" className="text-sm text-red-500 mt-1" role="alert">
              {errors.fatherName.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Mother&apos;s Name <span className="text-red-500">*</span>
          </label>
          <Controller
            name="motherName"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="text"
                placeholder="Enter mother's name"
                error={errors.motherName?.message}
                aria-describedby={errors.motherName ? 'motherName-error' : undefined}
              />
            )}
          />
          {errors.motherName && (
            <p id="motherName-error" className="text-sm text-red-500 mt-1" role="alert">
              {errors.motherName.message}
            </p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-semibold text-gray-900 mb-2">
          Email Address <span className="text-red-500">*</span>
        </label>
        <Controller
          name="email"
          control={control}
          render={({ field }) => (
            <Input
              {...field}
              type="email"
              placeholder="your.email@example.com"
              error={errors.email?.message}
              aria-describedby={errors.email ? 'email-error' : undefined}
            />
          )}
        />
        {errors.email && (
          <p id="email-error" className="text-sm text-red-500 mt-1" role="alert">
            {errors.email.message}
          </p>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Mobile Number <span className="text-red-500">*</span>
          </label>
          <Controller
            name="mobile"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="tel"
                placeholder="9876543210"
                maxLength={10}
                error={errors.mobile?.message}
                aria-describedby={errors.mobile ? 'mobile-error' : undefined}
              />
            )}
          />
          {errors.mobile && (
            <p id="mobile-error" className="text-sm text-red-500 mt-1" role="alert">
              {errors.mobile.message}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Alternate Mobile <span className="text-red-500">*</span>
          </label>
          <Controller
            name="alternateMobile"
            control={control}
            render={({ field }) => (
              <Input
                {...field}
                type="tel"
                placeholder="9876543211"
                maxLength={10}
                error={errors.alternateMobile?.message}
                aria-describedby={errors.alternateMobile ? 'alternateMobile-error' : undefined}
              />
            )}
          />
          {errors.alternateMobile && (
            <p id="alternateMobile-error" className="text-sm text-red-500 mt-1" role="alert">
              {errors.alternateMobile.message}
            </p>
          )}
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
