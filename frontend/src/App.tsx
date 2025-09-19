import React, { useState, useRef } from "react";
import type { ChangeEvent, FormEvent } from "react";
import axios from "axios";
import { FiUploadCloud } from "react-icons/fi";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./App.css";
import type { OcrResult } from "./interfaces";
import ClipLoader from "react-spinners/ClipLoader";

const UploadForm: React.FC = () => {
  const [front, setFront] = useState<File | null>(null);
  const [back, setBack] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState<string | null>(null);
  const [backPreview, setBackPreview] = useState<string | null>(null);
  const [result, setResult] = useState<OcrResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Refs for file inputs to reset them properly
  const frontInputRef = useRef<HTMLInputElement | null>(null);
  const backInputRef = useRef<HTMLInputElement | null>(null);

  const handleFrontUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFront(file);
      setFrontPreview(URL.createObjectURL(file));
    }
  };

  const handleBackUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setBack(file);
      setBackPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!front || !back) {
      toast.warning("⚠️ Please upload both Aadhaar front and back images!");
      return;
    }

    const formData = new FormData();
    formData.append("front", front);
    formData.append("back", back);

    setLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/ocr`,
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      console.log(res);
      if (res.data.status === false) {
        toast.error(res.data.message);
      } else {
        toast.success("✅ OCR Processed Successfully!");
        console.log(res.data.data.data);
        setResult(res.data.data.data ?? null);
      }
    } catch (err) {
      console.log("this", import.meta.env.VITE_API_URL);
      console.error(err);
      toast.error("❌ OCR Failed. Please try again.");
    }
    setLoading(false);
  };

  // Reset everything
  const handleReset = () => {
    setFront(null);
    setBack(null);
    setFrontPreview(null);
    setBackPreview(null);
    setResult(null);
    setLoading(false);

    // Reset file inputs
    if (frontInputRef.current) frontInputRef.current.value = "";
    if (backInputRef.current) backInputRef.current.value = "";
  };

  return (
    <>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
      />

      <h2 className="title">Aadhaar OCR</h2>
      <div className="container">
        <form onSubmit={handleSubmit} className="form">
          <label className="upload-box">
            <p>Aadhaar Front</p>
            <div className="upload-content">
              {frontPreview ? (
                <img
                  src={frontPreview}
                  alt="Front Preview"
                  className="preview-img"
                />
              ) : (
                <>
                  <FiUploadCloud size={40} color="#6c63ff" />
                  <span>Click here to Upload/Capture</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                hidden
                ref={frontInputRef}
                onChange={handleFrontUpload}
              />
            </div>
          </label>

          <label className="upload-box">
            <p>Aadhaar Back</p>
            <div className="upload-content">
              {backPreview ? (
                <img
                  src={backPreview}
                  alt="Back Preview"
                  className="preview-img"
                />
              ) : (
                <>
                  <FiUploadCloud size={40} color="#6c63ff" />
                  <span>Click here to Upload/Capture</span>
                </>
              )}
              <input
                type="file"
                accept="image/*"
                hidden
                ref={backInputRef}
                onChange={handleBackUpload}
              />
            </div>
          </label>

          <div className="form-actions">
            <button type="submit" className="submit-btn" disabled={loading}>
              {loading ? "Processing..." : "PARSE AADHAAR"}
            </button>
             {(front || back || result) && (
              <button
                type="button"
                className="reset-btn"
                onClick={handleReset}
                disabled={loading}
              >
                RESET
              </button>
            )}
                      
          </div>
        </form>

        <div className="result-box">
          {!loading && !result && (
            <p className="placeholder-text">
              Results will be displayed here after submitting.
            </p>
          )}
          {loading && (
            <div className="loader">
              <ClipLoader color="#36d7b7" size={50} />
            </div>
          )}

          {result && (
            <div className="parsed-details">
              <h3>Parsed Details</h3>
              <div className="details-grid">
                <div className="detail-card">
                  <p>Name</p>
                  <span>{result.Name || "N/A"}</span>
                </div>
                <div className="detail-card">
                  <p>Aadhaar Number</p>
                  <span>{result.aadhaarNumber || "N/A"}</span>
                </div>
                <div className="detail-card">
                  <p>Date of Birth</p>
                  <span>{result.dob || "N/A"}</span>
                </div>
                <div className="detail-card">
                  <p>Gender</p>
                  <span>{result.gender || "N/A"}</span>
                </div>
                <div className="detail-card">
                  <p>Pincode</p>
                  <span>{result.pincode || "N/A"}</span>
                </div>
                <div className="detail-card">
                  <p>Age</p>
                  <span>{result.age || "N/A"}</span>
                </div>
                <div className="detail-card full-width">
                  <p>Address</p>
                  <span>{result.address || "N/A"}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default UploadForm;
