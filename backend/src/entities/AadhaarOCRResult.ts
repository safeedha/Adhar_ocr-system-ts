export interface AadhaarOCRResult{
      status:boolean;
      message:string;
      data?:OcrResult
}


export interface OcrResult {
  Name?: string;
  aadhaarNumber?: string;
  dob?: string;
  gender?: string;
  pincode?: string;
  age?: string;
  address?: string;
}