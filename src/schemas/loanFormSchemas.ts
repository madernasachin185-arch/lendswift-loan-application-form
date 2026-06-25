import { z } from 'zod';

// Validators
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
const GST_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;

export const step1Schema = z.object({
  loanType: z.enum(['Personal', 'Home', 'Business'], { message: 'Select a valid loan type' }),
  loanAmount: z.number({ required_error: 'Loan amount is required' })
    .min(50000, 'Minimum loan amount is ₹50,000')
    .max(10000000, 'Maximum loan amount is ₹1 Crore'),
  loanTenure: z.number({ required_error: 'Loan tenure is required' })
    .min(6, 'Minimum tenure is 6 months')
    .max(360, 'Maximum tenure is 30 years'),
  loanPurpose: z.string({ required_error: 'Loan purpose is required' }).min(1, 'Loan purpose is required'),
  referralCode: z.string().optional().default(''),
});

export const step2Schema = z.object({
  fullName: z.string().min(3, 'Name must be at least 3 characters'),
  dateOfBirth: z.string().min(1, 'Date of birth is required').refine(val => {
    const age = new Date().getFullYear() - new Date(val).getFullYear();
    return age >= 18 && age <= 75;
  }, 'Age must be between 18 and 75 years'),
  gender: z.enum(['Male', 'Female', 'Other'], { message: 'Select a valid gender' }),
  maritalStatus: z.enum(['Single', 'Married', 'Divorced', 'Widowed'], { message: 'Select a valid status' }),
  fatherName: z.string().min(3, 'Father name must be at least 3 characters'),
  motherName: z.string().min(3, 'Mother name must be at least 3 characters'),
  email: z.string().email('Invalid email address'),
  mobile: z.string().regex(MOBILE_REGEX, 'Mobile number must be 10 digits starting with 6-9'),
  alternateMobile: z.string().regex(MOBILE_REGEX, 'Alternate mobile must be 10 digits starting with 6-9'),
}).refine(
  data => data.mobile !== data.alternateMobile,
  {
    message: 'Alternate mobile must differ from primary mobile',
    path: ['alternateMobile'],
  }
);

export const step3Schema = z.object({
  panNumber: z.string().regex(PAN_REGEX, 'Invalid PAN format').toUpperCase().refine(val => {
    // 5th character validation
    const fifthChar = val[4];
    return fifthChar === 'P' || fifthChar === 'C' || fifthChar === 'F';
  }, '5th character must be P, C, or F'),
  aadhaarNumber: z.string().regex(/^\d{12}$/, 'Aadhaar must be 12 digits').refine(val => {
    // Verhoeff checksum validation is handled by separate function
    return val.length === 12;
  }, 'Invalid Aadhaar number'),
  aadhaarConsent: z.boolean().refine(val => val === true, 'Aadhaar consent is required'),
  voterId: z.string().optional().default(''),
  passport: z.string().optional().default(''),
});

export const step4Schema = z.object({
  currentAddressLine1: z.string().min(5, 'Address must be at least 5 characters'),
  currentAddressLine2: z.string().optional().default(''),
  currentPinCode: z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits'),
  currentCity: z.string().min(2, 'City is required'),
  currentState: z.string().min(2, 'State is required'),
  currentPostOffice: z.string().optional().default(''),
  residenceType: z.enum(['Owned', 'Rented', 'Family-owned'], { message: 'Select residence type' }),
  monthlyRent: z.string().transform(val => {
    const num = parseFloat(val.replace(/[^\d.-]/g, ''));
    return isNaN(num) ? 0 : num;
  }).pipe(z.number().nonnegative()),
  yearsAtCurrentAddress: z.string().transform(val => parseFloat(val)).pipe(
    z.number().min(0.5, 'Minimum 6 months').max(80, 'Invalid duration')
  ),
  sameAsPermanentAddress: z.boolean(),
  permanentAddressLine1: z.string().min(5, 'Permanent address is required'),
  permanentAddressLine2: z.string().optional().default(''),
  permanentPinCode: z.string().regex(/^\d{6}$/, 'PIN code must be 6 digits'),
  permanentCity: z.string().min(2, 'City is required'),
  permanentState: z.string().min(2, 'State is required'),
  permanentPostOffice: z.string().optional().default(''),
});

export const step5SalariedSchema = z.object({
  employmentType: z.literal('Salaried'),
  companyName: z.string().min(2, 'Company name is required'),
  designation: z.string().min(2, 'Designation is required'),
  monthlyNetSalary: z.string().transform(val => {
    const num = parseFloat(val.replace(/[^\d.-]/g, ''));
    return isNaN(num) ? 0 : num;
  }).pipe(z.number().min(15000, 'Monthly salary must be at least ₹15,000')),
  yearsOfExperience: z.string().transform(val => parseFloat(val)).pipe(
    z.number().min(0, 'Experience cannot be negative').max(80, 'Invalid experience')
  ),
});

export const step5SelfEmployedSchema = z.object({
  employmentType: z.literal('Self-Employed'),
  businessName: z.string().min(2, 'Business name is required'),
  businessType: z.string().min(2, 'Business type is required'),
  annualTurnover: z.string().transform(val => {
    const num = parseFloat(val.replace(/[^\d.-]/g, ''));
    return isNaN(num) ? 0 : num;
  }).pipe(z.number().min(100000, 'Minimum turnover is ₹1 lakh')),
  yearsInBusiness: z.string().transform(val => parseFloat(val)).pipe(
    z.number().min(2, 'Minimum 2 years in business required').max(80, 'Invalid duration')
  ),
  monthlyIncome: z.string().transform(val => {
    const num = parseFloat(val.replace(/[^\d.-]/g, ''));
    return isNaN(num) ? 0 : num;
  }).pipe(z.number().min(8000, 'Monthly income must be at least ₹8,000')),
  gstNumber: z.string().regex(GST_REGEX, 'Invalid GST number format'),
});

export const step6Schema = z.object({
  coApplicantName: z.string().min(3, 'Co-applicant name is required'),
  coApplicantRelationship: z.enum(['Spouse', 'Parent', 'Sibling', 'Other'], { message: 'Select relationship' }),
  coApplicantPAN: z.string().regex(PAN_REGEX, 'Invalid PAN format').toUpperCase(),
  coApplicantIncome: z.string().transform(val => {
    const num = parseFloat(val.replace(/[^\d.-]/g, ''));
    return isNaN(num) ? 0 : num;
  }).pipe(z.number().min(8000, 'Income must be at least ₹8,000')),
  coApplicantConsent: z.boolean().refine(val => val === true, 'Co-applicant consent is required'),
});

export const step7Schema = z.object({
  uploadedDocuments: z.record(z.any()).refine(
    obj => Object.keys(obj).length > 0,
    'At least one document must be uploaded'
  ),
  signature: z.string().min(100, 'Signature is required'),
});

export const step8Schema = z.object({
  consent1: z.boolean().refine(val => val === true, 'This consent is required'),
  consent2: z.boolean().refine(val => val === true, 'This consent is required'),
  consent3: z.boolean().refine(val => val === true, 'This consent is required'),
  consent4: z.boolean().refine(val => val === true, 'This consent is required'),
});

// Combined schema for step 5 (union of both employment types)
export const step5Schema = z.union([step5SalariedSchema, step5SelfEmployedSchema]);
