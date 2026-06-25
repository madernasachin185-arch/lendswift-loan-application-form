'use client';

import React, { useCallback, useRef, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import SignatureCanvas from 'react-signature-canvas';
import { useLoanForm } from '@/context/LoanFormContext';
import { compressImage } from '@/utils/helpers';

interface Step7Props {
  onNext: () => void;
}

const REQUIRED_DOCUMENTS: Record<string, string> = {
  panCard: 'PAN Card',
  aadhaarFront: 'Aadhaar (Front)',
  aadhaarBack: 'Aadhaar (Back)',
  photo: 'Passport Size Photo',
  bankStatement: 'Bank Statement (Last 3 months)',
};

export default function Step7Documents({ onNext }: Step7Props) {
  const { state, updateField } = useLoanForm();
  const sigPad = useRef<SignatureCanvas>(null);
  const [uploadedFiles, setUploadedFiles] = useState<Record<string, File>>(state.uploadedDocuments);
  const [previewUrls, setPreviewUrls] = useState<Record<string, string>>({});

  const onDrop = useCallback(async (acceptedFiles: File[], docType: string) => {
    if (acceptedFiles.length > 0) {
      let fileToUse = acceptedFiles[0];

      // Compress image if it's an image file
      if (fileToUse.type.startsWith('image/')) {
        const compressedBlob = await compressImage(fileToUse);
        fileToUse = new File([compressedBlob], fileToUse.name, { type: compressedBlob.type });
      }

      setUploadedFiles(prev => ({ ...prev, [docType]: fileToUse }));

      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => ({ ...prev, [docType]: reader.result as string }));
      };
      reader.readAsDataURL(fileToUse);
    }
  }, []);

  const handleDeleteFile = (docType: string) => {
    setUploadedFiles(prev => {
      const updated = { ...prev };
      delete updated[docType];
      return updated;
    });
    setPreviewUrls(prev => {
      const updated = { ...prev };
      delete updated[docType];
      return updated;
    });
  };

  const handleClearSignature = () => {
    if (sigPad.current) {
      sigPad.current.clear();
      updateField('signature', null);
    }
  };

  const handleSaveSignature = () => {
    if (sigPad.current && !sigPad.current.isEmpty()) {
      const dataURL = sigPad.current.toDataURL('image/png');
      updateField('signature', dataURL);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (Object.keys(uploadedFiles).length === 0) {
      alert('Please upload at least one document');
      return;
    }

    if (!state.signature) {
      alert('Please provide your signature');
      return;
    }

    updateField('uploadedDocuments', uploadedFiles);
    onNext();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <span className="font-semibold">Document Upload:</span> All documents must be clear, legible, and not
          expired. Supported formats: PDF, JPG, JPEG, PNG. Maximum file size: 5MB (will be compressed to 2MB).
        </p>
      </div>

      {/* Document Upload Section */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Required Documents</h3>

        {Object.entries(REQUIRED_DOCUMENTS).map(([docKey, docLabel]) => (
          <DocumentUploadBox
            key={docKey}
            docKey={docKey}
            docLabel={docLabel}
            uploadedFile={uploadedFiles[docKey]}
            previewUrl={previewUrls[docKey]}
            onDrop={onDrop}
            onDelete={handleDeleteFile}
          />
        ))}
      </div>

      {/* Signature Section */}
      <div className="border-t pt-8">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Signature</h3>
        <p className="text-sm text-gray-600 mb-4">
          Please sign below. Your signature is required to complete the application.
        </p>

        <div className="border-2 border-gray-300 rounded-lg overflow-hidden bg-white">
          <SignatureCanvas
            ref={sigPad}
            canvasProps={{ className: 'w-full block', height: 200 }}
            backgroundColor="rgb(255, 255, 255)"
            penColor="rgb(0, 0, 0)"
          />
        </div>

        <div className="flex gap-4 mt-4">
          <button
            type="button"
            onClick={handleClearSignature}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-2 rounded-lg transition-colors"
            aria-label="Clear signature"
          >
            Clear Signature
          </button>
          <button
            type="button"
            onClick={handleSaveSignature}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white font-semibold py-2 rounded-lg transition-colors"
            aria-label="Save signature"
          >
            Save Signature
          </button>
        </div>

        {state.signature && (
          <p className="text-sm text-green-600 mt-2 flex items-center">
            ✓ Signature saved
          </p>
        )}
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition-colors"
        aria-label="Continue to review"
      >
        Continue to Review
      </button>
    </form>
  );
}

interface DocumentUploadBoxProps {
  docKey: string;
  docLabel: string;
  uploadedFile?: File;
  previewUrl?: string;
  onDrop: (files: File[], docType: string) => void;
  onDelete: (docType: string) => void;
}

function DocumentUploadBox({
  docKey,
  docLabel,
  uploadedFile,
  previewUrl,
  onDrop,
  onDelete,
}: DocumentUploadBoxProps) {
  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: files => onDrop(files, docKey),
    accept: {
      'application/pdf': ['.pdf'],
      'image/jpeg': ['.jpg', '.jpeg'],
      'image/png': ['.png'],
    },
    maxSize: 5 * 1024 * 1024, // 5MB
  });

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <div className="flex items-center justify-between mb-4">
        <label className="text-sm font-semibold text-gray-900">{docLabel}</label>
        {uploadedFile && (
          <span className="text-xs text-green-600 font-medium">✓ Uploaded</span>
        )}
      </div>

      {!uploadedFile ? (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-sm text-gray-700">
            Drag and drop your {docLabel.toLowerCase()}, or <span className="text-blue-600 font-medium">click to select</span>
          </p>
          <p className="text-xs text-gray-500 mt-2">Max size: 5MB (will be compressed to 2MB)</p>
        </div>
      ) : (
        <div className="space-y-4">
          {previewUrl && previewUrl.startsWith('data:image') && (
            <div className="flex justify-center">
              <img src={previewUrl} alt="Preview" className="max-h-40 rounded-lg border border-gray-300" />
            </div>
          )}

          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-900">{uploadedFile.name}</p>
              <p className="text-xs text-gray-500">
                {(uploadedFile.size / 1024).toFixed(2)} KB
              </p>
            </div>
            <button
              type="button"
              onClick={() => onDelete(docKey)}
              className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-lg transition-colors"
              aria-label={`Delete ${docLabel}`}
            >
              Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
