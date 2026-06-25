'use client';

import React from 'react';
import jsPDF from 'jspdf';
import { useLoanForm } from '@/context/LoanFormContext';
import { calculateEMI, formatINR, LOAN_RATES } from '@/utils/helpers';

interface SuccessPageProps {
  onStartNew: () => void;
}

export default function SuccessPage({ onStartNew }: SuccessPageProps) {
  const { state } = useLoanForm();

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    let yPosition = 20;

    // Title
    doc.setFontSize(20);
    doc.setTextColor(31, 78, 121); // Primary blue
    doc.text('LendSwift Loan Application', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 15;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('Application Confirmation', pageWidth / 2, yPosition, { align: 'center' });

    yPosition += 20;

    // Application ID
    doc.setFontSize(10);
    doc.setFont(undefined, 'bold');
    doc.text('Application ID:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(39, 174, 96); // Accent green
    doc.text(state.applicationId || 'N/A', 60, yPosition);

    yPosition += 10;
    doc.setTextColor(0, 0, 0);
    const submittedDate = new Date().toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
    doc.setFont(undefined, 'bold');
    doc.text('Submitted Date:', 20, yPosition);
    doc.setFont(undefined, 'normal');
    doc.text(submittedDate, 60, yPosition);

    yPosition += 15;

    // Loan Summary
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('Loan Summary', 20, yPosition);

    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    const loanAmount = parseFloat(state.loanAmount) || 0;
    const loanTenure = parseInt(state.loanTenure) || 0;
    const loanType = state.loanType as keyof typeof LOAN_RATES;
    const rate = LOAN_RATES[loanType] || 0;
    const emiDetails = calculateEMI(loanAmount, rate, loanTenure);

    const loanDetails = [
      ['Loan Type:', state.loanType],
      ['Loan Amount:', formatINR(loanAmount)],
      ['Tenure:', `${loanTenure} Months`],
      ['Interest Rate:', `${rate}% p.a.`],
      ['Monthly EMI:', formatINR(emiDetails.emi)],
      ['Processing Fee:', formatINR(emiDetails.processingFee)],
      ['Total Interest:', formatINR(emiDetails.totalInterest)],
      ['Total Repayment:', formatINR(emiDetails.totalPayment + emiDetails.processingFee)],
    ];

    loanDetails.forEach(([label, value]) => {
      doc.text(label, 30, yPosition);
      doc.text(value, 100, yPosition);
      yPosition += 7;
    });

    yPosition += 10;

    // Applicant Info
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('Applicant Information', 20, yPosition);

    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    const applicantDetails = [
      ['Name:', state.fullName],
      ['Email:', state.email],
      ['Mobile:', state.mobile],
      ['PAN:', state.panNumber],
      ['City:', state.currentCity],
    ];

    applicantDetails.forEach(([label, value]) => {
      doc.text(label, 30, yPosition);
      doc.text(value || 'N/A', 100, yPosition);
      yPosition += 7;
    });

    yPosition += 10;

    // Next Steps
    doc.setFont(undefined, 'bold');
    doc.setFontSize(11);
    doc.text('Next Steps', 20, yPosition);

    yPosition += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');

    const nextSteps = [
      '1. Our team will verify your documents within 24-48 hours.',
      '2. You will receive updates via email and SMS.',
      '3. Upon approval, loan amount will be disbursed to your bank account.',
      '4. Repayment EMI will be automatically debited on the scheduled date.',
    ];

    nextSteps.forEach(step => {
      doc.text(step, 20, yPosition);
      yPosition += 7;
    });

    yPosition += 10;

    // Footer
    doc.setFontSize(9);
    doc.setTextColor(128, 128, 128);
    doc.text('This is an automated confirmation. Please keep this for your records.', pageWidth / 2, pageHeight - 20, {
      align: 'center',
    });
    doc.text('For queries, contact: support@lendswift.com | 1800-LENDSWIFT', pageWidth / 2, pageHeight - 15, {
      align: 'center',
    });

    // Save PDF
    doc.save(`LendSwift_Application_${state.applicationId}.pdf`);
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-white rounded-lg shadow-lg border border-green-200 p-8 md:p-12 text-center">
        {/* Success Icon */}
        <div className="mb-8">
          <div className="w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center">
            <svg
              className="w-10 h-10 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Application Submitted!</h1>
        <p className="text-lg text-gray-600 mb-8">
          Your loan application has been successfully submitted to LendSwift.
        </p>

        {/* Application ID */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <p className="text-sm text-gray-600 mb-2">Your Application ID</p>
          <p className="text-2xl font-bold text-blue-600 font-mono">{state.applicationId}</p>
          <p className="text-xs text-gray-600 mt-2">Save this for your reference</p>
        </div>

        {/* What's Next */}
        <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
          <h3 className="font-semibold text-gray-900 mb-4">What&apos;s Next?</h3>
          <ol className="space-y-3">
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                1
              </span>
              <span className="text-sm text-gray-700">
                Our team will verify your documents within <strong>24-48 hours</strong>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                2
              </span>
              <span className="text-sm text-gray-700">
                You will receive updates via <strong>email and SMS</strong>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                3
              </span>
              <span className="text-sm text-gray-700">
                Upon approval, loan amount will be <strong>disbursed to your bank account</strong>
              </span>
            </li>
            <li className="flex gap-3">
              <span className="flex-shrink-0 w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
                4
              </span>
              <span className="text-sm text-gray-700">
                Start repayment with automatic EMI debit on <strong>scheduled dates</strong>
              </span>
            </li>
          </ol>
        </div>

        {/* Contact Info */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-8">
          <p className="text-sm text-gray-700">
            <span className="font-semibold">Need help?</span> Contact our support team at{' '}
            <span className="font-mono text-blue-600">support@lendswift.com</span> or call{' '}
            <span className="font-mono text-blue-600">1800-LENDSWIFT</span>
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3 mb-8">
          <button
            onClick={handleDownloadPDF}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-3 rounded-lg transition-colors"
            aria-label="Download application PDF"
          >
            Download Application PDF
          </button>
          <button
            onClick={onStartNew}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
            aria-label="Start a new application"
          >
            Start New Application
          </button>
        </div>

        {/* Footer Message */}
        <p className="text-xs text-gray-600">
          A confirmation email with your application details has been sent to{' '}
          <span className="font-semibold">{state.email}</span>
        </p>
      </div>
    </div>
  );
}
