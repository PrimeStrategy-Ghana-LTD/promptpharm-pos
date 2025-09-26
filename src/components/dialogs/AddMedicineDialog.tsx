import { useState } from "react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Save, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Medicine {
  name: string
  dosage: string
  form: string
  brand: string
  batchNumber: string
  stock: number
  minStock: number
  buyingPrice: number
  sellingPrice: number
  expiry: string
  supplier: string
}

interface AddMedicineDialogProps {
  onAddMedicine: (medicine: Medicine) => void
}

export default function AddMedicineDialog({ onAddMedicine }: AddMedicineDialogProps) {
  const [open, setOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState<Medicine>({
    name: "",
    dosage: "",
    form: "Tablet",
    brand: "",
    batchNumber: "",
    stock: 0,
    minStock: 10,
    buyingPrice: 0,
    sellingPrice: 0,
    expiry: "",
    supplier: ""
  })

  const medicineTypes = ["Tablet", "Capsule", "Syrup", "Injection", "Cream", "Drops", "Inhaler", "Patch"]
  const sampleSuppliers = ["MediCorp Ltd", "PharmaCorp", "HealthSupply Co", "Global Pharma", "MedSource Inc"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name || !formData.brand || !formData.batchNumber || !formData.expiry) {
      toast({ title: "Validation Error", description: "Please fill in all required fields", variant: "destructive" })
      return
    }
    if (formData.sellingPrice <= formData.buyingPrice) {
      toast({ title: "Pricing Error", description: "Selling price must be higher than buying price", variant: "destructive" })
      return
    }
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 500))
      onAddMedicine(formData)
      toast({ title: "Medicine Added", description: `${formData.name} has been added to inventory` })
      setFormData({ name: "", dosage: "", form: "Tablet", brand: "", batchNumber: "", stock: 0, minStock: 10, buyingPrice: 0, sellingPrice: 0, expiry: "", supplier: "" })
      setOpen(false)
    } catch (error) {
      toast({ title: "Error", description: "Failed to add medicine. Please try again.", variant: "destructive" })
    } finally { setIsLoading(false) }
  }

  const calculateMargin = () => formData.buyingPrice > 0 ? (((formData.sellingPrice - formData.buyingPrice) / formData.buyingPrice) * 100).toFixed(1) : "0"

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-gradient-primary hover:bg-primary-dark"><Plus className="mr-2 h-4 w-4" /> Add Medicine</Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><Plus className="h-5 w-5" /> Add New Medicine</DialogTitle>
          <DialogDescription>Enter the details for the new medicine to add to your inventory</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Medicine Name *</Label>
              <Input id="name" placeholder="Paracetamol" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="brand">Brand *</Label>
              <Input id="brand" placeholder="Panadol" value={formData.brand} onChange={(e) => setFormData({ ...formData, brand: e.target.value })} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage/Strength</Label>
              <Input id="dosage" placeholder="500mg" value={formData.dosage} onChange={(e) => setFormData({ ...formData, dosage: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="form">Form</Label>
              <select id="form" className="w-full p-2 border rounded-md bg-background" value={formData.form} onChange={(e) => setFormData({ ...formData, form: e.target.value })}>
                {medicineTypes.map(type => <option key={type} value={type}>{type}</option>)}
              </select>
            </div>
          </div>

          {/* Stock & Pricing */}
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Stock</Label><Input type="number" value={formData.stock} onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><Label>Min Stock</Label><Input type="number" value={formData.minStock} onChange={(e) => setFormData({ ...formData, minStock: parseInt(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><Label>Batch Number *</Label><Input value={formData.batchNumber} onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })} required /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Expiry Date *</Label><Input type="date" value={formData.expiry} onChange={(e) => setFormData({ ...formData, expiry: e.target.value })} required /></div>
            <div className="space-y-2"><Label>Supplier</Label><select className="w-full p-2 border rounded-md bg-background" value={formData.supplier} onChange={(e) => setFormData({ ...formData, supplier: e.target.value })}><option value="">Select Supplier</option>{sampleSuppliers.map(s => <option key={s} value={s}>{s}</option>)}</select></div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><Label>Buying Price</Label><Input type="number" step="0.01" value={formData.buyingPrice} onChange={(e) => setFormData({ ...formData, buyingPrice: parseFloat(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><Label>Selling Price</Label><Input type="number" step="0.01" value={formData.sellingPrice} onChange={(e) => setFormData({ ...formData, sellingPrice: parseFloat(e.target.value) || 0 })} /></div>
            <div className="space-y-2"><Label>Profit Margin</Label><Badge variant="outline" className="w-full justify-center">{calculateMargin()}%</Badge></div>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-6 border-t">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} disabled={isLoading}><X className="mr-2 h-4 w-4" /> Cancel</Button>
            <Button type="submit" disabled={isLoading} className="bg-gradient-primary hover:bg-primary-dark"><Save className="mr-2 h-4 w-4" /> {isLoading ? "Adding..." : "Add Medicine"}</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
