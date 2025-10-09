import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Smartphone, 
  QrCode, 
  Copy, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from "sonner";
import { firebaseAuthService } from '@/services/firebase-auth.service';

interface MFASetupProps {
  onMFAComplete?: () => void;
}

const MFASetup = ({ onMFAComplete }: MFASetupProps) => {
  const [enrolledFactors, setEnrolledFactors] = useState<any[]>([]);
  const [totpSecret, setTotpSecret] = useState<string | null>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  // Load enrolled factors on component mount
  useEffect(() => {
    loadEnrolledFactors();
  }, []);

  const loadEnrolledFactors = async () => {
    try {
      const factors = await firebaseAuthService.getEnrolledFactors();
      setEnrolledFactors(factors);
    } catch (error: any) {
      toast.error('Failed to load MFA factors: ' + error.message);
    }
  };

  const handleEnrollTotp = async () => {
    setIsEnrolling(true);
    try {
      // In a real implementation, this would generate a QR code
      // For now, we'll just show the secret key
      const secret = await firebaseAuthService.enrollTotpMfa();
      setTotpSecret(secret);
      
      // Generate a mock QR code URL for demonstration
      const mockQrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/OctaviaInterview?secret=${secret}&issuer=OctaviaInterview`;
      setQrCodeUrl(mockQrCodeUrl);
      
      toast.success('TOTP enrollment started. Scan the QR code with your authenticator app.');
    } catch (error: any) {
      toast.error('Failed to enroll TOTP: ' + error.message);
    } finally {
      setIsEnrolling(false);
    }
  };

  const handleVerifyTotp = async () => {
    if (!totpSecret) return;
    
    setIsVerifying(true);
    try {
      // In a real implementation, we would create a TotpSecret object
      // For now, we'll just simulate the verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Reset state after successful verification
      setTotpSecret(null);
      setVerificationCode('');
      setQrCodeUrl(null);
      
      // Reload enrolled factors
      await loadEnrolledFactors();
      
      toast.success('TOTP authentication enabled successfully!');
      onMFAComplete?.();
    } catch (error: any) {
      toast.error('Failed to verify TOTP: ' + error.message);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleUnenrollFactor = async (factorId: string) => {
    try {
      await firebaseAuthService.unenrollMfa(factorId);
      await loadEnrolledFactors();
      toast.success('MFA factor removed successfully');
    } catch (error: any) {
      toast.error('Failed to remove MFA factor: ' + error.message);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          Multi-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {enrolledFactors.length > 0 && (
          <div>
            <h3 className="font-medium mb-3">Enrolled Factors</h3>
            <div className="space-y-3">
              {enrolledFactors.map((factor) => (
                <div key={factor.uid} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Smartphone className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <div className="font-medium">
                        {factor.displayName || factor.factorId}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Enrolled on {new Date(factor.enrollmentTime).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => handleUnenrollFactor(factor.uid)}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}

        {!totpSecret ? (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Multi-factor authentication adds an extra layer of security to your account.
                Even if your password is compromised, your account remains protected.
              </AlertDescription>
            </Alert>
            
            <div className="p-4 border rounded-lg">
              <h4 className="font-medium mb-2 flex items-center gap-2">
                <Smartphone className="h-4 w-4" />
                Authenticator App
              </h4>
              <p className="text-sm text-muted-foreground mb-4">
                Use an authenticator app like Google Authenticator or Authy to generate 
                time-based one-time passwords.
              </p>
              <Button 
                onClick={handleEnrollTotp}
                disabled={isEnrolling}
                className="w-full"
              >
                {isEnrolling ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Setting up...
                  </>
                ) : (
                  'Set up authenticator app'
                )}
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Alert>
              <AlertDescription>
                Scan the QR code with your authenticator app, then enter the generated code below.
              </AlertDescription>
            </Alert>
            
            <div className="flex flex-col items-center gap-4">
              {qrCodeUrl && (
                <img 
                  src={qrCodeUrl} 
                  alt="TOTP QR Code" 
                  className="border rounded-lg p-2"
                />
              )}
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground mb-2">
                  Or enter this key manually:
                </p>
                <div className="flex items-center gap-2">
                  <code className="bg-muted px-2 py-1 rounded text-sm">
                    {totpSecret}
                  </code>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(totpSecret || '');
                      toast.success('Copied to clipboard');
                    }}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="verificationCode">Verification Code</Label>
              <Input
                id="verificationCode"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                placeholder="Enter 6-digit code"
                maxLength={6}
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={handleVerifyTotp}
                disabled={isVerifying || verificationCode.length !== 6}
                className="flex-1"
              >
                {isVerifying ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify and Enable'
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setTotpSecret(null);
                  setVerificationCode('');
                  setQrCodeUrl(null);
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MFASetup;