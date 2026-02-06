// Update the useEffect to handle already verified case
useEffect(() => {
  const verifyEmail = async () => {
    const token = search?.token;

    if (!token) {
      setStatus("error");
      setMessage("Invalid verification link");
      return;
    }

    try {
      const response = await api.get(`/auth/verify-email?token=${token}`);
      
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
      setStatus("error");
      setMessage(error.response?.data?.error || "Verification failed");
    }
  };

  verifyEmail();
}, [search?.token, navigate]);

// Update the success UI to show different messages for already verified
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
        🎓 +50GB Educational Bonus Added!
      </div>
    )}
    <p style={{ color: "#999", fontSize: "14px", marginTop: "24px" }}>
      {message.toLowerCase().includes("already") 
        ? "Redirecting to login in 5 seconds..." 
        : "Redirecting to login..."}
    </p>
  </>
)}