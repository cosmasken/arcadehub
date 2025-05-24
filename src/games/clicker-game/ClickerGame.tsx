import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Star } from "lucide-react";

const ClickerGame = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <main className="flex-grow pt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            {/* Game Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <Card>
                <CardHeader>
                  <CardTitle>ARC Points</CardTitle>
                  <CardDescription>Current ARC balance</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">1000 ARC</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Clicks</CardTitle>
                  <CardDescription>Total clicks made</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">500</div>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>ARC/Click</CardTitle>
                  <CardDescription>ARC earned per click</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">20 ARC</div>
                </CardContent>
              </Card>
            </div>

            {/* Upgrades Section */}
            <Card className="mb-8">
              <CardHeader>
                <CardTitle>Upgrades</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>Basic Clicker</CardTitle>
                          <span className="text-sm font-medium">Owned: 3</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">Increases ARC per click by 1</p>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-sm">Cost: 10 ARC</span>
                          <span className="text-sm">+1 ARC/Click</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>Advanced Clicker</CardTitle>
                          <span className="text-sm font-medium">Owned: 1</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">Increases ARC per click by 5</p>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-sm">Cost: 50 ARC</span>
                          <span className="text-sm">+5 ARC/Click</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                  <div className="space-y-4">
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>Auto-Clicker</CardTitle>
                          <span className="text-sm font-medium">Owned: 2</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">Generates 1 ARC per second automatically</p>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-sm">Cost: 30 ARC</span>
                          <span className="text-sm">+1 ARC/Sec</span>
                        </div>
                      </CardContent>
                    </Card>
                    <Card>
                      <CardHeader>
                        <div className="flex justify-between items-center">
                          <CardTitle>ARC Miner</CardTitle>
                          <span className="text-sm font-medium">Owned: 1</span>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-muted-foreground">Generates 5 ARC per second automatically</p>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-sm">Cost: 150 ARC</span>
                          <span className="text-sm">+5 ARC/Sec</span>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Achievements Section */}
            <Card>
              <CardHeader>
                <CardTitle>Achievements</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Star className="h-6 w-6 text-yellow-500" />
                    <div>
                      <div className="font-medium">Beginner Clicker</div>
                      <div className="text-sm text-muted-foreground">Click 10 times</div>
                      <div className="mt-2 w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="h-6 w-6 text-yellow-500" />
                    <div>
                      <div className="font-medium">Dedicated Clicker</div>
                      <div className="text-sm text-muted-foreground">Click 50 times</div>
                      <div className="mt-2 w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '100%' }} />
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Star className="h-6 w-6 text-yellow-500" />
                    <div>
                      <div className="font-medium">Click Master</div>
                      <div className="text-sm text-muted-foreground">Click 100 times</div>
                      <div className="mt-2 w-full bg-muted rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full" style={{ width: '50%' }} />
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ClickerGame;
