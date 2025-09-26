import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useAuth } from "@/hooks/useAuth"
import { supabase } from "@/integrations/supabase/client"
import { toast } from "sonner"
import { 
  Plus, 
  Package,
  Truck,
  Calendar,
  DollarSign,
  Search,
  Loader2
} from "lucide-react"

interface Supplier {
  id: string;
  name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
}

interface PurchaseItem {
  id: string;
  medicine: string;
  dosage: string;
  quantity: number;
  batchNumber: string;
  expiryDate: string;
  unitCost: number;
  totalCost: number;
}

export default function PurchasesConnected() {
  const { user, profile } = useAuth();
  const navigate = useNavigate();
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [selectedSupplier, setSelectedSupplier] = useState("");
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingSuppliers, setLoadingSuppliers] = useState(true);
  const [newItem, setNewItem] = useState({
    medicine: "",
    dosage: "",
    quantity: "",
    batchNumber: "",
    expiryDate: "",
    unitCost: ""
  });

  useEffect(() => {
    fetchSuppliers();
  }, []);

  const fetchSuppliers = async () => {
    try {
      const { data, error } = await supabase
        .from('suppliers')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setSuppliers(data || []);
    } catch (error) {
      console.error('Error fetching suppliers:', error);
      toast.error('Failed to load suppliers');
    } finally {
      setLoadingSuppliers(false);
    }
  };

  const addItemToPurchase = () => {
    if (newItem.medicine && newItem.quantity && newItem.unitCost) {
      const totalCost = parseFloat(newItem.unitCost) * parseInt(newItem.quantity);
      const item: PurchaseItem = {
        id: Date.now().toString(),
        medicine: newItem.medicine,
        dosage: newItem.dosage,
        quantity: parseInt(newItem.quantity),
        batchNumber: newItem.batchNumber,
        expiryDate: newItem.expiryDate,
        unitCost: parseFloat(newItem.unitCost),
        totalCost
      };
      
      setPurchaseItems([...purchaseItems, item]);
      setNewItem({
        medicine: "",
        dosage: "",
        quantity: "",
        batchNumber: "",
        expiryDate: "",
        unitCost: ""
      });
    }
  };

  const removeItem = (id: string) => {
    setPurchaseItems(purchaseItems.filter(item => item.id !== id));
  };

  const totalPurchaseAmount = purchaseItems.reduce((total, item) => total + item.totalCost, 0);

  const completePurchase = async () => {
    if (!selectedSupplier || purchaseItems.length === 0 || !user) {
      toast.error('Please select a supplier and add items');
      return;
    }

    setIsLoading(true);

    try {
      // Generate order number
      const orderNumber = `PO-${Date.now()}`;

      // Create purchase order
      const { data: purchaseOrder, error: orderError } = await supabase
        .from('purchase_orders')
        .insert({
          order_number: orderNumber,
          supplier_id: selectedSupplier,
          ordered_by: user.id,
          total_amount: totalPurchaseAmount,
          status: 'pending'
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create purchase items
      const items = purchaseItems.map(item => ({
        purchase_order_id: purchaseOrder.id,
        medicine_name: `${item.medicine} ${item.dosage}`,
        quantity: item.quantity,
        unit_cost: item.unitCost,
        total_cost: item.totalCost
      }));

      const { error: itemsError } = await supabase
        .from('purchase_items')
        .insert(items);

      if (itemsError) throw itemsError;

      toast.success('Purchase order created successfully!');
      
      // Navigate to completion page
      navigate(`/purchase-complete?order=${orderNumber}&amount=${totalPurchaseAmount}&items=${purchaseItems.length}`);
      
    } catch (error) {
      console.error('Error creating purchase order:', error);
      toast.error('Failed to create purchase order');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-3 md:p-6 space-y-6 bg-gradient-bg min-h-full">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold">Purchase Stock</h1>
          <p className="text-muted-foreground">Record new stock purchases from suppliers</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* New Purchase Form */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="h-5 w-5" />
                New Stock Purchase
              </CardTitle>
              <CardDescription>Add new stock to your inventory</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Supplier Selection */}
              <div className="space-y-2">
                <Label>Supplier</Label>
                {loadingSuppliers ? (
                  <div className="flex items-center gap-2 p-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Loading suppliers...
                  </div>
                ) : (
                  <Select value={selectedSupplier} onValueChange={setSelectedSupplier}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Supplier" />
                    </SelectTrigger>
                    <SelectContent>
                      {suppliers.map(supplier => (
                        <SelectItem key={supplier.id} value={supplier.id}>
                          {supplier.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              {/* Add Medicine Form */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Medicine Name</Label>
                  <Input
                    placeholder="Enter medicine name"
                    value={newItem.medicine}
                    onChange={(e) => setNewItem({...newItem, medicine: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Dosage/Form</Label>
                  <Input
                    placeholder="e.g., 500mg Tablet"
                    value={newItem.dosage}
                    onChange={(e) => setNewItem({...newItem, dosage: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Quantity</Label>
                  <Input
                    type="number"
                    placeholder="Enter quantity"
                    value={newItem.quantity}
                    onChange={(e) => setNewItem({...newItem, quantity: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Unit Cost ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={newItem.unitCost}
                    onChange={(e) => setNewItem({...newItem, unitCost: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Batch Number</Label>
                  <Input
                    placeholder="Enter batch number"
                    value={newItem.batchNumber}
                    onChange={(e) => setNewItem({...newItem, batchNumber: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Expiry Date</Label>
                  <Input
                    type="date"
                    value={newItem.expiryDate}
                    onChange={(e) => setNewItem({...newItem, expiryDate: e.target.value})}
                  />
                </div>
              </div>

              <Button 
                onClick={addItemToPurchase}
                disabled={!newItem.medicine || !newItem.quantity || !newItem.unitCost}
                className="w-full"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add to Purchase
              </Button>
            </CardContent>
          </Card>

          {/* Purchase Items List */}
          {purchaseItems.length > 0 && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle>Purchase Items ({purchaseItems.length})</CardTitle>
                <CardDescription>Items to be added to inventory</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {purchaseItems.map((item) => (
                    <div key={item.id} className="flex flex-col md:flex-row md:items-center justify-between p-3 border rounded-lg gap-3">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.medicine}</h4>
                        <p className="text-sm text-muted-foreground">
                          {item.dosage} • Qty: {item.quantity} • Batch: {item.batchNumber}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Expires: {item.expiryDate} • Unit Cost: ${item.unitCost}
                        </p>
                      </div>
                      <div className="flex items-center justify-between md:justify-end gap-3">
                        <span className="font-semibold text-primary">${item.totalCost.toFixed(2)}</span>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => removeItem(item.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Remove
                        </Button>
                      </div>
                    </div>
                  ))}
                  
                  <div className="border-t pt-3">
                    <div className="flex justify-between items-center mb-4">
                      <span className="font-semibold text-lg">Total Purchase Amount:</span>
                      <span className="font-bold text-xl text-primary">${totalPurchaseAmount.toFixed(2)}</span>
                    </div>
                    <Button 
                      onClick={completePurchase}
                      disabled={isLoading || !selectedSupplier}
                      className="w-full bg-gradient-primary hover:bg-primary-dark"
                      size="lg"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating Order...
                        </>
                      ) : (
                        'Complete Purchase & Create Order'
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Supplier Info */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Suppliers
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {loadingSuppliers ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="h-6 w-6 animate-spin" />
                </div>
              ) : suppliers.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No suppliers found</p>
              ) : (
                suppliers.slice(0, 3).map((supplier) => (
                  <div 
                    key={supplier.id}
                    className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedSupplier === supplier.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted/50'
                    }`}
                    onClick={() => setSelectedSupplier(supplier.id)}
                  >
                    <h4 className="font-medium">{supplier.name}</h4>
                    {supplier.contact_person && (
                      <p className="text-sm text-muted-foreground">{supplier.contact_person}</p>
                    )}
                    {supplier.phone && (
                      <p className="text-xs text-muted-foreground">{supplier.phone}</p>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}