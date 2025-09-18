import { Router } from "express";
import multer from "multer";
import { uploadAadhaarOCR } from "../controllers/AadhaarOCRController";

const upload = multer({ dest: "uploads/" });
const router = Router();

router.post(
  "/",
  upload.fields([{ name: "front" }, { name: "back" }]),
  uploadAadhaarOCR
);

export default router;