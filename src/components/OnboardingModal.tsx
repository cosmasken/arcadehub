import React, { useState, useRef, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Textarea } from '../components/ui/textarea';
import { Loader2, CheckCircle, X, Upload, User as UserIcon,User, Gamepad2, Check, Trophy, Gift, Code } from 'lucide-react';
import { useToast } from '../components/ui/use-toast';
import { User as SupabaseUser, UserRole as SupabaseUserRole } from '../types/supabase';
import { supabase } from '../lib/supabase';
import { RadioGroup, RadioGroupItem } from '../components/ui/radio-group';
import useWalletStore from '../stores/useWalletStore';

type UserRole = 'player' | 'developer' | 'sponsor';

type SocialLinks = {
  twitter?: string;
  discord?: string;
  website?: string;
  github?: string;
  [key: string]: string | undefined;
};

export interface UserData extends Omit<SupabaseUser, 
  'id' | 'wallet_address' | 'created_at' | 'updated_at' | 
  'onchain_id' | 'onchain_tx_hash' | 'onchain_status' | 
  'is_verified' | 'verification_data' | 'user_type'
> {
  user_type: UserRole;
  social_links?: SocialLinks | null;
}

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (userData: UserData) => void;
}

type UsernameStatus = 'idle' | 'checking' | 'available' | 'taken';
// UserRole type is already defined above
type OnboardingStep = 'userType' | 'profile' | 'complete';

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
  const [step, setStep] = useState<OnboardingStep>('userType');
  const [userType, setUserType] = useState<UserRole>('player');
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [usernameStatus, setUsernameStatus] = useState<UsernameStatus>('idle');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const { toast } = useToast();

  const { aaWalletAddress } = useWalletStore();
  
  const checkUsernameExists = async (username: string): Promise<boolean> => {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single();
    
    if (error && error.code !== 'PGRST116') {
      console.error('Error checking username:', error);
      return false;
    }
    
    return !!data;
  };

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

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: 'Invalid file type',
          description: 'Please upload an image file (JPEG, PNG, etc.)',
          variant: 'destructive',
        });
        return;
      }
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File too large',
          description: 'Please upload an image smaller than 5MB',
          variant: 'destructive',
        });
        return;
      }
      setAvatarFile(file);
    }
  };

  const timeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    // Cleanup function to clear the timeout when the component unmounts
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const handleUsernameChange = (value: string) => {
    setUsername(value);
    setUsernameStatus('idle');
    if (value.trim().length >= 3) {
      // Clear any existing timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      // Set a new timeout
      timeoutRef.current = setTimeout(() => {
        checkUsernameAvailability(value);
      }, 500);
    }
  };

  const handleNext = () => {
    setStep('profile');
  };

  const handleComplete = async () => {
    // Validate username
    if (!username.trim()) {
      toast({
        title: 'Error',
        description: 'Username is required',
        variant: 'destructive',
      });
      return;
    }

    // Check username availability
    if (usernameStatus === 'taken') {
      toast({
        title: 'Username not available',
        description: 'Please choose a different username',
        variant: 'destructive',
      });
      return;
    }

    if (usernameStatus === 'checking') {
      toast({
        title: 'Please wait',
        description: 'Checking username availability...',
      });
      return;
    }

    setIsSubmitting(true);
    setIsUploading(true);

    try {
      // Get wallet address from store
      const walletStore = useWalletStore.getState();
      const walletAddress = walletStore.aaWalletAddress;
      
      if (!walletAddress) {
        throw new Error('Wallet not connected');
      }

      // Handle avatar upload if file is selected
      let avatarUrl = null;
      if (avatarFile) {
        const fileExt = avatarFile.name.split('.').pop();
        const fileName = `${walletAddress}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
        const filePath = `avatars/${fileName}`;
        
        // Upload to Supabase Storage
        const { error: uploadError } = await supabase.storage
          .from('avatars')
          .upload(filePath, avatarFile);
        
        if (uploadError) throw uploadError;
        
        // Get public URL
        const { data: { publicUrl } } = supabase.storage
          .from('avatars')
          .getPublicUrl(filePath);
          
        avatarUrl = publicUrl;
      }

      // Prepare user data for Supabase
      const userData = {
        // Don't include id - let the database handle it
        username: username.trim(),
        bio: bio.trim() || null,
        avatar_url: avatarUrl,
        user_type: userType,
        // Don't include created_at or updated_at - let the database handle these
        // Include other required fields with default values
        email: null,
        company_name: null,
        website: null,
        industry: null,
        contact_email: null,
        contact_phone: null,
        social_links: {}
      };

      // Call onComplete with the user data
      onComplete(userData);

    } catch (error) {
      console.error('Error creating profile:', error);
      toast({
        title: 'Error creating profile',
        description: error instanceof Error ? error.message : 'Failed to create user profile',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setIsUploading(false);
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

  const handleDialogClose = (open: boolean) => {
    if (!open) {
      // Only proceed if we're not in the middle of submission
      if (isSubmitting) return;
      
      // If the form is complete and valid, submit it
      if (step === 'profile' && isFormValid()) {
        handleComplete();
      } else {
        // Otherwise, just close with empty data
        onComplete({
          username: '',
          bio: null,
          user_type: 'player',
          email: null,
          avatar_url: null,
          company_name: null,
          website: null,
          social_links: null,
          industry: null,
          contact_email: null,
          contact_phone: null
        });
      }
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleDialogClose}>
      <DialogContent className="sm:max-w-[500px] p-6 bg-gradient-to-b from-black/90 to-black/80 backdrop-blur-sm border border-white/10 rounded-2xl shadow-2xl">
        <DialogHeader className="mb-6">
          <DialogTitle className="text-2xl font-bold text-center text-white">
            Welcome to ArcadeHub
          </DialogTitle>
        </DialogHeader>

        {step === 'userType' && (
          <div className="space-y-6 py-4">
            <p className="text-center text-gray-300 text-sm">
              Are you a player or a developer?
            </p>

            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setUserType('player')}
                className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                  userType === 'player' 
                    ? 'border-blue-500 bg-blue-500/10' 
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <Gamepad2 className="h-8 w-8 mb-2 text-blue-400" />
                <span className="font-medium text-white">Player</span>
                <p className="text-xs text-gray-400 mt-1 text-center">Play games and earn rewards</p>
              </button>

              <button
                type="button"
                onClick={() => setUserType('developer')}
                className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                  userType === 'developer'
                    ? 'border-purple-500 bg-purple-500/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <Code className="h-8 w-8 mb-2 text-purple-400" />
                <span className="font-medium text-white">Developer</span>
                <p className="text-xs text-gray-400 mt-1 text-center">Create and publish games</p>
              </button>

              <button
                type="button"
                onClick={() => setUserType('sponsor')}
                className={`flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all ${
                  userType === 'sponsor'
                    ? 'border-green-500 bg-green-500/10'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                <Gift className="h-8 w-8 mb-2 text-green-400" />
                <span className="font-medium text-white">Sponsor</span>
                <p className="text-xs text-gray-400 mt-1 text-center">Support games and tournaments</p>
              </button>

              <div className="opacity-50 cursor-not-allowed">
                <div className="flex flex-col items-center justify-center p-6 rounded-xl border-2 border-white/10">
                  <Trophy className="h-8 w-8 mb-2 text-yellow-400" />
                  <span className="font-medium text-white">Admin</span>
                  <p className="text-xs text-gray-400 mt-1 text-center">Manage platform</p>
                </div>
              </div>
            </div>

            <Button onClick={handleNext} className="w-full">
              Continue
            </Button>
          </div>
        )}

        {step === 'profile' && (
          <div className="space-y-6 py-4 ">
            <p className="text-center text-black dark:text-gray-300 text-sm">
              Just a couple quick details to get you started
            </p>

            <div className="space-y-2">
              <Label htmlFor="username" className='text-black'>Username *</Label>
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
              <p className="text-xs text-black">
                Minimum 3 characters. This will be your public display name.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio" className='text-black'>Bio (Optional)</Label>
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

            <label htmlFor="avatar" className="block font-medium text-black">Avatar</label>
            <input
              id="avatar"
              type="file"
              accept="image/*"
              onChange={handleAvatarChange}
              disabled={isUploading}
              className="block text-black"
            />
            {/* Optionally show preview */}
            {avatarFile && (
              <img
                src={URL.createObjectURL(avatarFile)}
                alt="Avatar Preview"
                className="w-16 h-16 rounded-full mt-2"
              />
            )}

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
                'Complete Onboarding'
              )}
            </Button>
          </div>
        )}

        {step === 'complete' && (
          <div className="flex flex-col items-center space-y-6 py-8 ">
            <div className="rounded-full bg-green-100 p-6">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-green-600">All Set!</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Welcome to ArcadeHub, @{username}!
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
