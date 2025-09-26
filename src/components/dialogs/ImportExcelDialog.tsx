import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Upload, AlertCircle, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabaseClient";
import * as XLSX from "xlsx";

interface ImportExcelDialogProps {
  onImportComplete: () => void;
}

export default function ImportExcelDialog({ onImportComplete }: ImportExcelDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [importResults, setImportResults] = useState<{
    success: number;
    errors: number;
    errorMessages: string[];
  } | null>(null);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsImporting(true);
    setProgress(0);
    setImportResults(null);

    try {
      // Check if file is Excel or CSV
      const isExcel = file.name.endsWith('.xlsx') || file.name.endsWith('.xls');
      const isCSV = file.name.endsWith('.csv');
      
      if (!isExcel && !isCSV) {
        throw new Error('Please upload an Excel (.xlsx, .xls) or CSV file');
      }

      // Read file
      const data = await readFile(file, isExcel);
      
      if (!data || data.length === 0) {
        throw new Error('No data found in the file');
      }

      setProgress(30);

      // Import medicines
      const results = await importMedicines(data);
      setImportResults(results);
      setProgress(100);

      // Show toast notification
      if (results.errors === 0) {
        toast({
          title: "Import Successful",
          description: `Successfully imported ${results.success} medicines.`,
        });
      } else {
        toast({
          title: "Import Completed with Errors",
          description: `Imported ${results.success} medicines, ${results.errors} failed.`,
          variant: "destructive",
        });
      }

      // Refresh parent component
      onImportComplete();
      
      // Close dialog after successful import
      setTimeout(() => setIsOpen(false), 2000);
    } catch (error) {
      console.error("Error importing medicines:", error);
      toast({
        title: "Import Failed",
        description: error instanceof Error ? error.message : "Failed to import medicines",
        variant: "destructive",
      });
    } finally {
      setIsImporting(false);
    }
  };

  const readFile = (file: File, isExcel: boolean): Promise<any[]> => {
    return new Promise((resolve, reject) => {
      if (isExcel) {
        // For Excel files
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const arrayBuffer = e.target?.result as ArrayBuffer;
            const workbook = XLSX.read(arrayBuffer, { type: "array" });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const data = XLSX.utils.sheet_to_json(worksheet);
            resolve(data);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
      } else {
        // For CSV files
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim());
            
            if (lines.length < 2) {
              resolve([]);
              return;
            }
            
            const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
            
            const data = lines.slice(1).map(line => {
              // Handle quoted CSV values
              const values = line.split(',').map(v => {
                let value = v.trim();
                // Remove quotes if present
                if (value.startsWith('"') && value.endsWith('"')) {
                  value = value.slice(1, -1);
                }
                return value;
              });
              
              const item: any = {};
              headers.forEach((header, index) => {
                item[header] = values[index] || '';
              });
              return item;
            }).filter(item => Object.values(item).some(val => val !== ''));
            
            resolve(data);
          } catch (error) {
            reject(error);
          }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
      }
    });
  };

  const importMedicines = async (data: any[]): Promise<{
    success: number;
    errors: number;
    errorMessages: string[];
  }> => {
    const errorMessages: string[] = [];
    let successCount = 0;
    let errorCount = 0;

    for (const [index, item] of data.entries()) {
      try {
        // Map the data to our database schema
        const medicineData = {
          name: item.name || item.Name || item.Medicine || "",
          dosage: item.dosage || item.Dosage || item.Strength || "",
          brand: item.brand || item.Brand || item.Manufacturer || "",
          batch_number: item.batch_number || item.batch || item.BatchNumber || "",
          stock_quantity: Number(item.stock_quantity || item.stock || item.quantity || item.Stock || 0),
          min_stock_level: Number(item.min_stock_level || item.min_stock || item.MinStock || 10),
          buying_price: Number(item.buying_price || item.buy_price || item.cost || item.Cost || 0),
          selling_price: Number(item.selling_price || item.sell_price || item.price || item.Price || 0),
          expiry_date: item.expiry_date || item.expiry || item.ExpiryDate || null,
          supplier: item.supplier || item.Supplier || "",
          category: item.category || item.Category || "over_counter",
        };

        // Validate required fields
        if (!medicineData.name) {
          throw new Error("Missing required field: name");
        }

        if (isNaN(medicineData.stock_quantity) || medicineData.stock_quantity < 0) {
          throw new Error("Invalid stock quantity");
        }

        if (isNaN(medicineData.buying_price) || medicineData.buying_price < 0) {
          throw new Error("Invalid buying price");
        }

        if (isNaN(medicineData.selling_price) || medicineData.selling_price < 0) {
          throw new Error("Invalid selling price");
        }

        // Insert into database
        const { error } = await supabase
          .from("medicines")
          .insert(medicineData);

        if (error) throw error;
        successCount++;
      } catch (error) {
        errorCount++;
        errorMessages.push(
          `Row ${index + 1}: ${error instanceof Error ? error.message : "Unknown error"}`
        );
        console.error("Error importing medicine:", error);
      }
      
      // Update progress
      setProgress(30 + Math.floor((index / data.length) * 60));
    }

    return {
      success: successCount,
      errors: errorCount,
      errorMessages,
    };
  };

  const resetDialog = () => {
    setImportResults(null);
    setProgress(0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => {
      setIsOpen(open);
      if (!open) resetDialog();
    }}>
      <DialogTrigger asChild>
        <Button variant="default">
          <Upload className="h-4 w-4 mr-2" />
          Import Excel/CSV
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Import Medicines</DialogTitle>
          <DialogDescription>
            Upload an Excel or CSV file to import medicines in bulk.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          {isImporting ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Importing medicines...</span>
                <span className="text-sm text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          ) : importResults ? (
            <div className={`p-3 rounded-md ${importResults.errors > 0 ? 'bg-amber-50 border border-amber-200' : 'bg-green-50 border border-green-200'}`}>
              <div className="flex items-center">
                {importResults.errors > 0 ? (
                  <AlertCircle className="h-5 w-5 text-amber-600 mr-2" />
                ) : (
                  <CheckCircle2 className="h-5 w-5 text-green-600 mr-2" />
                )}
                <div>
                  <p className="font-medium">
                    Import {importResults.errors > 0 ? 'completed with errors' : 'successful'}
                  </p>
                  <p className="text-sm">
                    {importResults.success} medicines imported successfully
                    {importResults.errors > 0 && `, ${importResults.errors} failed`}
                  </p>
                  
                  {importResults.errors > 0 && importResults.errorMessages.length > 0 && (
                    <details className="mt-2 text-xs">
                      <summary className="cursor-pointer">View errors</summary>
                      <ul className="mt-1 space-y-1 max-h-32 overflow-y-auto">
                        {importResults.errorMessages.map((msg, i) => (
                          <li key={i} className="text-amber-700">{msg}</li>
                        ))}
                      </ul>
                    </details>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center w-full">
              <label
                htmlFor="dropzone-file"
                className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-8 h-8 mb-3 text-gray-400" />
                  <p className="mb-2 text-sm text-gray-500">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-gray-500">Excel (.xlsx, .xls) or CSV files</p>
                </div>
                <input
                  id="dropzone-file"
                  type="file"
                  className="hidden"
                  accept=".xlsx,.xls,.csv"
                  onChange={handleFileUpload}
                />
              </label>
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            <p className="font-medium mb-1">Expected format:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Name (required)</li>
              <li>Dosage</li>
              <li>Brand</li>
              <li>Batch Number</li>
              <li>Stock Quantity (number)</li>
              <li>Min Stock Level (number)</li>
              <li>Buying Price (number)</li>
              <li>Selling Price (number)</li>
              <li>Expiry Date (YYYY-MM-DD)</li>
              <li>Supplier</li>
              <li>Category</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}