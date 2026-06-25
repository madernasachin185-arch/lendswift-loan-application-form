import { z } from 'zod';

// Validators
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;

export const step1Schema = z.object({
  loanType: z.enum(['Personal', 'Home', 'Business'], { message: 'Please select a loan type' }),
  loanAmount: z.number({ required_error: 'Please enter loan amount' })
    .min(50000, 'Minimum ₹50,000')
    .max(10000000, 'Maximum ₹1 Crore'),
  loanTenure: z.number({ required_error: 'Please enter tenure' })
    .min(6, 'Minimum 6 months')
    .max(360, 'Maximum 360 months'),
  loanPurpose: z.string({ required_error: 'Please enter loan purpose' }).min(1, 'Please enter loan purpose'),
  referralCode: z.string().optional().default(''),
});

export const step2Schema = z.object({
  fullName: z.string().min(1, 'Full name is required').min(3, 'Minimum 3 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required').refine(val => {
    const age = new Date().getFullYear() - new Date(val).getFullYear();
    return age >= 18 && age <= 75;
  }, 'Must be 18+ years old'),
  gender: z.enum(['Male', 'Female', 'Other'], { message: 'Please select gender' }),
  maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed'], { message: 'Please select marital status' }),
  fatherName: z.string().min(1, "Father's name is required"),
  motherName: z.string().min(1, "Mother's name is required"),
  email: z.string().min(1, 'Email is required').email('Enter a valid email'),
  mobile: z.string().min(1, 'Mobile number is required').regex(MOBILE_REGEX, 'Enter valid 10-digit Indian mobile number'),
  alternateMobile: z.string().min(1, 'Alternate mobile is required').regex(MOBILE_REGEX, 'Enter valid 10-digit Indian mobile number'),
}).refine(
  data => data.mobile !== data.alternateMobile,
  {
    message: 'Must differ from primary mobile',
    path: ['alternateMobile'],
  }
);

export const step3Schema = z.object({
  panNumber: z.string().min(1, 'PAN is required').regex(PAN_REGEX, 'Invalid PAN format (e.g. ABCDE1234F)').toUpperCase().refine(val => {
    // 5th character validation
    const fifthChar = val[4];
    return fifthChar === 'P' || fifthChar === 'C' || fifthChar === 'F';
  }, '5th character must be P, C, or F'),
  aadhaarNumber: z.string().min(1, 'Aadhaar is required').regex(/^\d{12}$/, 'Invalid Aadhaar number').refine(val => {
    // Verhoeff checksum validation is handled by separate function
    return val.length === 12;
  }, 'Invalid Aadhaar number'),
  aadhaarConsent: z.boolean().refine(val => val === true, 'You must provide consent to proceed'),
  voterId: z.string().optional().default(''),
  passport: z.string().optional().default(''),
});

export const step4Schema = z.object({
  currentAddressLine1: z.string().min(1, 'Address line 1 is required'),
  currentAddressLine2: z.string().optional().default(''),
  currentPinCode: z.string().min(1, 'PIN code is required').regex(/^\d{6}$/, 'Invalid PIN code'),
  currentCity: z.string().min(1, 'City is required'),
  currentState: z.string().min(1, 'State is required'),
  currentPostOffice: z.string().optional().default(''),
  residenceType: z.enum(['Owned', 'Rented', 'Family-owned'], { message: 'Please select residence type' }),
  monthlyRent: z.string().transform(val => {
    const num = parseFloat(val.replace(/[^\d.-]/g, ''));
    return isNaN(num) ? 0 : num;
  }).pipe(z.number().nonnegative('Please enter monthly rent')),
  yearsAtCurrentAddress: z.string().min(1, 'Please enter years at current address').transform(val => parseFloat(val)).pipe(
    z.number().min(0.5, 'Minimum 6 months').max(80, 'Invalid duration')
  ),
  sameAsPermanentAddress: z.boolean(),
  permanentAddressLine1: z.string().min(1, 'Permanent address is required'),
  permanentAddressLine2: z.string().optional().default(''),
  permanentPinCode: z.string().min(1, 'PIN code is required').regex(/^\d{6}$/, 'Invalid PIN code'),
  permanentCity: z.string().min(1, 'City is required'),
  permanentState: z.string().min(1, 'State is required'),
  permanentPostOffice: z.string().optional().default(''),
});

export const step5SalariedSchema = z.object({
  employmentType: z.literal('Salaried'),
  companyName: z.string().min(1, 'Company name required'),
  designation: z.string().min(1, 'Designation required'),
  monthlyNetSalary: z.string().min(1, 'Salary required').transform(val => {
    const num = parseFloat(val.replace(/[^\d.-]/g, ''));
    return isNaN(num) ? 0 : num;
  }).pipe(z.number().min(0.01, 'Must be positive number')),
  yearsOfExperience: z.string().min(1, 'Experience required').transform(val => parseFloat(val)).pipe(
    z.number().min(0, 'Experience cannot be negative').max(80, 'Invalid experience')
  ),
});

export const step5SelfEmployedSchema = z.object({
  employmentType: z.literal('Self-Employed'),
  businessName: z.string().min(1, 'Business name required'),
  businessType: z.string().min(1, 'Business type required'),
  annualTurnover: z.string().min(1, 'Annual turnover required').transform(val => {
    const num = parseFloat(val.replace(/[^\d.-]/g, ''));
    return isNaN(num) ? 0 : num;
  }).pipe(z.number().min(0.01, 'Must be positive number')),
  yearsInBusiness: z.string().min(1, 'Years in business required').transform(val => parseFloat(val)).pipe(
    z.number().min(0, 'Cannot be negative').max(80, 'Invalid duration')
  ),
  monthlyIncome: z.string().min(1, 'Monthly income is required').transform(val => {
    const num = parseFloat(val.replace(/[^\d.-]/g, ''));
    return isNaN(num) ? 0 : num;
  }).pipe(z.number().min(0.01, 'Must be positive number')),
  gstNumber: z.string().min(1, 'GST number required').regex(GST_REGEX, 'Invalid GST format'),
});

export const step6Schema = z.object({
  coApplicantName: z.string().min(1, 'Co-applicant name is required'),
  coApplicantRelationship: z.enum(['Spouse', 'Parent', 'Sibling', 'Other'], { message: 'Please select relationship' }),
  coApplicantPAN: z.string().min(1, 'PAN is required').regex(PAN_REGEX, 'Invalid PAN format').toUpperCase(),
  coApplicantIncome: z.string().min(1, 'Income is required').transform(val => {
    const num = parseFloat(val.replace(/[^\d.-]/g, ''));
    return isNaN(num) ? 0 : num;
  }).pipe(z.number().min(0.01, 'Must be positive')),
  coApplicantConsent: z.boolean().refine(val => val === true, 'Co-applicant consent is required'),
  coApplicantSignature: z.string().min(1, 'Co-applicant signature is required'),
});

export const step7Schema = z.object({
  uploadedDocuments: z.record(z.any()).refine(
    obj => Object.keys(obj).length > 0,
    'This document is required'
  ),
  signature: z.string().min(100, 'Signature is required — please sign in the box above'),
});

export const step8Schema = z.object({
  consent1: z.boolean().refine(val => val === true, 'You must accept the terms and conditions'),
  consent2: z.boolean().refine(val => val === true, 'You must accept the privacy policy'),
  consent3: z.boolean().refine(val => val === true, 'You must accept the loan agreement'),
  consent4: z.boolean().refine(val => val === true, 'You must confirm the information is accurate'),
});

// Combined schema for step 5 (union of both employment types)
export const step5Schema = z.union([step5SalariedSchema, step5SelfEmployedSchema]);
