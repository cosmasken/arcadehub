import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import { useSettingsStore } from "@/stores/useSettingStore";
import useWalletStore from "@/stores/useWalletStore";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel } from "@/components/ui/form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Wallet, Bell, Accessibility, Languages, Volume, User } from "lucide-react";

interface SettingsFormValues {
  walletAddress: string;
  notificationEmails: boolean;
  notificationPushes: boolean;
  notificationUpdates: boolean;
  profileVisibility: string;
  language: string;
  highContrast: boolean;
  fontSize: string;
  soundEffects: boolean;
  musicVolume: string;
  autoSaveEnabled: boolean;
}

const AccountSettings = () => {
  const { toast } = useToast();
  const settings = useSettingsStore();
  const { setSetting, setAll } = useSettingsStore();
  const { isConnected, connectWallet, disconnectWallet, aaWalletAddress } = useWalletStore();

  // Form setup with store values
  const form = useForm<SettingsFormValues>({
    defaultValues: { ...settings }
  });

  // Keep form in sync with store (if store changes externally)
  useEffect(() => {
    form.reset({ ...settings });
  }, [settings, form]);

  // Wallet connection state
  //const isWalletConnected = !!settings.walletAddress;


  // Update store on form submit
  const onSubmit = (values: SettingsFormValues) => {
    setAll(values);
    toast({
      title: "Settings Saved",
      description: "Your account settings have been updated.",
    });
  };

  // Update store instantly on change for each field
  const handleFieldChange = <K extends keyof SettingsFormValues>(key: K, value: SettingsFormValues[K]) => {
    setSetting(key, value);
    form.setValue(key, value, { shouldDirty: true });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* Wallet Settings */}
        <Card className="bg-secondary border-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wallet size={20} className="text-arcade-yellow" />
              Wallet Connection
            </CardTitle>
            <CardDescription>
              Connect your wallet to receive rewards and manage your assets
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="walletAddress"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Wallet Address</FormLabel>
                    <div className="flex gap-2">
                      <FormControl>
                        <Input
                          placeholder="Connect wallet to display address"
                          {...field}
                          value={settings.walletAddress}
                          readOnly
                          className="bg-muted border-muted/30"
                        />
                      </FormControl>
                      <Button
                        type="button"
                        onClick={isConnected ? disconnectWallet : connectWallet}
                        variant={isConnected ? "outline" : "default"}
                        className={isConnected ? "border-white/20 hover:bg-white/5" : "bg-arcade-yellow hover:bg-arcade-yellow/80 text-black"}
                      >
                        {isConnected ? "Disconnect" : "Connect"}
                      </Button>
                    </div>
                    <FormDescription>
                      {isConnected
                        ? "Your wallet is connected and ready to use"
                        : "Connect your wallet to use blockchain features"}
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card className="bg-secondary border-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell size={20} className="text-arcade-blue" />
              Notification Preferences
            </CardTitle>
            <CardDescription>
              Choose what notifications you want to receive
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="notificationEmails"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-muted/30 p-3 bg-muted">
                    <div className="space-y-0.5">
                      <FormLabel>Email Notifications</FormLabel>
                      <FormDescription>
                        Receive notifications via email
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={settings.notificationEmails}
                        onCheckedChange={v => handleFieldChange("notificationEmails", v)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notificationPushes"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-muted/30 p-3 bg-muted">
                    <div className="space-y-0.5">
                      <FormLabel>Push Notifications</FormLabel>
                      <FormDescription>
                        Receive push notifications in your browser
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={settings.notificationPushes}
                        onCheckedChange={v => handleFieldChange("notificationPushes", v)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="notificationUpdates"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-muted/30 p-3 bg-muted">
                    <div className="space-y-0.5">
                      <FormLabel>Product Updates</FormLabel>
                      <FormDescription>
                        Receive updates about new games and features
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={settings.notificationUpdates}
                        onCheckedChange={v => handleFieldChange("notificationUpdates", v)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Privacy Settings */}
        <Card className="bg-secondary border-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} className="text-arcade-purple" />
              Privacy Settings
            </CardTitle>
            <CardDescription>
              Control how your profile and data are shared
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="profileVisibility"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Visibility</FormLabel>
                    <Select
                      onValueChange={v => handleFieldChange("profileVisibility", v)}
                      value={settings.profileVisibility}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-muted border-muted/30">
                          <SelectValue placeholder="Select visibility" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="public">Public (Anyone can view)</SelectItem>
                        <SelectItem value="friends">Friends Only</SelectItem>
                        <SelectItem value="private">Private (Only you)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Choose who can see your profile and game activity
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Language Settings */}
        <Card className="bg-secondary border-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Languages size={20} className="text-arcade-green" />
              Language Preferences
            </CardTitle>
            <CardDescription>
              Choose your preferred language for the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Display Language</FormLabel>
                    <Select
                      onValueChange={v => handleFieldChange("language", v)}
                      value={settings.language}
                    >
                      <FormControl>
                        <SelectTrigger className="bg-muted border-muted/30">
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="es">Spanish</SelectItem>
                        <SelectItem value="fr">French</SelectItem>
                        <SelectItem value="de">German</SelectItem>
                        <SelectItem value="ja">Japanese</SelectItem>
                        <SelectItem value="zh">Chinese</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Interface language for menus and content
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Accessibility Options */}
        <Card className="bg-secondary border-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Accessibility size={20} className="text-arcade-blue" />
              Accessibility Options
            </CardTitle>
            <CardDescription>
              Customize your experience for better accessibility
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="highContrast"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-muted/30 p-3 bg-muted">
                    <div className="space-y-0.5">
                      <FormLabel>High Contrast Mode</FormLabel>
                      <FormDescription>
                        Increase contrast for better visibility
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={settings.highContrast}
                        onCheckedChange={v => handleFieldChange("highContrast", v)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="fontSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Text Size</FormLabel>
                    <FormControl>
                      <ToggleGroup 
                        type="single" 
                        value={settings.fontSize}
                        onValueChange={v => handleFieldChange("fontSize", v)}
                        className="justify-start bg-muted rounded-md border border-muted/30"
                      >
                        <ToggleGroupItem value="small">Small</ToggleGroupItem>
                        <ToggleGroupItem value="medium">Medium</ToggleGroupItem>
                        <ToggleGroupItem value="large">Large</ToggleGroupItem>
                      </ToggleGroup>
                    </FormControl>
                    <FormDescription>
                      Adjust text size for better readability
                    </FormDescription>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* Game Settings */}
        <Card className="bg-secondary border-muted/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Volume size={20} className="text-arcade-yellow" />
              Game Settings
            </CardTitle>
            <CardDescription>
              Adjust your game preferences
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="soundEffects"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border border-muted/30 p-3 bg-muted">
                    <div className="space-y-0.5">
                      <FormLabel>Sound Effects</FormLabel>
                      <FormDescription>
                        Enable game sound effects
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={settings.soundEffects}
                        onCheckedChange={v => handleFieldChange("soundEffects", v)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="musicVolume"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Music Volume</FormLabel>
                    <FormControl>
                      <ToggleGroup 
                        type="single" 
                        value={settings.musicVolume}
                        onValueChange={v => handleFieldChange("musicVolume", v)}
                        className="justify-start bg-muted rounded-md border border-muted/30"
                      >
                        <ToggleGroupItem value="off">Off</ToggleGroupItem>
                        <ToggleGroupItem value="low">Low</ToggleGroupItem>
                        <ToggleGroupItem value="medium">Medium</ToggleGroupItem>
                        <ToggleGroupItem value="high">High</ToggleGroupItem>
                      </ToggleGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="autoSaveEnabled"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center space-x-3 space-y-0 rounded-lg border border-muted/30 p-3 bg-muted">
                    <FormControl>
                      <Checkbox
                        checked={settings.autoSaveEnabled}
                        onCheckedChange={v => handleFieldChange("autoSaveEnabled", v)}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Auto-save Game Progress</FormLabel>
                      <FormDescription>
                        Automatically save your progress in games
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button type="submit" className="bg-arcade-blue hover:bg-arcade-blue/80">
            Save Settings
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default AccountSettings;