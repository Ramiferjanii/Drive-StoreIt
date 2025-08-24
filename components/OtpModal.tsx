"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { verifySecret } from "@/lib/actions/user.actions";
import Image from "next/image";

interface OtpModalProps {
  email: string;
  accountId: string;
}

const OtpModal = ({ email, accountId }: OtpModalProps) => {
  const [otp, setOtp] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      setErrorMessage("Please enter a 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setErrorMessage("");

    try {
      const result = await verifySecret({
        accountId,
        password: otp,
      });

      if (result?.sessionId) {
        // Successfully verified, redirect to dashboard
        router.push("/");
      } else {
        setErrorMessage("Invalid OTP. Please try again.");
      }
    } catch (error) {
      setErrorMessage("Failed to verify OTP. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    // This would typically call a resend OTP function
    setErrorMessage("OTP resent to your email");
  };

  return (
    <Dialog open={true}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Verify Your Email</DialogTitle>
          <DialogDescription>
            We've sent a 6-digit verification code to{" "}
            <span className="font-medium">{email}</span>
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col items-center space-y-6 py-4">
          <InputOTP
            value={otp}
            onChange={setOtp}
            maxLength={6}
          >
            <InputOTPGroup className="gap-2">
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>

          {errorMessage && (
            <p className="text-sm text-red-500 text-center">{errorMessage}</p>
          )}

          <div className="flex flex-col space-y-3 w-full">
            <Button
              onClick={handleVerifyOTP}
              disabled={isLoading || otp.length !== 6}
              className="w-full"
            >
              {isLoading ? (
                <>
                  <Image
                    src="/assets/icons/loader.svg"
                    alt="loader"
                    width={20}
                    height={20}
                    className="mr-2 animate-spin"
                  />
                  Verifying...
                </>
              ) : (
                "Verify OTP"
              )}
            </Button>

            <Button
              variant="outline"
              onClick={handleResendOTP}
              disabled={isLoading}
              className="w-full"
            >
              Resend OTP
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default OtpModal;
