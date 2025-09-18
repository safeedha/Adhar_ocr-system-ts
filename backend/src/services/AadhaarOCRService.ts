import { AadhaarOCRRepository } from "../repositories/AadhaarOCRRepository";
import { AadhaarOCRResult } from "../entities/AadhaarOCRResult"
import fs from "fs/promises";

export class AadhaarOCRService {
  constructor(private adharrepository:AadhaarOCRRepository )
  {

  }
  async processOCR(frontImageUrl: string,backImageUrl: string):Promise<AadhaarOCRResult>{
     const result=await this.adharrepository.create(frontImageUrl,backImageUrl)
       await fs.unlink(frontImageUrl).catch(() => {});
       await fs.unlink(backImageUrl).catch(() => {});
     return result
  }
}