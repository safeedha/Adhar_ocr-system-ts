export interface OcrResult {
  Name?: string;
  aadhaarNumber?: string;
  dob?: string;
  gender?: string;
  pincode?: string;
  age?: string;
  address?: string;
}

export interface OcrApiResponse {
  message: {
    status: boolean;
    message: string;
    data?: OcrResult;
  };
}