import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { useAuth } from "../hook/useAuth";

export default function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { handleVerifyEmail } = useAuth();

  const [status, setStatus] = useState("verifying"); // verifying | success | error

  useEffect(() => {
    const token = searchParams.get("token");

    if (!token) {
      setStatus("error");
      return;
    }

    const verify = async () => {
      const success = await handleVerifyEmail(token);
      if (success) {
        setStatus("success");
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        setStatus("error");
      }
    };

    verify();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center">
      {status === "verifying" && <p>Verifying your email...</p>}
      {status === "success" && (
        <p className="text-green-500">
          Email verified successfully! Redirecting to login...
        </p>
      )}
      {status === "error" && (
        <p className="text-red-500">Invalid or expired verification link.</p>
      )}
    </div>
  );
}