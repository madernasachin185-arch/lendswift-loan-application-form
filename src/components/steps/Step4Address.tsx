'use client';

import React, { useEffect } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { step4Schema } from '@/schemas/loanFormSchemas';
import { useLoanForm } from '@/context/LoanFormContext';
import { lookupPinCode } from '@/utils/helpers';
import Input from '../common/Input';
import Select from '../common/Select';

interface Step4Props {
  onNext: () => void;
}

export default function Step4Address({ onNext }: Step4Props) {
  const { state, updateField } = useLoanForm();

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm({
    resolver: zodResolver(step4Schema),
    mode: 'onChange',
    defaultValues: {
      currentAddressLine1: state.currentAddressLine1 || '',
      currentAddressLine2: state.currentAddressLine2 || '',
      currentPinCode: state.currentPinCode || '',
      currentCity: state.currentCity || '',
      currentState: state.currentState || '',
      currentPostOffice: state.currentPostOffice || '',
      residenceType: state.residenceType || '',
      monthlyRent: state.monthlyRent ? parseFloat(state.monthlyRent).toString() : '',
      yearsAtCurrentAddress: state.yearsAtCurrentAddress ? parseFloat(state.yearsAtCurrentAddress).toString() : '',
      sameAsPermanentAddress: state.sameAsPermanentAddress || false,
      permanentAddressLine1: state.permanentAddressLine1 || '',
      permanentAddressLine2: state.permanentAddressLine2 || '',
      permanentPinCode: state.permanentPinCode || '',
      permanentCity: state.permanentCity || '',
      permanentState: state.permanentState || '',
      permanentPostOffice: state.permanentPostOffice || '',
    },
  });

  const currentPinCode = useWatch({ control, name: 'currentPinCode' });
  const permanentPinCode = useWatch({ control, name: 'permanentPinCode' });
  const sameAsPermanent = useWatch({ control, name: 'sameAsPermanentAddress' });

  // Auto-populate current address from PIN
  useEffect(() => {
    if (currentPinCode && currentPinCode.length === 6) {
      const pinData = lookupPinCode(currentPinCode);
      if (pinData) {
        setValue('currentCity', pinData.city);
        setValue('currentState', pinData.state);
        setValue('currentPostOffice', pinData.postOffice);
      }
    }
  }, [currentPinCode, setValue]);

  // Auto-populate permanent address from PIN
  useEffect(() => {
    if (permanentPinCode && permanentPinCode.length === 6) {
      const pinData = lookupPinCode(permanentPinCode);
      if (pinData) {
        setValue('permanentCity', pinData.city);
        setValue('permanentState', pinData.state);
        setValue('permanentPostOffice', pinData.postOffice);
      }
    }
  }, [permanentPinCode, setValue]);

  // Copy current to permanent when checkbox is ticked
  useEffect(() => {
    if (sameAsPermanent) {
      const currentValues = watch();
      setValue('permanentAddressLine1', currentValues.currentAddressLine1);
      setValue('permanentAddressLine2', currentValues.currentAddressLine2);
      setValue('permanentPinCode', currentValues.currentPinCode);
      setValue('permanentCity', currentValues.currentCity);
      setValue('permanentState', currentValues.currentState);
      setValue('permanentPostOffice', currentValues.currentPostOffice);
    }
  }, [sameAsPermanent, setValue, watch]);

  const handleFormSubmit = (data: any) => {
    updateField('currentAddressLine1', data.currentAddressLine1);
    updateField('currentAddressLine2', data.currentAddressLine2);
    updateField('currentPinCode', data.currentPinCode);
    updateField('currentCity', data.currentCity);
    updateField('currentState', data.currentState);
    updateField('currentPostOffice', data.currentPostOffice);
    updateField('residenceType', data.residenceType);
    updateField('monthlyRent', data.monthlyRent.toString());
    updateField('yearsAtCurrentAddress', data.yearsAtCurrentAddress.toString());
    updateField('sameAsPermanentAddress', data.sameAsPermanentAddress);
    updateField('permanentAddressLine1', data.permanentAddressLine1);
    updateField('permanentAddressLine2', data.permanentAddressLine2);
    updateField('permanentPinCode', data.permanentPinCode);
    updateField('permanentCity', data.permanentCity);
    updateField('permanentState', data.permanentState);
    updateField('permanentPostOffice', data.permanentPostOffice);
    onNext();
  };

  const residenceTypes = [
    { value: 'Owned', label: 'Owned' },
    { value: 'Rented', label: 'Rented' },
    { value: 'Family-owned', label: 'Family-owned' },
  ];

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Current Address</h3>
        
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Address Line 1 <span className="text-red-500">*</span>
            </label>
            <Controller
              name="currentAddressLine1"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder="House No., Building Name"
                  error={errors.currentAddressLine1?.message}
                  aria-describedby={errors.currentAddressLine1 ? 'currentAddressLine1-error' : undefined}
                />
              )}
            />
            {errors.currentAddressLine1 && (
              <p id="currentAddressLine1-error" className="text-sm text-red-500 mt-1" role="alert">
                {errors.currentAddressLine1.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Address Line 2
            </label>
            <Controller
              name="currentAddressLine2"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder="Road Name, Area"
                />
              )}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              PIN Code <span className="text-red-500">*</span>
            </label>
            <Controller
              name="currentPinCode"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  placeholder="6-digit PIN code"
                  maxLength={6}
                  error={errors.currentPinCode?.message}
                  hint={currentPinCode && currentPinCode.length === 6 ? '✓ Details will auto-populate' : ''}
                  aria-describedby={errors.currentPinCode ? 'currentPinCode-error' : undefined}
                />
              )}
            />
            {errors.currentPinCode && (
              <p id="currentPinCode-error" className="text-sm text-red-500 mt-1" role="alert">
                {errors.currentPinCode.message}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Controller
              name="currentCity"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  label="City"
                  readOnly
                  error={errors.currentCity?.message}
                  aria-describedby={errors.currentCity ? 'currentCity-error' : undefined}
                />
              )}
            />
            <Controller
              name="currentState"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  label="State"
                  readOnly
                  error={errors.currentState?.message}
                  aria-describedby={errors.currentState ? 'currentState-error' : undefined}
                />
              )}
            />
            <Controller
              name="currentPostOffice"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="text"
                  label="Post Office"
                  readOnly
                  error={errors.currentPostOffice?.message}
                  aria-describedby={errors.currentPostOffice ? 'currentPostOffice-error' : undefined}
                />
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Residence Type <span className="text-red-500">*</span>
              </label>
              <Controller
                name="residenceType"
                control={control}
                render={({ field }) => (
                  <Select
                    {...field}
                    options={residenceTypes}
                    placeholder="Select residence type"
                    error={errors.residenceType?.message}
                    aria-describedby={errors.residenceType ? 'residenceType-error' : undefined}
                  />
                )}
              />
              {errors.residenceType && (
                <p id="residenceType-error" className="text-sm text-red-500 mt-1" role="alert">
                  {errors.residenceType.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Monthly Rent (₹)
              </label>
              <Controller
                name="monthlyRent"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    type="number"
                    placeholder="0"
                    error={errors.monthlyRent?.message}
                    aria-describedby={errors.monthlyRent ? 'monthlyRent-error' : undefined}
                  />
                )}
              />
              {errors.monthlyRent && (
                <p id="monthlyRent-error" className="text-sm text-red-500 mt-1" role="alert">
                  {errors.monthlyRent.message}
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              Years at Current Address <span className="text-red-500">*</span>
            </label>
            <Controller
              name="yearsAtCurrentAddress"
              control={control}
              render={({ field }) => (
                <Input
                  {...field}
                  type="number"
                  step="0.5"
                  placeholder="0.5 to 80 years"
                  error={errors.yearsAtCurrentAddress?.message}
                  aria-describedby={errors.yearsAtCurrentAddress ? 'yearsAtCurrentAddress-error' : undefined}
                />
              )}
            />
            {errors.yearsAtCurrentAddress && (
              <p id="yearsAtCurrentAddress-error" className="text-sm text-red-500 mt-1" role="alert">
                {errors.yearsAtCurrentAddress.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div className="border-t pt-8">
        <div className="flex items-center gap-3 mb-6">
          <Controller
            name="sameAsPermanentAddress"
            control={control}
            render={({ field }) => (
              <input
                {...field}
                type="checkbox"
                className="w-5 h-5 rounded border-gray-300 text-blue-600"
              />
            )}
          />
          <label className="text-sm font-medium text-gray-700">
            Permanent address is same as current address
          </label>
        </div>

        {!sameAsPermanent && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Permanent Address</h3>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Address Line 1 <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="permanentAddressLine1"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder="House No., Building Name"
                      error={errors.permanentAddressLine1?.message}
                      aria-describedby={errors.permanentAddressLine1 ? 'permanentAddressLine1-error' : undefined}
                    />
                  )}
                />
                {errors.permanentAddressLine1 && (
                  <p id="permanentAddressLine1-error" className="text-sm text-red-500 mt-1" role="alert">
                    {errors.permanentAddressLine1.message}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  Address Line 2
                </label>
                <Controller
                  name="permanentAddressLine2"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder="Road Name, Area"
                    />
                  )}
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 mb-2">
                  PIN Code <span className="text-red-500">*</span>
                </label>
                <Controller
                  name="permanentPinCode"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      placeholder="6-digit PIN code"
                      maxLength={6}
                      error={errors.permanentPinCode?.message}
                      hint={permanentPinCode && permanentPinCode.length === 6 ? '✓ Details will auto-populate' : ''}
                      aria-describedby={errors.permanentPinCode ? 'permanentPinCode-error' : undefined}
                    />
                  )}
                />
                {errors.permanentPinCode && (
                  <p id="permanentPinCode-error" className="text-sm text-red-500 mt-1" role="alert">
                    {errors.permanentPinCode.message}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Controller
                  name="permanentCity"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      label="City"
                      readOnly
                      error={errors.permanentCity?.message}
                      aria-describedby={errors.permanentCity ? 'permanentCity-error' : undefined}
                    />
                  )}
                />
                <Controller
                  name="permanentState"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      label="State"
                      readOnly
                      error={errors.permanentState?.message}
                      aria-describedby={errors.permanentState ? 'permanentState-error' : undefined}
                    />
                  )}
                />
                <Controller
                  name="permanentPostOffice"
                  control={control}
                  render={({ field }) => (
                    <Input
                      {...field}
                      type="text"
                      label="Post Office"
                      readOnly
                      error={errors.permanentPostOffice?.message}
                      aria-describedby={errors.permanentPostOffice ? 'permanentPostOffice-error' : undefined}
                    />
                  )}
                />
              </div>
            </div>
          </div>
        )}
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
