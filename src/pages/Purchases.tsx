import PurchasesConnected from "./PurchasesConnected";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { 
  Plus, 
  Package,
  Truck,
  Calendar,
  DollarSign,
  Search
} from "lucide-react"

const sampleSuppliers = [
  { id: "1", name: "MediCorp Ltd", contact: "+1234567890", email: "orders@medicorp.com" },
  { id: "2", name: "PharmaCorp", contact: "+0987654321", email: "sales@pharmacorp.com" },
  { id: "3", name: "HealthSupply Co", contact: "+1122334455", email: "supply@healthsupply.com" },
]

const recentPurchases = [
  {
    id: "PO001",
    supplier: "MediCorp Ltd",
    date: "2024-01-15",
    totalAmount: 2450.00,
    items: 12,
    status: "Delivered"
  },
  {
    id: "PO002", 
    supplier: "PharmaCorp",
    date: "2024-01-12",
    totalAmount: 1850.00,
    items: 8,
    status: "Pending"
  },
  {
    id: "PO003",
    supplier: "HealthSupply Co",
    date: "2024-01-10",
    totalAmount: 3200.00,
    items: 15,
    status: "Delivered"
  },
]

export default function Purchases() {
  return <PurchasesConnected />
}