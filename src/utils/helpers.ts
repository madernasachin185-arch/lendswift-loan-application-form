// Format currency in Indian numbering system
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
}

// EMI Calculator
export function calculateEMI(principal: number, annualRate: number, tenureMonths: number) {
  const r = annualRate / 12 / 100;
  const n = tenureMonths;
  const emi = (principal * r * Math.pow(1 + r, n)) / (Math.pow(1 + r, n) - 1);
  const totalPayment = emi * n;
  const totalInterest = totalPayment - principal;
  const processingFee = Math.min(Math.max(principal * 0.01, 2000), 25000);

  return {
    emi: Math.round(emi),
    totalInterest: Math.round(totalInterest),
    totalPayment: Math.round(totalPayment),
    processingFee: Math.round(processingFee),
  };
}

// Loan interest rates by type
export const LOAN_RATES = {
  Personal: 10.5,
  Home: 8.5,
  Business: 14,
};

// XOR encryption/decryption
const ENCRYPTION_KEY = 'LENDSWIFT2024';

function xorEncrypt(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
  }
  return btoa(result); // Base64 encode
}

function xorDecrypt(encoded: string, key: string): string {
  try {
    const text = atob(encoded); // Base64 decode
    let result = '';
    for (let i = 0; i < text.length; i++) {
      result += String.fromCharCode(text.charCodeAt(i) ^ key.charCodeAt(i % key.length));
    }
    return result;
  } catch {
    return '';
  }
}

// Draft storage and retrieval
export interface DraftData {
  data: Record<string, any>;
  version: string;
  timestamp: number;
  step: number;
  loanType: string;
}

export function saveDraft(formState: Record<string, any>, loanType: string = 'pending') {
  const draft: DraftData = {
    data: formState,
    version: '1.0',
    timestamp: Date.now(),
    step: formState.currentStep || 0,
    loanType,
  };

  const encrypted = xorEncrypt(JSON.stringify(draft), ENCRYPTION_KEY);
  const key = `lendswift_draft_${loanType}`;

  try {
    localStorage.setItem(key, encrypted);
    return true;
  } catch {
    return false;
  }
}

export function loadDraft(loanType: string = 'pending'): DraftData | null {
  const key = `lendswift_draft_${loanType}`;

  try {
    const encrypted = localStorage.getItem(key);
    if (!encrypted) return null;

    const decrypted = xorDecrypt(encrypted, ENCRYPTION_KEY);
    const draft = JSON.parse(decrypted) as DraftData;

    // Check TTL: 72 hours
    const AGE_LIMIT = 72 * 60 * 60 * 1000;
    if (Date.now() - draft.timestamp > AGE_LIMIT) {
      localStorage.removeItem(key);
      return null;
    }

    return draft;
  } catch {
    return null;
  }
}

export function deleteDraft(loanType: string = 'pending') {
  const key = `lendswift_draft_${loanType}`;
  localStorage.removeItem(key);
}

// Image compression
export async function compressImage(file: File): Promise<Blob> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target?.result as string;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        // Max width 1200px
        if (width > 1200) {
          height = (height * 1200) / width;
          width = 1200;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx?.drawImage(img, 0, 0, width, height);

        // Reduce quality until size < 2MB
        let quality = 0.8;
        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size < 2 * 1024 * 1024 || quality <= 0.3) {
              resolve(blob || file);
            } else {
              quality -= 0.1;
              canvas.toBlob((retryBlob) => {
                resolve(retryBlob || file);
              }, 'image/jpeg', quality);
            }
          },
          'image/jpeg',
          quality
        );
      };
    };
  });
}

// PIN code data lookup
export const PIN_DATA: Record<string, { city: string; state: string; postOffice: string }> = {
  '110001': { city: 'New Delhi', state: 'Delhi', postOffice: 'Connaught Place HO' },
  '400001': { city: 'Mumbai', state: 'Maharashtra', postOffice: 'Mumbai GPO' },
  '560001': { city: 'Bengaluru', state: 'Karnataka', postOffice: 'Bengaluru GPO' },
  '600001': { city: 'Chennai', state: 'Tamil Nadu', postOffice: 'Chennai GPO' },
  '700001': { city: 'Kolkata', state: 'West Bengal', postOffice: 'Kolkata GPO' },
  '500001': { city: 'Hyderabad', state: 'Telangana', postOffice: 'Hyderabad GPO' },
  '380001': { city: 'Ahmedabad', state: 'Gujarat', postOffice: 'Ahmedabad GPO' },
  '302001': { city: 'Jaipur', state: 'Rajasthan', postOffice: 'Jaipur GPO' },
  '226001': { city: 'Lucknow', state: 'Uttar Pradesh', postOffice: 'Lucknow GPO' },
  '800001': { city: 'Patna', state: 'Bihar', postOffice: 'Patna GPO' },
  '751001': { city: 'Bhubaneswar', state: 'Odisha', postOffice: 'Bhubaneswar GPO' },
  '411001': { city: 'Pune', state: 'Maharashtra', postOffice: 'Pune GPO' },
  '440001': { city: 'Nagpur', state: 'Maharashtra', postOffice: 'Nagpur GPO' },
  '482001': { city: 'Jabalpur', state: 'Madhya Pradesh', postOffice: 'Jabalpur GPO' },
  '462001': { city: 'Bhopal', state: 'Madhya Pradesh', postOffice: 'Bhopal GPO' },
  '160017': { city: 'Chandigarh', state: 'Chandigarh', postOffice: 'Chandigarh Sector 17' },
  '682001': { city: 'Kochi', state: 'Kerala', postOffice: 'Ernakulam GPO' },
  '695001': { city: 'Thiruvananthapuram', state: 'Kerala', postOffice: 'Thiruvananthapuram GPO' },
  '530001': { city: 'Visakhapatnam', state: 'Andhra Pradesh', postOffice: 'Visakhapatnam GPO' },
  '522001': { city: 'Guntur', state: 'Andhra Pradesh', postOffice: 'Guntur GPO' },
  '452001': { city: 'Indore', state: 'Madhya Pradesh', postOffice: 'Indore GPO' },
  '831001': { city: 'Jamshedpur', state: 'Jharkhand', postOffice: 'Jamshedpur GPO' },
  '834001': { city: 'Ranchi', state: 'Jharkhand', postOffice: 'Ranchi GPO' },
  '248001': { city: 'Dehradun', state: 'Uttarakhand', postOffice: 'Dehradun GPO' },
  '781001': { city: 'Guwahati', state: 'Assam', postOffice: 'Guwahati GPO' },
  '190001': { city: 'Srinagar', state: 'Jammu & Kashmir', postOffice: 'Srinagar GPO' },
  '180001': { city: 'Jammu', state: 'Jammu & Kashmir', postOffice: 'Jammu GPO' },
  '796001': { city: 'Aizawl', state: 'Mizoram', postOffice: 'Aizawl GPO' },
  '793001': { city: 'Shillong', state: 'Meghalaya', postOffice: 'Shillong GPO' },
  '201301': { city: 'Noida', state: 'Uttar Pradesh', postOffice: 'Noida Sector 18' },
  '122001': { city: 'Gurugram', state: 'Haryana', postOffice: 'Gurugram GPO' },
  '131001': { city: 'Sonipat', state: 'Haryana', postOffice: 'Sonipat GPO' },
  '144001': { city: 'Jalandhar', state: 'Punjab', postOffice: 'Jalandhar GPO' },
  '141001': { city: 'Ludhiana', state: 'Punjab', postOffice: 'Ludhiana GPO' },
};

export function lookupPinCode(pinCode: string) {
  return PIN_DATA[pinCode] || null;
}

// Verhoeff checksum algorithm for Aadhaar validation
const d = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 2, 3, 4, 0, 6, 7, 8, 9, 5],
  [2, 3, 4, 0, 1, 7, 8, 9, 5, 6],
  [3, 4, 0, 1, 2, 8, 9, 5, 6, 7],
  [4, 0, 1, 2, 3, 9, 5, 6, 7, 8],
  [5, 9, 8, 7, 6, 0, 4, 3, 2, 1],
  [6, 5, 9, 8, 7, 1, 0, 4, 3, 2],
  [7, 6, 5, 9, 8, 2, 1, 0, 4, 3],
  [8, 7, 6, 5, 9, 3, 2, 1, 0, 4],
  [9, 8, 7, 6, 5, 4, 3, 2, 1, 0],
];

const p = [
  [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],
  [1, 5, 7, 6, 2, 8, 3, 0, 9, 4],
  [5, 8, 0, 3, 7, 9, 6, 1, 4, 2],
  [8, 9, 1, 6, 0, 4, 3, 5, 2, 7],
  [9, 4, 5, 3, 1, 2, 6, 8, 7, 0],
  [4, 2, 8, 6, 5, 7, 3, 9, 0, 1],
  [2, 7, 9, 3, 8, 0, 6, 4, 1, 5],
  [7, 0, 4, 6, 9, 1, 3, 2, 5, 8],
];

export function isValidAadhaar(num: string): boolean {
  if (!/^\d{12}$/.test(num)) return false;
  let c = 0;
  const arr = num.split('').reverse().map(Number);
  arr.forEach((n, i) => {
    c = d[c][p[i % 8][n]];
  });
  return c === 0;
}
