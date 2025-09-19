import { Request, Response } from "express";
import { AadhaarOCRRepository } from "../repositories/AadhaarOCRRepository";
import { AadhaarOCRService } from "../services/AadhaarOCRService";
import { MESSAGES } from "../constants/messages";  

const repository = new AadhaarOCRRepository();
const service = new AadhaarOCRService(repository);

export const uploadAadhaarOCR = async (req: Request, res: Response) => {
  try {
    if (!req.files || !("front" in req.files) || !("back" in req.files)) {
      return res.status(400).json({ message: MESSAGES.UPLOAD_REQUIRED });
    }

    const files = req.files as {
      [fieldname: string]: Express.Multer.File[];
    };

    const front = files.front[0].path;
    const back = files.back[0].path;

    const result = await service.processOCR(front, back);
    console.log(result);

    return res.status(200).json({
      message: MESSAGES.SUCCESS,
      data: result,
    });
  } catch (error) {
    console.error("Error in uploadAadhaarOCR:", error);
    return res.status(500).json({
      message: MESSAGES.SERVER_ERROR,
      error: (error as Error).message,
    });
  }
};
