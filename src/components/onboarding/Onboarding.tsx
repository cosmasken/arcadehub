import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Code, Gamepad2, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: (userData: any) => void;
}

const OnboardingModal: React.FC<OnboardingModalProps> = ({ isOpen, onComplete }) => {
   const navigate = useNavigate();
  const [step, setStep] = useState<'userType' | 'gamerSetup' | 'developerSetup' | 'complete'>('userType');
  const [userType, setUserType] = useState<'gamer' | 'developer' | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState({
    username: '',
    bio: '',
    // Gamer
    favoriteGenres: [] as string[],
    experienceLevel: '',
    preferredPlatforms: [] as string[],
    // Developer
    companyName: '',
    role: '',
    experience: '',
    techStack: [] as string[],
    projectTypes: [] as string[],
  });

  const gameGenres = [
    'Action', 'Adventure', 'RPG', 'Strategy', 'Simulation', 
    'Sports', 'Racing', 'Puzzle', 'Horror', 'MMO'
  ];

  const platforms = [
    'PC', 'PlayStation', 'Xbox', 'Nintendo Switch', 'Mobile', 'VR'
  ];

  const techStackOptions = [
    'React', 'Unity', 'Unreal Engine', 'Solidity', 'JavaScript', 
    'TypeScript', 'Python', 'C++', 'C#', 'Rust'
  ];

  const projectTypeOptions = [
    'Web3 Games', 'DeFi Applications', 'NFT Marketplaces', 
    'Smart Contracts', 'dApps', 'Gaming Tools'
  ];

  const handleGenreToggle = (genre: string) => {
    setUserData(prev => ({
      ...prev,
      favoriteGenres: prev.favoriteGenres.includes(genre)
        ? prev.favoriteGenres.filter(g => g !== genre)
        : [...prev.favoriteGenres, genre]
    }));
  };

  const handlePlatformToggle = (platform: string) => {
    setUserData(prev => ({
      ...prev,
      preferredPlatforms: prev.preferredPlatforms.includes(platform)
        ? prev.preferredPlatforms.filter(p => p !== platform)
        : [...prev.preferredPlatforms, platform]
    }));
  };

  const handleTechStackToggle = (tech: string) => {
    setUserData(prev => ({
      ...prev,
      techStack: prev.techStack.includes(tech)
        ? prev.techStack.filter(t => t !== tech)
        : [...prev.techStack, tech]
    }));
  };

  const handleProjectTypeToggle = (type: string) => {
    setUserData(prev => ({
      ...prev,
      projectTypes: prev.projectTypes.includes(type)
        ? prev.projectTypes.filter(t => t !== type)
        : [...prev.projectTypes, type]
    }));
  };

  const handleUserTypeSelect = (type: 'gamer' | 'developer') => {
    setUserType(type);
    setStep(type === 'gamer' ? 'gamerSetup' : 'developerSetup');
    setError(null);
  };

  const isGamerFormValid = () => {
    return (
      userData.username.trim() !== '' &&
      userData.favoriteGenres.length > 0 &&
      userData.experienceLevel !== ''
    );
  };

  const isDeveloperFormValid = () => {
    return (
      userData.username.trim() !== '' &&
      userData.companyName.trim() !== '' &&
      userData.role.trim() !== '' &&
      userData.experience !== ''
    );
  };

  const handleComplete = () => {
    setError(null);
    if (
      (userType === 'gamer' && !isGamerFormValid()) ||
      (userType === 'developer' && !isDeveloperFormValid())
    ) {
      setError('Please fill all required fields.');
      return;
    }
    // Only send username and bio (required by schema)
    onComplete({
      username: userData.username,
      bio: userData.bio,
    });
    setStep('complete');
     setTimeout(() => {
      navigate('/');
    }, 4800); // Give user a moment to see the "Setup Complete!" message
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => {}}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            {step === 'userType' && 'Welcome to Web3 Portal!'}
            {step === 'gamerSetup' && 'Set Up Your Gaming Profile'}
            {step === 'developerSetup' && 'Set Up Your Developer Profile'}
            {step === 'complete' && 'Welcome Aboard!'}
          </DialogTitle>
        </DialogHeader>

        {step === 'userType' && (
          <div className="space-y-6 py-6 bg-white">
            <p className="text-center text-gray-600 dark:text-gray-300">
              Let's personalize your experience. How do you plan to use our platform?
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button
                onClick={() => handleUserTypeSelect('gamer')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 dark:border-gray-700 dark:hover:border-blue-400 dark:hover:bg-blue-900/20 transition-all group"
              >
                <div className="flex flex-col items-center space-y-3">
                  <Gamepad2 className="h-12 w-12 text-blue-600 group-hover:text-blue-700" />
                  <h3 className="text-xl font-semibold">I'm a Gamer</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                    Discover and play Web3 games, earn rewards, and track achievements
                  </p>
                </div>
              </button>
              <button
                onClick={() => handleUserTypeSelect('developer')}
                className="p-6 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 dark:border-gray-700 dark:hover:border-green-400 dark:hover:bg-green-900/20 transition-all group"
              >
                <div className="flex flex-col items-center space-y-3">
                  <Code className="h-12 w-12 text-green-600 group-hover:text-green-700" />
                  <h3 className="text-xl font-semibold">I'm a Developer</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 text-center">
                    Build, deploy, and manage Web3 games and applications
                  </p>
                </div>
              </button>
            </div>
          </div>
        )}

        {step === 'gamerSetup' && (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                placeholder="Enter your gaming username"
                value={userData.username}
                onChange={(e) => setUserData(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Gaming Experience Level *</Label>
              <Select value={userData.experienceLevel} onValueChange={(value) => setUserData(prev => ({ ...prev, experienceLevel: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner (0-1 years)</SelectItem>
                  <SelectItem value="intermediate">Intermediate (2-5 years)</SelectItem>
                  <SelectItem value="advanced">Advanced (5+ years)</SelectItem>
                  <SelectItem value="professional">Professional/Competitive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Favorite Game Genres * (Select at least one)</Label>
              <div className="grid grid-cols-2 gap-2">
                {gameGenres.map((genre) => (
                  <div key={genre} className="flex items-center space-x-2">
                    <Checkbox
                      id={genre}
                      checked={userData.favoriteGenres.includes(genre)}
                      onCheckedChange={() => handleGenreToggle(genre)}
                    />
                    <Label htmlFor={genre} className="text-sm">{genre}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Preferred Gaming Platforms</Label>
              <div className="grid grid-cols-2 gap-2">
                {platforms.map((platform) => (
                  <div key={platform} className="flex items-center space-x-2">
                    <Checkbox
                      id={platform}
                      checked={userData.preferredPlatforms.includes(platform)}
                      onCheckedChange={() => handlePlatformToggle(platform)}
                    />
                    <Label htmlFor={platform} className="text-sm">{platform}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself..."
                value={userData.bio}
                onChange={(e) => setUserData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('userType')}>
                Back
              </Button>
              <Button 
                onClick={handleComplete}
                disabled={!isGamerFormValid()}
              >
                Complete Setup
              </Button>
            </div>
          </div>
        )}

        {step === 'developerSetup' && (
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label htmlFor="username">Username *</Label>
              <Input
                id="username"
                placeholder="Enter your developer username"
                value={userData.username}
                onChange={(e) => setUserData(prev => ({ ...prev, username: e.target.value }))}
                required
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="companyName">Company/Organization Name *</Label>
                <Input
                  id="companyName"
                  placeholder="Enter company name or 'Independent'"
                  value={userData.companyName}
                  onChange={(e) => setUserData(prev => ({ ...prev, companyName: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="role">Your Role *</Label>
                <Input
                  id="role"
                  placeholder="e.g., Game Developer, Smart Contract Developer"
                  value={userData.role}
                  onChange={(e) => setUserData(prev => ({ ...prev, role: e.target.value }))}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Development Experience *</Label>
              <Select value={userData.experience} onValueChange={(value) => setUserData(prev => ({ ...prev, experience: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Select your experience level" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="junior">Junior (0-2 years)</SelectItem>
                  <SelectItem value="mid">Mid-level (3-5 years)</SelectItem>
                  <SelectItem value="senior">Senior (6-10 years)</SelectItem>
                  <SelectItem value="lead">Lead/Principal (10+ years)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-3">
              <Label>Technology Stack</Label>
              <div className="grid grid-cols-2 gap-2">
                {techStackOptions.map((tech) => (
                  <div key={tech} className="flex items-center space-x-2">
                    <Checkbox
                      id={tech}
                      checked={userData.techStack.includes(tech)}
                      onCheckedChange={() => handleTechStackToggle(tech)}
                    />
                    <Label htmlFor={tech} className="text-sm">{tech}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Project Types of Interest</Label>
              <div className="grid grid-cols-2 gap-2">
                {projectTypeOptions.map((type) => (
                  <div key={type} className="flex items-center space-x-2">
                    <Checkbox
                      id={type}
                      checked={userData.projectTypes.includes(type)}
                      onCheckedChange={() => handleProjectTypeToggle(type)}
                    />
                    <Label htmlFor={type} className="text-sm">{type}</Label>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio (Optional)</Label>
              <Textarea
                id="bio"
                placeholder="Tell us about yourself and your development interests..."
                value={userData.bio}
                onChange={(e) => setUserData(prev => ({ ...prev, bio: e.target.value }))}
                rows={3}
              />
            </div>
            {error && <div className="text-red-500 text-sm">{error}</div>}
            <div className="flex justify-between pt-4">
              <Button variant="outline" onClick={() => setStep('userType')}>
                Back
              </Button>
              <Button 
                onClick={handleComplete}
                disabled={!isDeveloperFormValid()}
              >
                Complete Setup
              </Button>
            </div>
          </div>
        )}

        {step === 'complete' && (
          <div className="flex flex-col items-center space-y-6 py-8">
            <div className="rounded-full bg-green-100 p-6">
              <CheckCircle className="h-16 w-16 text-green-600" />
            </div>
            <div className="text-center">
              <h3 className="text-2xl font-bold text-green-600">Setup Complete!</h3>
              <p className="text-gray-600 dark:text-gray-300 mt-2">
                Welcome to Web3 Portal! Your personalized dashboard is being prepared...
              </p>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default OnboardingModal;