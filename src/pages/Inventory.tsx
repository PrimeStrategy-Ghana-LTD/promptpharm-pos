import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import AddMedicineDialog from "@/components/dialogs/AddMedicineDialog";
import ImportExcelDialog from "@/components/dialogs/ImportExcelDialog";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import {
  Package,
  Search,
  AlertTriangle,
  Calendar,
  Edit,
  Trash2,
  Download,
} from "lucide-react";

export default function Inventory() {
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");
  const [inventory, setInventory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchInventory = async () => {
    try {
      const { data, error } = await supabase
        .from("medicines")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setInventory(data || []);
    } catch (error) {
      console.error("Error fetching inventory:", error);
      toast({
        title: "Error",
        description: "Failed to load inventory",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInventory();
  }, []);

  const handleAddMedicine = async (newMedicine: any) => {
    try {
      const medicineData = {
        name: newMedicine.name,
        dosage: newMedicine.dosage,
        brand: newMedicine.brand,
        batch_number: newMedicine.batchNumber,
        stock_quantity: newMedicine.stock,
        min_stock_level: newMedicine.minStock,
        buying_price: newMedicine.buyingPrice,
        selling_price: newMedicine.sellingPrice,
        expiry_date: newMedicine.expiry,
        supplier: newMedicine.supplier,
        category: "over_counter",
      };

      const { data, error } = await supabase
        .from("medicines")
        .insert(medicineData)
        .select();
      if (error) throw error;
      if (data && data.length > 0) {
        setInventory([data[0], ...inventory]);
        toast({
          title: "Success",
          description: "Medicine added successfully!",
        });
      }
    } catch (error) {
      console.error("Error adding medicine:", error);
      toast({
        title: "Error",
        description: "Failed to add medicine. Check console for details.",
        variant: "destructive",
      });
    }
  };

  const downloadTemplate = () => {
    // Create template data for CSV
    const headers = [
      "name",
      "dosage",
      "brand",
      "batch_number",
      "stock_quantity",
      "min_stock_level",
      "buying_price",
      "selling_price",
      "expiry_date",
      "supplier",
      "category"
    ];
    
    const exampleData = [
      "Paracetamol",
      "500mg",
      "Generic",
      "BATCH001",
      "100",
      "10",
      "5.99",
      "9.99",
      "2024-12-31",
      "Supplier Co.",
      "over_counter"
    ];
    
    const csvContent = [
      headers.join(","),
      exampleData.join(","),
      "# Add your medicines below this line",
      "# Remove the # symbol to uncomment the line above"
    ].join("\n");
    
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "medicine_import_template.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const isLowStock = (stock: number, minStock: number) => stock <= minStock;
  const isExpiringSoon = (expiryDate: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const diffDays = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return diffDays <= 90;
  };

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.dosage?.toLowerCase().includes(searchQuery.toLowerCase());

    if (filterType === "lowStock")
      return (
        matchesSearch && isLowStock(item.stock_quantity, item.min_stock_level)
      );
    if (filterType === "expiring")
      return matchesSearch && isExpiringSoon(item.expiry_date);
    return matchesSearch;
  });

  const lowStockCount = inventory.filter((item) =>
    isLowStock(item.stock_quantity, item.min_stock_level)
  ).length;
  const expiringCount = inventory.filter((item) =>
    isExpiringSoon(item.expiry_date)
  ).length;

  return (
    <div className="p-6 space-y-6 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Inventory Management</h1>
          <p className="text-muted-foreground">
            Manage your medicine stock and monitor levels
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadTemplate}>
            <Download className="h-4 w-4 mr-2" />
            Template
          </Button>
          <ImportExcelDialog onImportComplete={fetchInventory} />
          <AddMedicineDialog onAddMedicine={handleAddMedicine} />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Package className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-blue-600">
                {inventory.length}
              </p>
              <p className="text-sm text-muted-foreground">Total Medicines</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-amber-100 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-amber-600">
                {lowStockCount}
              </p>
              <p className="text-sm text-muted-foreground">Low Stock Items</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <Calendar className="h-5 w-5 text-red-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-red-600">{expiringCount}</p>
              <p className="text-sm text-muted-foreground">Expiring Soon</p>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-md">
          <CardContent className="p-4 flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="h-5 w-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-green-600">
                $
                {inventory
                  .reduce(
                    (total, item) =>
                      total + item.stock_quantity * (item.selling_price || 0),
                    0
                  )
                  .toFixed(0)}
              </p>
              <p className="text-sm text-muted-foreground">Stock Value</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search & Filters */}
      <Card className="shadow-md">
        <CardContent className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 flex gap-2">
            <Input
              placeholder="Search medicines by name, brand, or dosage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button variant="outline">
              <Search className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex gap-2">
            <Button
              variant={filterType === "all" ? "default" : "outline"}
              onClick={() => setFilterType("all")}
              size="sm"
            >
              All Items
            </Button>
            <Button
              variant={filterType === "lowStock" ? "default" : "outline"}
              onClick={() => setFilterType("lowStock")}
              size="sm"
            >
              <AlertTriangle className="mr-1 h-3 w-3" /> Low Stock
            </Button>
            <Button
              variant={filterType === "expiring" ? "default" : "outline"}
              onClick={() => setFilterType("expiring")}
              size="sm"
            >
              <Calendar className="mr-1 h-3 w-3" /> Expiring
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Medicine Inventory</CardTitle>
          <CardDescription>
            Showing {filteredInventory.length} of {inventory.length} medicines
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Loading medicines...</div>
          ) : filteredInventory.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No medicines found. Add your first medicine to get started.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredInventory.map((medicine) => (
                <div
                  key={medicine.id}
                  className="p-4 border rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div className="grid grid-cols-1 lg:grid-cols-6 gap-4 items-center">
                    <div className="lg:col-span-2">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">
                          {medicine.name}
                        </h3>
                        <Badge variant="outline">{medicine.dosage}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {medicine.brand} • {medicine.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Batch: {medicine.batch_number}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Stock Level</p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-lg font-bold ${
                            isLowStock(
                              medicine.stock_quantity,
                              medicine.min_stock_level
                            )
                              ? "text-amber-600"
                              : "text-blue-600"
                          }`}
                        >
                          {medicine.stock_quantity}
                        </span>
                        {isLowStock(
                          medicine.stock_quantity,
                          medicine.min_stock_level
                        ) && (
                          <Badge variant="destructive" className="text-xs">
                            Low
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Min: {medicine.min_stock_level}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Pricing</p>
                      <p className="text-sm text-muted-foreground">
                        Buy: ${medicine.buying_price?.toFixed(2)}
                      </p>
                      <p className="text-sm font-semibold text-blue-600">
                        Sell: ${medicine.selling_price?.toFixed(2)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm font-medium">Expiry</p>
                      <div className="flex items-center gap-2">
                        <span
                          className={`text-sm ${
                            isExpiringSoon(medicine.expiry_date)
                              ? "text-red-600 font-medium"
                              : "text-muted-foreground"
                          }`}
                        >
                          {medicine.expiry_date}
                        </span>
                        {isExpiringSoon(medicine.expiry_date) && (
                          <Badge
                            variant="outline"
                            className="text-red-600 border-red-600 text-xs"
                          >
                            <AlertTriangle className="h-3 w-3 mr-1" /> Soon
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {medicine.supplier || "No supplier"}
                      </p>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button variant="outline" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}