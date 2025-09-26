import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { AddUserDialog } from "@/components/dialogs/AddUserDialog"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { 
  UserCheck, 
  Plus,
  Shield,
  Activity,
  Edit,
  Trash2,
  Eye,
  Clock,
  Users as UsersIcon
} from "lucide-react"

const recentActivity = [
  { user: "Dr. Sarah Wilson", action: "Processed sale TXN001", time: "10 minutes ago" },
  { user: "Mike Johnson", action: "Added new customer", time: "25 minutes ago" },
  { user: "Emily Davis", action: "Updated inventory", time: "1 hour ago" },
  { user: "Dr. Sarah Wilson", action: "Generated monthly report", time: "2 hours ago" },
]

const rolePermissions = {
  "Admin": ["All Access"],
  "Pharmacist": ["Sales", "Inventory", "Customers", "Reports", "Returns", "Purchases"],
  "Cashier": ["Sales", "Customers"],
  "Manager": ["Sales", "Inventory", "Customers", "Reports", "Returns", "Users"]
}

export default function Users() {
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [currentUser, setCurrentUser] = useState<any>(null) // <-- ADDED
  const { toast } = useToast()

  const fetchUsers = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Error fetching users:', error)
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  // <-- ADDED: fetch current user's role so we can hide AddUserDialog for non-admins
  const fetchCurrentUser = async () => {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return
    const { data, error } = await supabase
      .from('profiles')
      .select('id, role')
      .eq('id', user.id)
      .single()
    if (!error && data) {
      setCurrentUser(data)
    }
  }

  useEffect(() => {
    fetchUsers()
    fetchCurrentUser() // <-- ADDED
  }, [])

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .delete()
        .eq('id', userId)

      if (error) throw error
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      })
      
      fetchUsers()
      if (selectedUser?.id === userId) {
        setSelectedUser(null)
      }
    } catch (error) {
      console.error('Error deleting user:', error)
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      })
    }
  }

  const handleEditUser = (user: any) => {
    // Implement edit functionality
    toast({
      title: "Info",
      description: "Edit functionality will be implemented soon",
    })
  }

  const handleViewActivity = (user: any) => {
    // Implement view activity functionality
    toast({
      title: "Info",
      description: "Activity view will be implemented soon",
    })
  }

  const handleViewAllActivity = () => {
    // Implement view all activity functionality
    toast({
      title: "Info",
      description: "All activity view will be implemented soon",
    })
  }

  const filteredUsers = users.filter(user =>
    user.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getRoleColor = (role: string) => {
    const roleLower = role?.toLowerCase() || ''
    switch (roleLower) {
      case "admin": return "bg-red-100 text-red-800"
      case "pharmacist": return "bg-blue-100 text-blue-800" 
      case "manager": return "bg-purple-100 text-purple-800"
      case "cashier": return "bg-green-100 text-green-800"
      default: return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusColor = (status: string) => {
    return status === "active" ? "bg-success/10 text-success" : "bg-muted text-muted-foreground"
  }

  const activeUsers = users.filter(u => u.status === "active").length
  const totalSalesVolume = users.reduce((sum, u) => sum + (u.total_sales || 0), 0)

  return (
    <div className="p-6 space-y-6 bg-gradient-bg min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage staff accounts and permissions</p>
        </div>
        {/* <-- ONLY change: show AddUserDialog only if current user is admin */}
        {currentUser?.role === "admin" && (
          <AddUserDialog onUserAdded={fetchUsers} />
        )}
      </div>

      {/* User Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <UsersIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{users.length}</p>
                <p className="text-sm text-muted-foreground">Total Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <Activity className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">{activeUsers}</p>
                <p className="text-sm text-muted-foreground">Active Users</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Shield className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary">3</p>
                <p className="text-sm text-muted-foreground">Roles</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-warning/10 rounded-lg">
                <UserCheck className="h-5 w-5 text-warning" />
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">${(totalSalesVolume/1000).toFixed(0)}k</p>
                <p className="text-sm text-muted-foreground">Total Sales Volume</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* User List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5" />
                Staff Directory
              </CardTitle>
              <CardDescription>Manage user accounts and permissions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="Search users by name, email, or role..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button variant="outline">
                  Filter
                </Button>
              </div>

              <div className="space-y-3">
                {loading ? (
                  <p className="text-center text-muted-foreground">Loading users...</p>
                ) : filteredUsers.length === 0 ? (
                  <p className="text-center text-muted-foreground">No users found</p>
                ) : filteredUsers.map((user) => (
                  <div 
                    key={user.id}
                    className={`p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer ${
                      selectedUser?.id === user.id ? 'bg-primary/5 border-primary' : ''
                    }`}
                    onClick={() => setSelectedUser(user)}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
                          {user.full_name?.split(' ').map((n: string) => n.charAt(0)).join('')}
                        </div>
                        <div>
                          <h3 className="font-semibold">{user.full_name}</h3>
                          <p className="text-sm text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getRoleColor(user.role)}>
                          {user.role}
                        </Badge>
                        <Badge className={getStatusColor(user.status)}>
                          {user.status}
                        </Badge>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-2">
                        <Clock className="h-3 w-3" />
                        <span>Last login: {user.last_login ? new Date(user.last_login).toLocaleString() : 'Never'}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Activity className="h-3 w-3" />
                        <span>Sales: ${(user.total_sales || 0).toLocaleString()}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <div className="flex gap-1">
                        {(user.permissions || []).slice(0, 3).map((perm: string, index: number) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {perm}
                          </Badge>
                        ))}
                        {(user.permissions || []).length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{(user.permissions || []).length - 3}
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewActivity(user);
                          }}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                        <Button 
                          variant="outline" 
                          size="icon" 
                          className="h-7 w-7"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditUser(user);
                          }}
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="h-7 w-7 text-destructive hover:text-destructive"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteUser(user.id);
                          }}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* User Details */}
          {selectedUser ? (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  User Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                    {selectedUser.full_name?.split(' ').map((n: string) => n.charAt(0)).join('')}
                  </div>
                  <h3 className="font-semibold text-lg">{selectedUser.full_name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.email}</p>
                  <div className="flex justify-center gap-2 mt-2">
                    <Badge className={getRoleColor(selectedUser.role)}>
                      {selectedUser.role}
                    </Badge>
                    <Badge className={getStatusColor(selectedUser.status)}>
                      {selectedUser.status}
                    </Badge>
                  </div>
                </div>

                <div className="space-y-3 text-sm">
                  <div>
                    <span className="font-medium">User ID:</span>
                    <span className="ml-2 text-muted-foreground">{selectedUser.id}</span>
                  </div>
                  <div>
                    <span className="font-medium">Join Date:</span>
                    <span className="ml-2 text-muted-foreground">
                      {selectedUser.join_date ? new Date(selectedUser.join_date).toLocaleDateString() : 'N/A'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Last Login:</span>
                    <span className="ml-2 text-muted-foreground">
                      {selectedUser.last_login ? new Date(selectedUser.last_login).toLocaleString() : 'Never'}
                    </span>
                  </div>
                  <div>
                    <span className="font-medium">Total Sales:</span>
                    <span className="ml-2 text-primary font-semibold">${(selectedUser.total_sales || 0).toLocaleString()}</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Permissions</h4>
                  <div className="flex flex-wrap gap-1">
                    {(selectedUser.permissions || []).map((perm: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    size="sm"
                    onClick={() => handleEditUser(selectedUser)}
                  >
                    Edit User
                  </Button>
                  <Button 
                    variant="outline" 
                    className="flex-1" 
                    size="sm"
                    onClick={() => handleViewActivity(selectedUser)}
                  >
                    View Activity
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <UsersIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a user to view details</p>
              </CardContent>
            </Card>
          )}

          {/* Role Permissions */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Role Permissions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {Object.entries(rolePermissions).map(([role, permissions]) => (
                <div key={role} className="space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                  <Badge className={getRoleColor(role)} variant="secondary">{role}</Badge>
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {permissions.map((perm, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {perm}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentActivity.map((activity, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-sm font-medium">{activity.user}</p>
                  <p className="text-xs text-muted-foreground">{activity.action}</p>
                  <p className="text-xs text-muted-foreground">{activity.time}</p>
                </div>
              ))}
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full"
                onClick={handleViewAllActivity}
              >
                View All Activity
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
