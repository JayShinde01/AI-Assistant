/**
 * components/FileUploadButton.jsx
 * --------------------------------
 * A button that opens a file picker and uploads the selected file to the server.
 *
 * After a successful upload, it calls onUploadComplete with the file URL and MIME type.
 * Shows a progress indicator while uploading.
 *
 * Props:
 *   onUploadComplete {Function} - Called with { url, mime_type } after upload
 *   disabled         {boolean}  - Disable the button
 */

import React, { useRef, useState } from "react";
import { Button, Progress, Tooltip, message } from "antd";
import { PaperClipOutlined, LoadingOutlined } from "@ant-design/icons";

import { uploadFile } from "../services/chat_services";
import { MAX_FILE_SIZE_BYTES, ACCEPTED_FILE_TYPES } from "../constants/config";

function FileUploadButton({ onUploadComplete, disabled = false }) {
  // Hidden file input ref — we trigger it programmatically when the button is clicked
  const fileInputRef = useRef(null);

  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  /**
   * Handle file selection from the file picker.
   * Validates size, uploads, and calls onUploadComplete.
   */
  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;

    // ── Client-side size validation ────────────────────────────────────────
    if (file.size > MAX_FILE_SIZE_BYTES) {
      message.error(`File too large. Maximum size is ${MAX_FILE_SIZE_BYTES / 1024 / 1024} MB.`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      // Upload the file and track progress
      const result = await uploadFile(file, (percent) => setProgress(percent));

      message.success(`"${file.name}" uploaded successfully`);

      // Notify the parent component with the file URL and type
      onUploadComplete({
        url: result.url,
        mime_type: result.mime_type,
        original_name: result.original_name,
      });
    } catch (err) {
      const errorMsg = err.response?.data?.detail || "Upload failed. Please try again.";
      message.error(errorMsg);
    } finally {
      setUploading(false);
      setProgress(0);
      // Reset the input so the same file can be re-selected if needed
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILE_TYPES}
        style={{ display: "none" }}
        onChange={handleFileChange}
        aria-label="Upload file or image"
      />

      {/* Visible button that triggers the hidden input */}
      <Tooltip title="Attach file or image (max 5 MB)">
        <Button
          icon={uploading ? <LoadingOutlined /> : <PaperClipOutlined />}
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || uploading}
          type="text"
          aria-label="Attach file"
        />
      </Tooltip>

      {/* Upload progress bar — only shown while uploading */}
      {uploading && (
        <Progress
          percent={progress}
          size="small"
          style={{ width: 60, marginTop: 2 }}
          showInfo={false}
        />
      )}
    </div>
  );
}

export default FileUploadButton;
