import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
import { 
  Settings as SettingsIcon,
  Building,
  Receipt,
  Shield,
  Bell,
  Database,
  Printer,
  Mail,
  Save,
  Download,
  Upload
} from "lucide-react"

export default function Settings() {
  return (
    <div className="p-6 space-y-6 bg-gradient-bg min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Configure your pharmacy management system</p>
        </div>
        <Button className="bg-gradient-primary hover:bg-primary-dark">
          <Save className="mr-2 h-4 w-4" />
          Save All Changes
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pharmacy Information */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building className="h-5 w-5" />
              Pharmacy Information
            </CardTitle>
            <CardDescription>Basic information about your pharmacy</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Pharmacy Name</Label>
                <Input placeholder="MediCare Pharmacy" defaultValue="MediCare Pharmacy" />
              </div>
              <div className="space-y-2">
                <Label>License Number</Label>
                <Input placeholder="PH-2024-001" defaultValue="PH-2024-001" />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Address</Label>
              <Input placeholder="123 Main Street, City, State" defaultValue="123 Main Street, City, State" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Phone Number</Label>
                <Input placeholder="+1 234 567 8900" defaultValue="+1 234 567 8900" />
              </div>
              <div className="space-y-2">
                <Label>Email Address</Label>
                <Input placeholder="info@pharmacy.com" defaultValue="info@pharmacy.com" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Website</Label>
              <Input placeholder="www.pharmacy.com" defaultValue="www.pharmacy.com" />
            </div>
          </CardContent>
        </Card>

        {/* Receipt Configuration */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Receipt className="h-5 w-5" />
              Receipt Settings
            </CardTitle>
            <CardDescription>Customize receipt appearance and content</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Receipt Header</Label>
              <Input placeholder="Thank you for choosing us!" defaultValue="Thank you for choosing us!" />
            </div>
            
            <div className="space-y-2">
              <Label>Receipt Footer</Label>
              <Input placeholder="Have a healthy day!" defaultValue="Have a healthy day!" />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Show Pharmacy Logo</Label>
                <p className="text-sm text-muted-foreground">Display logo on receipts</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Print Customer Info</Label>
                <p className="text-sm text-muted-foreground">Include customer details on receipt</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto Print Receipt</Label>
                <p className="text-sm text-muted-foreground">Automatically print after each sale</p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>

        {/* Tax & Pricing */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Tax & Pricing
            </CardTitle>
            <CardDescription>Configure tax rates and pricing rules</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tax Rate (%)</Label>
                <Input type="number" placeholder="10" defaultValue="10" step="0.01" />
              </div>
              <div className="space-y-2">
                <Label>Currency</Label>
                <select className="w-full p-2 border rounded-md bg-background">
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Include Tax in Display Price</Label>
                <p className="text-sm text-muted-foreground">Show tax-inclusive prices</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Round to Nearest Cent</Label>
                <p className="text-sm text-muted-foreground">Round final amounts</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label>Default Markup (%)</Label>
              <Input type="number" placeholder="30" defaultValue="30" step="0.01" />
            </div>
          </CardContent>
        </Card>

        {/* Inventory Settings */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Inventory Settings
            </CardTitle>
            <CardDescription>Configure inventory management preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Low Stock Threshold</Label>
                <Input type="number" placeholder="10" defaultValue="10" />
              </div>
              <div className="space-y-2">
                <Label>Expiry Warning (days)</Label>
                <Input type="number" placeholder="90" defaultValue="90" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Auto-update Stock on Sale</Label>
                <p className="text-sm text-muted-foreground">Automatically reduce inventory</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Track Batch Numbers</Label>
                <p className="text-sm text-muted-foreground">Enable batch tracking</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Prevent Expired Sales</Label>
                <p className="text-sm text-muted-foreground">Block selling expired items</p>
              </div>
              <Switch defaultChecked />
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications
            </CardTitle>
            <CardDescription>Configure alert and notification preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Low Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">Get notified when stock is low</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Expiry Warnings</Label>
                <p className="text-sm text-muted-foreground">Alert for expiring medicines</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Daily Sales Summary</Label>
                <p className="text-sm text-muted-foreground">Receive daily sales reports</p>
              </div>
              <Switch />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Email Notifications</Label>
                <p className="text-sm text-muted-foreground">Send alerts via email</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="space-y-2">
              <Label>Notification Email</Label>
              <Input placeholder="alerts@pharmacy.com" defaultValue="alerts@pharmacy.com" />
            </div>
          </CardContent>
        </Card>

        {/* Security Settings */}
        <Card className="shadow-card">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Security Settings
            </CardTitle>
            <CardDescription>Configure security and access preferences</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Session Timeout (minutes)</Label>
                <Input type="number" placeholder="30" defaultValue="30" />
              </div>
              <div className="space-y-2">
                <Label>Password Min Length</Label>
                <Input type="number" placeholder="8" defaultValue="8" />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Strong Passwords</Label>
                <p className="text-sm text-muted-foreground">Enforce password complexity</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Log User Activity</Label>
                <p className="text-sm text-muted-foreground">Track user actions</p>
              </div>
              <Switch defaultChecked />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Require Manager Approval</Label>
                <p className="text-sm text-muted-foreground">For high-value transactions</p>
              </div>
              <Switch />
            </div>

            <div className="space-y-2">
              <Label>Transaction Limit ($)</Label>
              <Input type="number" placeholder="1000" defaultValue="1000" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Management */}
      <Card className="shadow-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>Backup, restore, and manage your data</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-6 border rounded-lg">
              <Download className="h-8 w-8 mx-auto mb-2 text-primary" />
              <h3 className="font-medium mb-2">Backup Data</h3>
              <p className="text-sm text-muted-foreground mb-4">Export your data for backup</p>
              <Button variant="outline" size="sm">
                Create Backup
              </Button>
            </div>

            <div className="text-center p-6 border rounded-lg">
              <Upload className="h-8 w-8 mx-auto mb-2 text-secondary" />
              <h3 className="font-medium mb-2">Restore Data</h3>
              <p className="text-sm text-muted-foreground mb-4">Restore from backup file</p>
              <Button variant="outline" size="sm">
                Restore Backup
              </Button>
            </div>

            <div className="text-center p-6 border rounded-lg">
              <Database className="h-8 w-8 mx-auto mb-2 text-warning" />
              <h3 className="font-medium mb-2">Database Stats</h3>
              <p className="text-sm text-muted-foreground mb-4">View database information</p>
              <Button variant="outline" size="sm">
                View Stats
              </Button>
            </div>
          </div>

          <Separator className="my-6" />
          
          <div className="flex justify-between items-center">
            <div>
              <h3 className="font-medium">Last Backup</h3>
              <p className="text-sm text-muted-foreground">January 15, 2024 at 2:30 PM</p>
            </div>
            <Button variant="outline">
              Schedule Auto-Backup
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}