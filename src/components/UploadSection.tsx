import React, { useCallback, useRef, useState } from "react";
import { UploadCloud, File, X, AlertCircle } from "lucide-react";

interface UploadSectionProps {
  onProcess: (file: File) => void;
  isProcessing: boolean;
}

export default function UploadSection({ onProcess, isProcessing }: UploadSectionProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    validateAndSetFile(file);
  };

  const validateAndSetFile = (file: File | undefined) => {
    setError(null);
    if (!file) return;

    const validTypes = ["application/pdf", "image/jpeg", "image/jpg", "image/png"];
    if (!validTypes.includes(file.type)) {
      setError("Please upload a PDF, JPG, JPEG, or PNG file.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError("File size exceeds 10MB limit.");
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    validateAndSetFile(file);
  }, []);

  return (
    <div className="w-full max-w-2xl mx-auto bg-slate-900 rounded-xl shadow-sm border border-slate-800 p-8">
      <div className="text-center mb-6">
        <h2 className="text-2xl font-bold text-white">Upload an image or PDF of your bank statement to get a clean, structured view</h2>
        <p className="text-slate-400 mt-2">PDF, JPG, JPEG, PNG</p>
      </div>

      {!selectedFile ? (
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-colors ${
            isDragging ? "border-blue-500 bg-blue-900/20" : "border-slate-700 hover:border-blue-500 hover:bg-slate-800"
          }`}
        >
          <input
            type="file"
            ref={fileInputRef}
            className="hidden"
            accept=".pdf,.jpg,.jpeg,.png"
            onChange={handleFileChange}
          />
          <div className="mx-auto w-16 h-16 bg-blue-900/50 rounded-full flex items-center justify-center mb-4 border border-blue-800/50">
            <UploadCloud className="w-8 h-8 text-blue-400" />
          </div>
          <p className="text-slate-200 font-medium text-lg">Drag & Drop your file here</p>
          <p className="text-slate-400 mt-1">or click to browse</p>
        </div>
      ) : (
        <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 flex flex-col items-center justify-center">
          <div className="flex items-center space-x-4 w-full">
            <div className="p-3 bg-blue-900/50 border border-blue-800/50 rounded-lg">
              <File className="w-8 h-8 text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-slate-200 font-medium truncate" title={selectedFile.name}>
                {selectedFile.name}
              </p>
              <p className="text-slate-400 text-sm">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
            </div>
            {!isProcessing && (
              <button
                onClick={() => setSelectedFile(null)}
                className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-900/30 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>

          {isProcessing ? (
            <div className="mt-6 w-full text-center flex flex-col items-center space-y-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-blue-400 font-medium">Analyzing your statement...</p>
            </div>
          ) : (
            <button
              onClick={() => onProcess(selectedFile)}
              className="mt-6 w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors shadow-sm"
            >
              Process Statement
            </button>
          )}
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-900/30 border border-red-800 text-red-400 rounded-lg flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
          <p>{error}</p>
        </div>
      )}

      <p className="text-xs text-slate-400 text-center mt-6">
        Your financial documents are sensitive. We process them securely and do not permanently store them unless you choose to.
      </p>
    </div>
  );
}
