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
  const [activeTab, setActiveTab] = useState("games");
  
  const developerGames = [
    { id: 1, title: "Star Blaster", status: "Live", plays: 15432, revenue: 500 },
    { id: 2, title: "Puzzle Pop", status: "Live", plays: 12050, revenue: 320 },
    { id: 3, title: "New Game", status: "Pending", plays: 0, revenue: 0 },
  ];

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

  const uploadForm = useForm({
    defaultValues: {
      title: "",
      description: "",
      genre: "arcade",
      tokenIntegration: false,
    }
  });

  const settingsForm = useForm({
    defaultValues: {
      email: "",
      notifications: true,
      analytics: true,
    }
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-8">
              <Code className="w-12 h-12 mx-auto text-blue-500 mb-4" />
              <h1 className="text-3xl font-bold mb-2">Developer Dashboard</h1>
              <p className="text-muted-foreground">Manage your games and analytics</p>
            </div>

            <Tabs defaultValue="games" className="w-full">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="games" className="w-full">
                  <div className="flex items-center justify-center gap-2">
                    <Code className="h-4 w-4" />
                    <span>My Games</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="analytics" className="w-full">
                  <div className="flex items-center justify-center gap-2">
                    <BarChart4 className="h-4 w-4" />
                    <span>Analytics</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="upload" className="w-full">
                  <div className="flex items-center justify-center gap-2">
                    <UploadCloud className="h-4 w-4" />
                    <span>Upload Game</span>
                  </div>
                </TabsTrigger>
                <TabsTrigger value="settings" className="w-full">
                  <div className="flex items-center justify-center gap-2">
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </div>
                </TabsTrigger>
              </TabsList>

              <TabsContent value="games">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {developerGames.map((game) => (
                    <Card key={game.id}>
                      <CardHeader>
                        <CardTitle>{game.title}</CardTitle>
                        <CardDescription>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded-full text-xs ${
                              game.status === "Live" 
                                ? "bg-green-100 text-green-800"
                                : "bg-yellow-100 text-yellow-800"
                            }`}>
                              {game.status}
                            </span>
                            <CoinsIcon className="h-4 w-4" />
                            {game.revenue} ARC
                          </div>
                        </CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Plays</span>
                            <span>{game.plays.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-muted-foreground">Revenue</span>
                            <span>{game.revenue} ARC</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analytics">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Overview</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Total Plays</span>
                          <span>{analyticsData.totalPlays.toLocaleString()}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">New Players</span>
                          <span>+{analyticsData.newPlayers}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-muted-foreground">Average Play Time</span>
                          <span>{analyticsData.avgPlayTime}</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Device Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.deviceBreakdown.map((device) => (
                          <div key={device.device} className="flex items-center justify-between">
                            <span className="text-muted-foreground">{device.device}</span>
                            <div className="flex items-center gap-2">
                              <div className="w-full bg-muted rounded-full h-2">
                                <div 
                                  className="bg-primary h-2 rounded-full" 
                                  style={{ width: `${device.percentage}%` }}
                                />
                              </div>
                              <span>{device.percentage}%</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="upload">
                <Card>
                  <CardHeader>
                    <CardTitle>Upload New Game</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...uploadForm}>
                      <form className="space-y-4">
                        <FormField
                          control={uploadForm.control}
                          name="title"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Game Title</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter game title" {...field} />
                              </FormControl>
                              <FormDescription>
                                The name of your game
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={uploadForm.control}
                          name="description"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Description</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter game description" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={uploadForm.control}
                          name="genre"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Genre</FormLabel>
                              <FormControl>
                                <select 
                                  id="genre" 
                                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                                  {...field}
                                >
                                  <option value="arcade">Arcade</option>
                                  <option value="puzzle">Puzzle</option>
                                  <option value="racing">Racing</option>
                                  <option value="strategy">Strategy</option>
                                </select>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={uploadForm.control}
                          name="tokenIntegration"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <input 
                                  type="checkbox" 
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  {...field}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Token Integration</FormLabel>
                                <FormDescription>
                                  Enable token-based rewards
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className="w-full">
                          Upload Game
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings">
                <Card>
                  <CardHeader>
                    <CardTitle>Settings</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Form {...settingsForm}>
                      <form className="space-y-4">
                        <FormField
                          control={settingsForm.control}
                          name="email"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Email</FormLabel>
                              <FormControl>
                                <Input placeholder="Enter your email" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={settingsForm.control}
                          name="notifications"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <input 
                                  type="checkbox" 
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  {...field}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Notifications</FormLabel>
                                <FormDescription>
                                  Receive notifications for game updates
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={settingsForm.control}
                          name="analytics"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                              <FormControl>
                                <input 
                                  type="checkbox" 
                                  className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                  {...field}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>Analytics</FormLabel>
                                <FormDescription>
                                  Track game performance and player engagement
                                </FormDescription>
                              </div>
                            </FormItem>
                          )}
                        />

                        <Button type="submit" className="w-full">
                          Save Settings
                        </Button>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Developers;
