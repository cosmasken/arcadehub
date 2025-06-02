
import React from "react";
import { ShoppingCart, Trophy, Settings, BarChart3, Pause } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";

interface GameSidebarProps {
  activeSection: string;
  onSectionChange: (section: string) => void;
  onPauseGame: () => void;
  points: number;
  pointsPerSecond: number;
}

const sidebarItems = [
  { id: "shop", title: "Shop", icon: ShoppingCart },
  { id: "achievements", title: "Achievements", icon: Trophy },
  { id: "stats", title: "Statistics", icon: BarChart3 },
  { id: "settings", title: "Settings", icon: Settings },
];

export const GameSidebar: React.FC<GameSidebarProps> = ({
  activeSection,
  onSectionChange,
  onPauseGame,
  points,
  pointsPerSecond
}) => {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";

  return (
    <Sidebar className={isCollapsed ? "w-16" : "w-64"} collapsible="icon">
      <SidebarHeader className="p-4 border-b">
        <div className={`${isCollapsed ? "text-center" : ""}`}>
          <div className="text-2xl">🍯</div>
          {!isCollapsed && (
            <div className="mt-2 space-y-1">
              <div className="text-sm font-semibold text-amber-800">
                🍯 {Math.floor(points)}
              </div>
              <div className="text-xs text-amber-600">
                {pointsPerSecond.toFixed(1)}/s
              </div>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Game Menu</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarItems.map((item) => (
                <SidebarMenuItem key={item.id}>
                  <SidebarMenuButton
                    onClick={() => onSectionChange(item.id)}
                    isActive={activeSection === item.id}
                    className="w-full justify-start"
                  >
                    <item.icon className="h-4 w-4" />
                    {!isCollapsed && <span>{item.title}</span>}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <Button
                  onClick={onPauseGame}
                  variant="outline"
                  size="sm"
                  className="w-full justify-start"
                >
                  <Pause className="h-4 w-4" />
                  {!isCollapsed && <span>Pause Game</span>}
                </Button>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
};
