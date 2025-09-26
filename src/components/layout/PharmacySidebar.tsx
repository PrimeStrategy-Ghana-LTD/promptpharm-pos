import { useState } from "react"
import { 
  Activity, 
  Package, 
  ShoppingCart, 
  Users, 
  FileText, 
  RotateCcw, 
  Settings, 
  UserCheck,
  BarChart3,
  Plus,
  LogOut
} from "lucide-react"
import { NavLink, useLocation } from "react-router-dom"
import { useAuth } from "@/hooks/useAuth"
import { Button } from "@/components/ui/button"

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar"

const mainItems = [
  { title: "Dashboard", url: "/", icon: Activity },
  { title: "New Sale", url: "/sales", icon: ShoppingCart },
  { title: "Inventory", url: "/inventory", icon: Package },
  { title: "Purchase Stock", url: "/purchases", icon: Plus },
]

const managementItems = [
  { title: "Customers", url: "/customers", icon: Users },
  { title: "Reports", url: "/reports", icon: BarChart3 },
  { title: "Returns", url: "/returns", icon: RotateCcw },
]

const systemItems = [
  { title: "User Management", url: "/users", icon: UserCheck },
  { title: "Settings", url: "/settings", icon: Settings },
]

export function PharmacySidebar() {
  const { state } = useSidebar()
  const { signOut, user, profile } = useAuth()
  const location = useLocation()
  const currentPath = location.pathname
  const collapsed = state === "collapsed"

  // Role-based navigation items
  const getFilteredMainItems = () => {
    return mainItems.filter(item => {
      if (item.url === '/purchases' && profile?.role === 'cashier') return false;
      return true;
    });
  };

  const getFilteredManagementItems = () => {
    return managementItems.filter(item => {
      // Remove customers for all roles since we're not storing customer data
      if (item.url === '/customers') return false;
      return true;
    });
  };

  const getFilteredSystemItems = () => {
    return systemItems.filter(item => {
      if (item.url === '/users' && (profile?.role === 'cashier' || profile?.role === 'pharmacist')) return false;
      return true;
    });
  };

  const filteredMainItems = getFilteredMainItems();
  const filteredManagementItems = getFilteredManagementItems();
  const filteredSystemItems = getFilteredSystemItems();

  const isActive = (path: string) => currentPath === path
  const isExpanded = [...filteredMainItems, ...filteredManagementItems, ...filteredSystemItems].some((i) => isActive(i.url))
  const getNavCls = ({ isActive }: { isActive: boolean }) =>
    isActive ? "bg-primary/10 text-primary font-medium border-r-2 border-primary" : "hover:bg-muted/50"

  return (
    <Sidebar
      collapsible="icon"
    >
      <SidebarContent className="bg-gradient-to-b from-background to-muted/30">
        <div className="p-4 border-b">
          {!collapsed && (
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center">
                <Plus className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="font-semibold text-lg">PharmaPOS</h2>
                <p className="text-xs text-muted-foreground">Pharmacy Management</p>
              </div>
            </div>
          )}
        </div>

        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredMainItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink to={item.url} end className={getNavCls}>
                      <item.icon className="mr-3 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {filteredManagementItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>Management</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredManagementItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="mr-3 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        {filteredSystemItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupLabel>System</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredSystemItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink to={item.url} className={getNavCls}>
                        <item.icon className="mr-3 h-4 w-4" />
                        {!collapsed && <span>{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <div className="mt-auto p-4 border-t">
          {!collapsed && (
            <div className="space-y-2">
              <div className="text-sm text-muted-foreground truncate">
                {profile?.full_name || user?.email}
              </div>
              <div className="text-xs text-muted-foreground">
                {profile?.role && (
                  <span className="capitalize bg-primary/10 px-2 py-1 rounded-full">
                    {profile.role}
                  </span>
                )}
              </div>
              <Button
                onClick={signOut}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Sign Out
              </Button>
            </div>
          )}
        </div>
      </SidebarContent>
    </Sidebar>
  )
}