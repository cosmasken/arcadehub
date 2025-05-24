
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Code, CoinsIcon, UploadCloud, BarChart4, Settings } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

const Developers = () => {
  // State to track active section
  const [activeTab, setActiveTab] = useState("games");
  
  // Mock data for developer games
  const developerGames = [
    { id: 1, title: "Star Blaster", status: "Live", plays: 15432, revenue: 500 },
    { id: 2, title: "Puzzle Pop", status: "Live", plays: 12050, revenue: 320 },
    { id: 3, title: "New Game", status: "Pending", plays: 0, revenue: 0 },
  ];

  // Mock analytics data
  const analyticsData = {
    totalPlays: 27482,
    newPlayers: 1204,
    avgPlayTime: "4m 12s",
    peakHours: "18:00 - 20:00",
    deviceBreakdown: [
      { device: "Mobile", percentage: 65 },
      { device: "Desktop", percentage: 30 },
      { device: "Tablet", percentage: 5 },
    ],
    dailyPlays: [150, 220, 180, 250, 300, 280, 320]
  };

  // Form for uploading a new game
  const uploadForm = useForm({
    defaultValues: {
      title: "",
      description: "",
      genre: "arcade",
      tokenIntegration: false,
    }
  });

  // Form for settings
  const settingsForm = useForm({
    defaultValues: {
      displayName: "GameDevStudio",
      email: "developer@example.com",
      website: "https://gamedev.example.com",
      notifyOnPlay: true,
      notifyOnRevenue: true,
      notifyOnReview: true,
      autoWithdraw: false,
    }
  });

  // Handle upload form submission
  const onUploadSubmit = (data) => {
    console.log("Upload form data:", data);
    toast.success("Game uploaded successfully! It will be reviewed shortly.");
  };

  // Handle settings form submission
  const onSettingsSubmit = (data) => {
    console.log("Settings form data:", data);
    toast.success("Settings updated successfully!");
  };

  // Function to render the active section
  const renderContent = () => {
    switch (activeTab) {
      case "games":
        return (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">My Games</h2>
              <Button className="bg-primary text-white" onClick={() => setActiveTab("upload")}>
                <UploadCloud size={18} className="mr-2" /> Upload New Game
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Game Management</CardTitle>
                <CardDescription>Manage your games and track performance</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Plays</TableHead>
                      <TableHead>Revenue (ARC)</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {developerGames.map((game) => (
                      <TableRow key={game.id}>
                        <TableCell className="font-medium">{game.title}</TableCell>
                        <TableCell>
                          <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                            game.status === "Live" ? "bg-green-500/20 text-green-500" : "bg-yellow-500/20 text-yellow-500"
                          }`}>
                            {game.status}
                          </span>
                        </TableCell>
                        <TableCell>{game.plays.toLocaleString()}</TableCell>
                        <TableCell>{game.revenue} ARC</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="outline" size="sm">Edit</Button>
                            <Button variant="outline" size="sm" className="text-red-500">Delete</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Revenue</CardTitle>
                  <CardDescription>All time earnings</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">820 ARC</div>
                  <p className="text-green-500 text-sm">+15% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Pending Payouts</CardTitle>
                  <CardDescription>Ready to claim</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">200 ARC</div>
                  <Button className="mt-2 bg-accent text-accent-foreground">Claim Now</Button>
                </CardContent>
              </Card>
            </div>
          </>
        );
      
      case "analytics":
        return (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Analytics</h2>
              <div className="flex gap-3">
                <Button variant="outline">Daily</Button>
                <Button variant="outline">Weekly</Button>
                <Button variant="outline">Monthly</Button>
                <Button variant="outline">Export</Button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Total Plays</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analyticsData.totalPlays.toLocaleString()}</div>
                  <p className="text-green-500 text-sm">+8% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>New Players</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analyticsData.newPlayers.toLocaleString()}</div>
                  <p className="text-green-500 text-sm">+12% from last month</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle>Avg. Play Time</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{analyticsData.avgPlayTime}</div>
                  <p className="text-green-500 text-sm">+2% from last month</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
              <Card className="col-span-1 md:col-span-2">
                <CardHeader>
                  <CardTitle>Daily Player Activity</CardTitle>
                  <CardDescription>Last 7 days</CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <div className="w-full h-full bg-muted/20 rounded-md flex items-center justify-center">
                    <div className="flex h-64 w-full items-end justify-between px-4">
                      {analyticsData.dailyPlays.map((plays, index) => (
                        <div key={index} className="flex flex-col items-center">
                          <div 
                            className="bg-primary w-12 rounded-t-md" 
                            style={{ height: `${plays / 4}px` }}
                          ></div>
                          <span className="text-xs mt-2">Day {index + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Device Breakdown</CardTitle>
                  <CardDescription>Player device types</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.deviceBreakdown.map((device) => (
                      <div key={device.device}>
                        <div className="flex justify-between mb-1">
                          <span>{device.device}</span>
                          <span>{device.percentage}%</span>
                        </div>
                        <div className="w-full bg-muted rounded-full h-2.5">
                          <div className="bg-primary h-2.5 rounded-full" style={{ width: `${device.percentage}%` }}></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Peak Hours</CardTitle>
                  <CardDescription>Most active time periods</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold">{analyticsData.peakHours}</div>
                  <p className="text-muted-foreground">Players are most active during evening hours</p>
                  <div className="mt-4">
                    <Button variant="outline" className="w-full">View Detailed Breakdown</Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </>
        );
      
      case "upload":
        return (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Upload Game</h2>
            </div>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>New Game Information</CardTitle>
                <CardDescription>
                  Fill out the details for your new game. All games go through a review process before being published.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={uploadForm.handleSubmit(onUploadSubmit)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="title">Game Title</Label>
                        <Input 
                          id="title" 
                          placeholder="Enter your game's name"
                          {...uploadForm.register("title")}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="genre">Genre</Label>
                        <select 
                          id="genre" 
                          className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          {...uploadForm.register("genre")}
                        >
                          <option value="arcade">Arcade</option>
                          <option value="puzzle">Puzzle</option>
                          <option value="action">Action</option>
                          <option value="racing">Racing</option>
                          <option value="adventure">Adventure</option>
                        </select>
                      </div>
                      
                      <div>
                        <Label htmlFor="description">Game Description</Label>
                        <textarea 
                          id="description" 
                          className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                          placeholder="Describe your game in detail..."
                          {...uploadForm.register("description")}
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div>
                        <Label>Game Thumbnail</Label>
                        <div className="mt-2 border-2 border-dashed border-muted rounded-lg p-8 text-center">
                          <UploadCloud className="w-10 h-10 mx-auto text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            Drag and drop your thumbnail image, or click to browse
                          </p>
                          <Button type="button" variant="outline" size="sm" className="mt-4">
                            Select File
                          </Button>
                          <p className="mt-1 text-xs text-muted-foreground">
                            PNG, JPG, GIF up to 2MB
                          </p>
                        </div>
                      </div>
                      
                      <div>
                        <Label>Game Files</Label>
                        <div className="mt-2 border-2 border-dashed border-muted rounded-lg p-8 text-center">
                          <UploadCloud className="w-10 h-10 mx-auto text-muted-foreground" />
                          <p className="mt-2 text-sm text-muted-foreground">
                            Drag and drop your game files, or click to browse
                          </p>
                          <Button type="button" variant="outline" size="sm" className="mt-4">
                            Select Files
                          </Button>
                          <p className="mt-1 text-xs text-muted-foreground">
                            HTML5 game files or IPFS hash
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input 
                          type="checkbox" 
                          id="tokenIntegration" 
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          {...uploadForm.register("tokenIntegration")}
                        />
                        <Label htmlFor="tokenIntegration">Enable ARC token integration</Label>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="button" variant="outline" className="mr-2" onClick={() => setActiveTab("games")}>
                      Cancel
                    </Button>
                    <Button type="submit" className="bg-primary">
                      Upload Game
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </>
        );
      
      case "settings":
        return (
          <>
            <div className="flex justify-between items-center">
              <h2 className="text-3xl font-bold">Developer Settings</h2>
            </div>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>
                  Manage your developer profile and preferences
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form className="space-y-6" onSubmit={settingsForm.handleSubmit(onSettingsSubmit)}>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Profile Information</h3>
                      
                      <div>
                        <Label htmlFor="displayName">Display Name</Label>
                        <Input 
                          id="displayName" 
                          {...settingsForm.register("displayName")}
                        />
                        <p className="text-sm text-muted-foreground mt-1">
                          This is how your name will appear on your games
                        </p>
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Contact Email</Label>
                        <Input 
                          id="email" 
                          type="email" 
                          {...settingsForm.register("email")}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="website">Website</Label>
                        <Input 
                          id="website" 
                          type="url" 
                          {...settingsForm.register("website")}
                        />
                      </div>
                      
                      <div>
                        <Label>Developer Avatar</Label>
                        <div className="mt-2 flex items-center space-x-4">
                          <div className="h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                            <Code size={24} />
                          </div>
                          <Button type="button" variant="outline" size="sm">
                            Change Avatar
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Notification Preferences</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Game Play Notifications</p>
                          <p className="text-sm text-muted-foreground">Get notified when someone plays your game</p>
                        </div>
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          {...settingsForm.register("notifyOnPlay")}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Revenue Notifications</p>
                          <p className="text-sm text-muted-foreground">Get notified when you receive ARC tokens</p>
                        </div>
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          {...settingsForm.register("notifyOnRevenue")}
                        />
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Review Notifications</p>
                          <p className="text-sm text-muted-foreground">Get notified when someone reviews your game</p>
                        </div>
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          {...settingsForm.register("notifyOnReview")}
                        />
                      </div>
                      
                      <h3 className="text-lg font-medium pt-2">Payment Settings</h3>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">Automatic Withdrawals</p>
                          <p className="text-sm text-muted-foreground">Automatically withdraw ARC tokens when reaching 500 ARC</p>
                        </div>
                        <input 
                          type="checkbox" 
                          className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          {...settingsForm.register("autoWithdraw")}
                        />
                      </div>
                      
                      <div>
                        <Button type="button" variant="outline" className="w-full">
                          Connect Wallet
                        </Button>
                        <p className="text-sm text-muted-foreground mt-1 text-center">
                          Connect your wallet to receive ARC token payments
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex justify-end">
                    <Button type="button" variant="outline" className="mr-2">
                      Restore Defaults
                    </Button>
                    <Button type="submit" className="bg-primary">
                      Save Settings
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </>
        );
      
      default:
        return <div>Select a section from the sidebar</div>;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Sidebar */}
            <aside className="w-full md:w-64 bg-card rounded-lg border border-muted/20 p-4 h-fit">
              <h3 className="font-bold mb-4">Developer Portal</h3>
              <nav className="space-y-2">
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${activeTab === "upload" ? "bg-muted/50" : ""}`}
                  onClick={() => setActiveTab("upload")}
                >
                  <UploadCloud size={18} className="mr-2" />
                  Upload Game
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${activeTab === "games" ? "bg-muted/50" : ""}`}
                  onClick={() => setActiveTab("games")}
                >
                  <Code size={18} className="mr-2" />
                  My Games
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${activeTab === "analytics" ? "bg-muted/50" : ""}`}
                  onClick={() => setActiveTab("analytics")}
                >
                  <BarChart4 size={18} className="mr-2" />
                  Analytics
                </Button>
                <Button 
                  variant="ghost" 
                  className={`w-full justify-start ${activeTab === "settings" ? "bg-muted/50" : ""}`}
                  onClick={() => setActiveTab("settings")}
                >
                  <Settings size={18} className="mr-2" />
                  Settings
                </Button>
              </nav>
            </aside>

            {/* Main content */}
            <div className="flex-1 space-y-6">
              {renderContent()}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Developers;
