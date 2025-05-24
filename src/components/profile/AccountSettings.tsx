import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Switch } from '../ui/switch';
import { Label } from '../ui/label';
import { Separator } from '../ui/separator';
import  useProfile  from '../../stores/useProfileStore';
import { useToast } from '../../hooks/use-toast';

export const AccountSettings = () => {
  const { user, updateProfile } = useProfile();
  const { toast } = useToast();
  const [settings, setSettings] = useState({
    emailNotifications: true,
    gameInvites: true,
    marketingEmails: false,
    publicProfile: true,
    showOnlineStatus: true,
  });

  const handleSaveProfile = () => {
    updateProfile({
      username: user.username,
      bio: user.bio,
    });
    toast({
      title: "Profile Updated",
      description: "Your profile has been successfully updated.",
    });
  };

  const handleSaveSettings = () => {
    toast({
      title: "Settings Saved",
      description: "Your preferences have been updated.",
    });
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Profile Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="username">Username</Label>
            <Input
              id="username"
              value={user.username}
              onChange={(e) => updateProfile({ username: e.target.value })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="bio">Bio</Label>
            <Input
              id="bio"
              value={user.bio}
              onChange={(e) => updateProfile({ bio: e.target.value })}
              className="mt-1"
            />
          </div>
          <Button onClick={handleSaveProfile} className="bg-purple-600 hover:bg-purple-700">
            Save Profile
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Privacy Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="public-profile">Public Profile</Label>
            <Switch
              id="public-profile"
              checked={settings.publicProfile}
              onCheckedChange={(checked) => setSettings({ ...settings, publicProfile: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="online-status">Show Online Status</Label>
            <Switch
              id="online-status"
              checked={settings.showOnlineStatus}
              onCheckedChange={(checked) => setSettings({ ...settings, showOnlineStatus: checked })}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Notification Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="email-notifications">Email Notifications</Label>
            <Switch
              id="email-notifications"
              checked={settings.emailNotifications}
              onCheckedChange={(checked) => setSettings({ ...settings, emailNotifications: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="game-invites">Game Invites</Label>
            <Switch
              id="game-invites"
              checked={settings.gameInvites}
              onCheckedChange={(checked) => setSettings({ ...settings, gameInvites: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="marketing-emails">Marketing Emails</Label>
            <Switch
              id="marketing-emails"
              checked={settings.marketingEmails}
              onCheckedChange={(checked) => setSettings({ ...settings, marketingEmails: checked })}
            />
          </div>
          <Separator />
          <Button onClick={handleSaveSettings} className="bg-green-600 hover:bg-green-700">
            Save Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
