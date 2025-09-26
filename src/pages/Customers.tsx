import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { supabase } from "@/integrations/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { 
  Users, 
  Search, 
  Plus,
  Phone,
  Mail,
  MapPin,
  ShoppingCart,
  Star,
  Eye
} from "lucide-react"

const recentPurchases = [
  { customerName: "John Smith", item: "Paracetamol 500mg", date: "2024-01-15", amount: 15.00 },
  { customerName: "Sarah Johnson", item: "Cough Syrup", date: "2024-01-12", amount: 9.00 },
  { customerName: "Michael Brown", item: "Vitamin C Tablets", date: "2024-01-14", amount: 25.00 },
]

export default function Customers() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [customers, setCustomers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      setCustomers(data || [])
    } catch (error) {
      console.error('Error fetching customers:', error)
      toast({
        title: "Error",
        description: "Failed to load customers",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCustomers()
  }, [])

  const filteredCustomers = customers.filter(customer =>
    customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (customer.phone || '').includes(searchQuery) ||
    (customer.email || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "VIP": return "bg-gradient-to-r from-yellow-400 to-yellow-600 text-white"
      case "Regular": return "bg-primary/10 text-primary"
      case "New": return "bg-secondary/10 text-secondary"
      default: return "bg-muted text-muted-foreground"
    }
  }

  const totalCustomers = customers.length
  const totalRevenue = customers.reduce((sum, c) => sum + (c.total_purchases || 0), 0)
  const avgSpending = totalCustomers > 0 ? totalRevenue / totalCustomers : 0

  return (
    <div className="p-6 space-y-6 bg-gradient-bg min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Customer Management</h1>
          <p className="text-muted-foreground">Manage customer relationships and track purchase history</p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-dark">
          <Plus className="mr-2 h-4 w-4" />
          Add Customer
        </Button>
      </div>

      {/* Customer Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">{totalCustomers}</p>
                <p className="text-sm text-muted-foreground">Total Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-yellow-600">{customers.filter(c => c.name).length}</p>
                <p className="text-sm text-muted-foreground">Active Customers</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-success/10 rounded-lg">
                <ShoppingCart className="h-5 w-5 text-success" />
              </div>
              <div>
                <p className="text-2xl font-bold text-success">${totalRevenue.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Total Revenue</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-card">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-secondary/10 rounded-lg">
                <Users className="h-5 w-5 text-secondary" />
              </div>
              <div>
                <p className="text-2xl font-bold text-secondary">${avgSpending.toFixed(0)}</p>
                <p className="text-sm text-muted-foreground">Avg. Spending</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Customer List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Directory
              </CardTitle>
              <CardDescription>Search and manage your customers</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="Search customers by name, phone, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1"
                />
                <Button>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-3">
                {loading ? (
                  <p className="text-center text-muted-foreground">Loading customers...</p>
                ) : filteredCustomers.map((customer) => (
                  <div 
                    key={customer.id}
                    className={`p-4 border rounded-lg hover:bg-muted/30 transition-colors cursor-pointer ${
                      selectedCustomer?.id === customer.id ? 'bg-primary/5 border-primary' : ''
                    }`}
                    onClick={() => setSelectedCustomer(customer)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-semibold">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{customer.name}</h3>
                          <p className="text-sm text-muted-foreground">#{customer.id.slice(0, 8)}</p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span>{customer.phone || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Mail className="h-3 w-3" />
                        <span>{customer.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <ShoppingCart className="h-3 w-3" />
                        <span>{customer.total_purchases || 0} purchases</span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-3 w-3" />
                        <span>{customer.address || 'N/A'}</span>
                      </div>
                    </div>
                    
                    <div className="flex justify-between items-center mt-3 pt-3 border-t">
                      <span className="text-sm text-muted-foreground">
                        Total Spent: <span className="font-semibold text-primary">${(customer.total_purchases || 0).toFixed(2)}</span>
                      </span>
                      <span className="text-xs text-muted-foreground">
                        Last visit: {customer.last_visit ? new Date(customer.last_visit).toLocaleDateString() : 'N/A'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Customer Details & Recent Activity */}
        <div className="space-y-6">
          {/* Customer Profile */}
          {selectedCustomer ? (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Customer Details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-3">
                    {selectedCustomer.name.charAt(0)}
                  </div>
                  <h3 className="font-semibold text-lg">{selectedCustomer.name}</h3>
                  <Badge className={getStatusColor(selectedCustomer.status)}>
                    {selectedCustomer.status}
                  </Badge>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedCustomer.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedCustomer.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{selectedCustomer.address}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-center pt-4 border-t">
                  <div>
                    <p className="text-2xl font-bold text-primary">{selectedCustomer.totalPurchases}</p>
                    <p className="text-xs text-muted-foreground">Purchases</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-secondary">{selectedCustomer.loyaltyPoints}</p>
                    <p className="text-xs text-muted-foreground">Points</p>
                  </div>
                </div>

                <Button className="w-full" variant="outline">
                  View Purchase History
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Card className="shadow-card">
              <CardContent className="p-8 text-center text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>Select a customer to view details</p>
              </CardContent>
            </Card>
          )}

          {/* Recent Activity */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Recent Purchases
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {recentPurchases.map((purchase, index) => (
                <div key={index} className="p-3 bg-muted/30 rounded-lg">
                  <div className="flex justify-between items-start mb-1">
                    <h4 className="font-medium text-sm">{purchase.customerName}</h4>
                    <span className="text-sm font-semibold text-primary">${purchase.amount}</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{purchase.item}</p>
                  <p className="text-xs text-muted-foreground">{purchase.date}</p>
                </div>
              ))}
              <Button variant="outline" size="sm" className="w-full">
                View All Purchases
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}