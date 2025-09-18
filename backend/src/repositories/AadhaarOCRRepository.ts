import Tesseract from "tesseract.js";
import { AadhaarOCRResult } from "../entities/AadhaarOCRResult"
  import sharp from 'sharp';
  import path from "path";
export class AadhaarOCRRepository {
 async create(frontImageUrl: string,backImageUrl: string): Promise<AadhaarOCRResult> {
         
     
        const frontBuffer = await sharp(frontImageUrl) .grayscale() .normalize() .resize({ width: 1000 }) .threshold(150) .toBuffer();
         // Preprocess back image 
         const backBuffer = await sharp(backImageUrl) .grayscale() .normalize() .resize({ width: 1000 }) .threshold(150) .toBuffer();
          const frontResult = await Tesseract.recognize(frontBuffer, "eng"); 
          const backResult = await Tesseract.recognize(backBuffer, "eng"); 

      const frontText = frontResult.data.text;
      const backText = backResult.data.text;

   

        if (!frontText.includes("Government of India")) {
        return {
          status: false,
          message: "Invalid Aadhaar card. Please upload a valid Aadhaar front image.",
        };
      }

      if (!backText.includes("Address")) {
        return {
          status: false,
          message: "Invalid Aadhaar card. Please upload a valid Aadhaar back image.",
        };
      }

       const frontlines =frontText.split("\n").map(l => l.trim()).filter(Boolean);
         console.log(frontlines)
        let Name = this.extractName(frontlines);
        let dob = this.extractDOB(frontlines);
        let age = this.calculateAge(dob).toString();
        let gender = this.getGender(frontlines);
        let aadhaarNumber = this.extractAadhaarNumber(frontlines);  
        
         const backline = backText.split("\n").map(l => l.trim()).filter(Boolean);
         let address = this.getAddress(backline);
        let pincode = this.getPin(backline);

        const result: AadhaarOCRResult = {
        status: true,
        message: "OCR extraction successful",
        data:{Name,
        dob,
        age,
        gender,
        aadhaarNumber,
        address,
        pincode}
      };

      return result;

 }

   private extractName(lines: string[]): string {

  const govIndex = lines.findIndex(line =>
    line.toLowerCase().includes("government of india")
  );

  if (govIndex !== -1 && lines[govIndex + 1]) {
    return lines[govIndex + 1].trim();
  }

  return "Unknown"; 
}
  private extractDOB(text: string[]): string {
       const dobLine = text.find(l => l.toLowerCase().includes("dob"));
      if (dobLine) {
        const dobMatch = dobLine.match(/\d{2}\/\d{2}\/\d{4}/);
        if (dobMatch) {
          return dobMatch[0]
        }
     }
    return "no datebirth"    
}
  private calculateAge(dobString:string):number{
    const [day, month, year]: number[] = dobString.split("/").map(Number);
    const dob: Date = new Date(year, month - 1, day);

  const today: Date = new Date();
  let age: number = today.getFullYear() - dob.getFullYear();

  const hasBirthdayPassed: boolean =
    today.getMonth() > dob.getMonth() ||
    (today.getMonth() === dob.getMonth() && today.getDate() >= dob.getDate());

  if (!hasBirthdayPassed) {
    age--;
  }

  return age;
}
  private getGender(lines: string[]): "Male" | "Female" | "Unknown" {
  
  const genderLine = lines.find(
    (l) => l.toLowerCase().includes("male") || l.toLowerCase().includes("female")
  );

  if (genderLine) {
    if (genderLine.toLowerCase().includes("female")) {
      return "Female";
    } else if (genderLine.toLowerCase().includes("male")) {
      return "Male";
    }
  }

  return "Unknown";
}
 
private extractAadhaarNumber(lines: string[]): string {
  const aadhaarLine = lines.find((l) => /\d{4}\s\d{4}\s\d{4}/.test(l));

  if (aadhaarLine) {
    const aadhaarMatch = aadhaarLine.match(/\d{4}\s\d{4}\s\d{4}/);
    if (aadhaarMatch) {
      return aadhaarMatch[0]; // e.g. "1234 5678 9876"
    }
  }

  return "Unknown";
}

getAddress(backline: string[]): string {
  const start: number = backline.findIndex((l: string) =>
    /\b(S\/O|D\/O|C\/O|W\/O|H\/O|F\/O|M\/O|S\/0)\b/i.test(l)
  );

  const pinIndex: number = backline.findIndex((l: string) =>
    /\b\d{6}\b/.test(l)
  );

  const address: string = backline.slice(start, pinIndex).join(" ");
  return address;
}
getPin(backline: string[]): string {
  const pinIndex: number = backline.findIndex((l: string) =>
    /\b\d{6}\b/.test(l)
  );

  if (pinIndex === -1) {
    return ""; // No PIN found
  }

  const pinLineText: string = backline.slice(pinIndex, pinIndex + 1).toString();
  console.log("pinLineText", pinLineText);

  const firstIndex: number = pinLineText.search(/\d/);

  if (firstIndex === -1) {
    return ""; // No digit found
  }

  const pin: string = pinLineText.slice(firstIndex, firstIndex + 6); // 6-digit PIN
  return pin;
}

}