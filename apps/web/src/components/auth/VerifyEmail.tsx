import { PLANS } from "@yourdrive/plans";
import React, { useEffect, useState, useRef } from "react";
import { useSearch, useNavigate } from "@tanstack/react-router";
import api from "../../lib/axios";

export const VerifyEmail: React.FC = () => {
  const search = useSearch({ from: "/verify-email" }) as any;
  const navigate = useNavigate();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const [bonusGranted, setBonusGranted] = useState(false);
  
  // Use a ref to track if verification has already run
  const hasVerified = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      const token = search?.token;

      if (!token) {
        setStatus("error");
        setMessage("Invalid verification link");
        return;
      }

      // Prevent duplicate verification
      if (hasVerified.current) {
        console.log("⚠️ Verification already attempted, skipping...");
        return;
      }
      
      hasVerified.current = true;

      try {
        console.log("🔍 Starting email verification...");
        const response = await api.get(`/auth/verify-email?token=${token}`);
        
        console.log("✅ Verification response:", response.data);
        
        if (response.data.success) {
          setStatus("success");
          setMessage(response.data.message);
          setBonusGranted(response.data.bonusGranted);
          
          // Check if already verified
          if (response.data.alreadyVerified) {
            // Don't redirect immediately for already verified
            setTimeout(() => {
              navigate({ to: "/login" });
            }, 5000);
          } else {
            // New verification - redirect after 3 seconds
            setTimeout(() => {
              navigate({ to: "/login" });
            }, 3000);
          }
        }
      } catch (error: any) {
        console.error("❌ Verification error:", error);
        setStatus("error");
        setMessage(error.response?.data?.error || "Verification failed");
      }
    };

    verifyEmail();
  }, [search?.token, navigate]);

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
      padding: "20px"
    }}>
      <div style={{
        background: "white",
        borderRadius: "16px",
        padding: "48px",
        maxWidth: "500px",
        width: "100%",
        boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        textAlign: "center"
      }}>
        {status === "loading" && (
          <>
            <div style={{ fontSize: "48px", marginBottom: "24px" }}>⏳</div>
            <h2 style={{ color: "#1a1a1a", marginBottom: "16px" }}>Verifying Your Email...</h2>
            <p style={{ color: "#666" }}>Please wait while we verify your account.</p>
          </>
        )}

        {status === "success" && (
          <>
            <div style={{ fontSize: "64px", marginBottom: "24px" }}>
              {bonusGranted ? "🎉" : "✅"}
            </div>
            <h2 style={{ color: "#10b981", marginBottom: "16px" }}>
              {bonusGranted ? "Email Verified + Bonus Unlocked!" : "Email Verified!"}
            </h2>
            <p style={{ color: "#666", fontSize: "16px", lineHeight: "1.6" }}>
              {message}
            </p>
            {bonusGranted && (
              <div style={{
                background: "linear-gradient(135deg, #1F9AFE, #0d8af2)",
                color: "white",
                padding: "16px 24px",
                borderRadius: "12px",
                margin: "24px 0",
                fontWeight: 600
              }}>
                🎓 +{PLANS.educational.bonusGb}GB Educational Bonus Added!
              </div>
            )}
            <p style={{ color: "#999", fontSize: "14px", marginTop: "24px" }}>
              {message.toLowerCase().includes("already") 
                ? "Redirecting to login in 5 seconds..." 
                : "Redirecting to login..."}
            </p>
          </>
        )}

        {status === "error" && (
          <>
            <div style={{ fontSize: "64px", marginBottom: "24px" }}>❌</div>
            <h2 style={{ color: "#ef4444", marginBottom: "16px" }}>Verification Failed</h2>
            <p style={{ color: "#666", marginBottom: "32px" }}>{message}</p>
            <button
              onClick={() => navigate({ to: "/login" })}
              style={{
                background: "#1F9AFE",
                color: "white",
                border: "none",
                padding: "12px 32px",
                borderRadius: "8px",
                fontSize: "16px",
                fontWeight: 600,
                cursor: "pointer"
              }}
            >
              Go to Login
            </button>
          </>
        )}
      </div>
    </div>
  );
};