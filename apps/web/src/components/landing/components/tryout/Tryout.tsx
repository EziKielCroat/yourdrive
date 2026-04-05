import React, { useState, useRef } from "react";
import { motion } from "framer-motion";
import {
  TryoutContainer,
  Question,
  QuestionDesc,
  TryoutBox,
  TryoutBoxInstructions,
  TryoutBoxTextBox,
  TryoutBoxLimits,
  ImageWrapper,
} from "./styles/tryout";
import Image from "../../../shared/image/Image";
import api from "../../../../lib/axios";
import { toast } from "../../../../services/toast.service";
import { copyToClipboard } from "../../../../lib/copyToClipboard";

const TRYOUT_UPLOAD_TIMEOUT_MS = 10 * 60 * 1000;

const Tryout: React.FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (file: File) => {
    if (file.size > 50 * 1024 * 1024) {
      toast.error("File size exceeds 50MB limit");
      return;
    }

    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await api.post("/files/anonymous-upload", formData, {
        timeout: TRYOUT_UPLOAD_TIMEOUT_MS,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data?.success) {
        const token = response.data.shareToken as string | undefined;
        const publicBase = (
          import.meta.env.VITE_PUBLIC_SITE_URL as string | undefined
        )?.replace(/\/$/, "");
        // Prefer canonical URL from build-time env (production / DuckDNS) over API Origin / window.location
        const shareUrl =
          publicBase && token
            ? `${publicBase}/shared/${token}`
            : response.data.shareUrl ||
              response.data.shortUrl ||
              `${window.location.origin}/shared/${token}`;

        const copied = await copyToClipboard(shareUrl);
        if (copied) {
          toast.success("File uploaded! Share link copied to clipboard.");
        } else {
          toast.success(`File uploaded! Share link: ${shareUrl}`);
        }
      } else {
        toast.error("Upload failed. Please try again.");
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      if (error?.code === "ECONNABORTED") {
        toast.error(
          "Upload timed out. Please try a smaller file or retry in a moment.",
        );
      } else if (error?.code === "ERR_NETWORK") {
        toast.error(
          "Network error while uploading. Check that API server is running and try again.",
        );
      } else {
        toast.error(error.response?.data?.error || "Upload failed. Please try again.");
      }
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  return (
    <>
      <TryoutContainer
        as={motion.div}
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 0.6 }}
      >
        <Question
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          Want to try?
        </Question>
        <QuestionDesc
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          We offer all of our users sharing without a account on our platform, so they
          <br className="desktop-break" />
          can see how easy it is to share with us.
        </QuestionDesc>
        <TryoutBox
          as={motion.div}
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          whileHover={{ scale: isUploading ? 1 : 1.02 }}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={handleClick}
          style={{
            cursor: isUploading ? "wait" : "pointer",
            opacity: isUploading ? 0.7 : 1,
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: "none" }}
            onChange={handleFileInputChange}
          />
          <ImageWrapper>
            <Image src="/SvgIcons/upload.svg" width={112} height={112} />
          </ImageWrapper>
          <TryoutBoxTextBox>
            <TryoutBoxInstructions>
              {isUploading
                ? "Uploading..."
                : isDragging
                  ? "Drop file here"
                  : "Drag-and-drop or click to upload a file"}
            </TryoutBoxInstructions>
            <TryoutBoxLimits>50 MB max*</TryoutBoxLimits>
          </TryoutBoxTextBox>
        </TryoutBox>
      </TryoutContainer>
    </>
  );
};

export default Tryout;
