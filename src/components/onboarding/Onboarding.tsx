import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { CheckCircle, X, Loader2, User, Gamepad2, Code } from 'lucide-react';
import { toast } from '../ui/use-toast';
import useProfileStore from '../../stores/useProfileStore';
import useWalletStore from '../../stores/useWalletStore';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (userData: any) => void;
}

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken';
type UserType = 'developer' | 'gamer';
type OnboardingStep = 'userType' | 'profile' | 'complete';

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState<OnboardingStep>('userType');
  const [userType, setUserType] = useState<UserType>('gamer');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { checkUsernameExists, onboardUser } = useProfileStore();
  const { address } = useWalletStore();

  // Real username check
  const checkUsernameAvailability = async (username: string) => {
    if (!username.trim()) {
      setUsernameStatus('idle');
      return;
    }
    setUsernameStatus('checking');
    const exists = await checkUsernameExists(username.trim());
    setUsernameStatus(exists ? 'taken' : 'available');
  };

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameStatus('idle');
    if (value.trim().length >= 3) {
      // Debounce
      clearTimeout((handleUsernameChange as any).timeoutId);
      (handleUsernameChange as any).timeoutId = setTimeout(() => {
        checkUsernameAvailability(value);
      }, 500);
    }
  };

  const handleNext = () => {
    setStep('profile');
  };

  const handleComplete = async () => {
    if (!username.trim()) {
      toast({
        title: "Error",
        description: "Username is required",
        variant: "destructive"
      });
      return;
    }

    switch (usernameStatus) {
      case 'checking':
        toast({
          title: "Please wait",
          description: "Checking username availability...",
          variant: "default"
        });
        return;
      case 'taken':
        toast({
          title: "Error",
          description: "Please choose a different username",
          variant: "destructive"
        });
        return;
      // case 'idle':
      //   await checkUsernameAvailability(username);
      //   if (usernameStatus === 'taken') {
      //     toast({
      //       title: "Error",
      //       description: "Username is not available",
      //       variant: "destructive"
      //     });
      //     return;
      //   }
      //   if (usernameStatus !== 'available') {
      //     toast({
      //       title: "Error",
      //       description: "Please try again after checking username availability.",
      //       variant: "destructive"
      //     });
      //     return;
      //   }
      //   break;
      case 'available':
        // Good to proceed
        break;
      default:
        toast({
          title: "Error",
          description: "Unknown username status. Please try again.",
          variant: "destructive"
        });
        return;
    }

    setIsSubmitting(true);
    const success = await onboardUser(address, {
      username: username.trim(),
      bio: bio.trim() || null,
      role: userType,
    });
    setIsSubmitting(false);
    if (success) {
      setStep('complete');
      setTimeout(() => {
        onComplete({ username, bio, userType });
      }, 2000);
    } else {
      toast({
        title: "Error",
        description: "Failed to create profile. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getUsernameStatusIcon = () => {
    switch (usernameStatus) {
      case 'checking':
        return <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />;
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'taken':
        return <X className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };

  const getUsernameStatusText = () => {
    switch (usernameStatus) {
      case 'checking':
        return <span className="text-blue-500 text-sm">Checking availability...</span>;
      case 'available':
        return <span className="text-green-500 text-sm">Username available!</span>;
      case 'taken':
        return <span className="text-red-500 text-sm">Username already exists</span>;
      default:
        return null;
    }
  };

  const isFormValid = () => {
    return username.trim().length >= 3 && usernameStatus === 'available';
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => { }}>
      <DialogContent className="max-w-md bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
            {step === 'userType' && 'Welcome to Web3 Portal!'}
            {step === 'profile' && (
              <>
                <User className="h-6 w-6" />
                Complete Your Profile
              </>
            )}
            {step === 'complete' && 'Welcome to Web3 Portal!'}
          </DialogTitle>
        </DialogHeader>

        {step === 'userType' && (
          <div className="space-y-6 py-4">
            <p className="text-center text-black-600 font-bold dark:text-gray-300 text-sm">
              Tell us about yourself to get started
            </p>

            <div className="space-y-4">
              <Label className="text-base font-medium">I am a...</Label>
              <RadioGroup value={userType} onValueChange={(value: UserType) => setUserType(value)}>
                <div
                  className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition
            ${userType === 'gamer'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/30 ring-2 ring-blue-400'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700'}`}
                  onClick={() => setUserType('gamer')}
                >
                  <RadioGroupItem value="gamer" id="gamer" />
                  <div className="flex items-center space-x-3">
                    <Gamepad2 className="h-5 w-5 text-blue-500" />
                    <div>
                      <label htmlFor="gamer" className="font-medium cursor-pointer">Gamer</label>
                      <p className="text-sm text-gray-500">I want to play and discover games</p>
                    </div>
                  </div>
                </div>

                <div
                  className={`flex items-center space-x-3 p-4 border rounded-lg cursor-pointer transition
            ${userType === 'developer'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/30 ring-2 ring-green-400'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-800 border-gray-300 dark:border-gray-700'}`}
                  onClick={() => setUserType('developer')}
                >
                  <RadioGroupItem value="developer" id="developer" />
                  <div className="flex items-center space-x-3">
                    <Code className="h-5 w-5 text-green-500" />
                    <div>
                      <label htmlFor="developer" className="font-medium cursor-pointer">Developer</label>
                      <p className="text-sm text-gray-500">I want to upload and publish games</p>
                    </div>
                  </div>
                </div>
              </RadioGroup>
            </div>

            <Button onClick={handleNext} className="w-full">
              Continue
            </Button>
          </div>
        )}

        {step === 'profile' && (
          <div className="space-y-6 py-4">
            <p className="text-center text-gray-600 dark:text-gray-300 text-sm">
              Just a couple quick details to get you started
            </p>

            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <div className="relative">
                <Input
                  id="username"
                  placeholder="Choose a unique username"
                  value={username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className={`pr-10 ${usernameStatus === 'available' ? 'border-green-500' :
                      usernameStatus === 'taken' ? 'border-red-500' : ''
                    }`}
                  disabled={isSubmitting}
                />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  {getUsernameStatusIcon()}
                </div>
              </div>
              {getUsernameStatusText()}
              <p className="text-xs text-gray-500">
                Minimum 3 characters. This will be your public display name.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a bit about yourself..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                disabled={isSubmitting}
                maxLength={500}
              />
              <p className="text-xs text-gray-500 text-right">
                {bio.length}/500 characters
              </p>
            </div>

            <Button
              onClick={handleComplete}
              disabled={!isFormValid() || isSubmitting}
              className="w-full"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating Profile...
                </>
              ) : (
                'Complete Setup'
              )}
            </Button>
          </div>
        )}

        {step === 'complete' && (
          <div className="flex flex-col items-center space-y-6 py-8">
            <div className="rounded-full bg-green-100 p-6">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-green-600">All Set!</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Welcome to Web3 Portal, @{username}!
              </p>
              <p className="text-sm text-gray-500 mt-1">
                {userType === 'developer' ? 'Ready to upload your games!' : 'Ready to discover amazing games!'}
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;
