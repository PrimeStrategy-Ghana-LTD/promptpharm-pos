import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Stethoscope, Download, Printer, X } from "lucide-react";

interface SaleItem {
  name: string;
  dosage: string;
  quantity: number;
  price: number;
  total: number;
  verified_via_barcode: boolean;
}

interface SaleData {
  id: string;
  receipt_number: string;
  total_amount: number;
  tax_amount: number;
  subtotal_amount: number;
  customer_id: string | null;
  created_at: string;
  payment_method: string;
  condition_noted: string;
  cashier_id: string;
}

export default function SaleComplete() {
  const [saleItems, setSaleItems] = useState<SaleItem[]>([]);
  const [totalAmount, setTotalAmount] = useState(0);
  const [taxAmount, setTaxAmount] = useState(0);
  const [subtotal, setSubtotal] = useState(0);
  const [customerName, setCustomerName] = useState("");
  const [date, setDate] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [conditionNoted, setConditionNoted] = useState("");
  const [receiptNumber, setReceiptNumber] = useState("");
  const [cashierName, setCashierName] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const saleId = params.get("saleId");
    
    if (!saleId) {
      setError("No sale ID provided");
      setLoading(false);
      return;
    }

    const fetchSale = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch sale details with new fields
        const { data: saleData, error: saleError } = await supabase
          .from("sales")
          .select(`
            id,
            receipt_number,
            total_amount,
            tax_amount,
            subtotal_amount,
            customer_id,
            created_at,
            payment_method,
            condition_noted,
            cashier_id
          `)
          .eq("id", saleId)
          .single();
        
        if (saleError) throw saleError;
        if (!saleData) {
          throw new Error("Sale not found");
        }

        setTotalAmount(saleData.total_amount);
        setTaxAmount(saleData.tax_amount || 0);
        setSubtotal(saleData.subtotal_amount || (saleData.total_amount - (saleData.tax_amount || 0)));
        setDate(new Date(saleData.created_at).toLocaleString());
        setPaymentMethod(saleData.payment_method);
        setConditionNoted(saleData.condition_noted || "");
        setReceiptNumber(saleData.receipt_number);

        // Fetch cashier name
        if (saleData.cashier_id) {
          const { data: cashier, error: cashierError } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", saleData.cashier_id)
            .single();
          
          if (!cashierError) {
            setCashierName(cashier?.full_name || "Staff");
          }
        }

        // Fetch customer name
        if (saleData.customer_id) {
          const { data: customer, error: customerError } = await supabase
            .from("customers")
            .select("name")
            .eq("id", saleData.customer_id)
            .single();
          
          if (!customerError && customer) {
            setCustomerName(customer.name);
          } else {
            setCustomerName("Walk-in");
          }
        } else {
          setCustomerName("Walk-in");
        }

        // Fetch sale items with verification status
        const { data: items, error: itemsError } = await supabase
          .from("sale_items")
          .select("medicine_id, quantity, unit_price, verified_via_barcode")
          .eq("sale_id", saleId);

        if (itemsError) throw itemsError;

        const saleItemDetails: SaleItem[] = [];
        for (let item of items || []) {
          const { data: med, error: medError } = await supabase
            .from("medicines")
            .select("name, dosage")
            .eq("id", item.medicine_id)
            .single();
          
          if (medError) {
            console.warn(`Medicine not found for ID: ${item.medicine_id}`);
            saleItemDetails.push({
              name: "Unknown Medicine",
              dosage: "",
              quantity: item.quantity,
              price: item.unit_price,
              total: item.quantity * item.unit_price,
              verified_via_barcode: item.verified_via_barcode || false,
            });
          } else {
            saleItemDetails.push({
              name: med.name,
              dosage: med.dosage || "",
              quantity: item.quantity,
              price: item.unit_price,
              total: item.quantity * item.unit_price,
              verified_via_barcode: item.verified_via_barcode || false,
            });
          }
        }
        setSaleItems(saleItemDetails);
      } catch (error) {
        console.error("Error fetching sale:", error);
        setError(error instanceof Error ? error.message : "Failed to load sale details");
      } finally {
        setLoading(false);
      }
    };

    fetchSale();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    // You can implement PDF generation here
    // For now, we'll use a simple print-based approach
    window.print();
  };

  const handleClose = () => {
    if (window.history.length > 1) {
      window.history.back();
    } else {
      window.close();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading receipt...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center p-6 max-w-md bg-white rounded-lg shadow-lg">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="h-6 w-6 text-red-600" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Receipt</h3>
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={handleClose}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 print:p-0">
      <div className="max-w-2xl mx-auto bg-white shadow-lg rounded-lg print:shadow-none print:rounded-none">
        {/* Receipt Header */}
        <div className="p-6 print:p-4 border-b">
          <div className="text-center mb-4">
            <h2 className="text-3xl font-bold text-gray-900">PHARMAPOS RECEIPT</h2>
            <p className="text-sm text-gray-600">Professional Pharmacy Solutions</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p><strong>Receipt #:</strong> {receiptNumber}</p>
              <p><strong>Date:</strong> {date}</p>
            </div>
            <div className="text-right">
              <p><strong>Cashier:</strong> {cashierName}</p>
              <p><strong>Payment:</strong> {paymentMethod.toUpperCase()}</p>
            </div>
          </div>
        </div>

        {/* Customer Info */}
        <div className="p-6 print:p-4 border-b">
          <p className="font-medium"><strong>Customer:</strong> {customerName}</p>
          {conditionNoted && (
            <div className="mt-2 flex items-start gap-2 p-3 bg-blue-50 rounded-lg">
              <Stethoscope className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
              <div>
                <span className="text-sm font-medium text-blue-900">Medical Condition Noted:</span>
                <p className="text-sm text-blue-800 mt-1">{conditionNoted}</p>
              </div>
            </div>
          )}
        </div>

        {/* Sale Items */}
        <div className="p-6 print:p-4">
          <h3 className="font-semibold text-gray-900 mb-4">ITEMS PURCHASED</h3>
          <div className="space-y-3">
            {saleItems.map((item, idx) => (
              <div key={idx} className="flex justify-between items-start pb-3 border-b last:border-b-0">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="font-medium text-gray-900">{item.name}</p>
                    {item.verified_via_barcode && (
                      <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                        <ShieldCheck className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-600 mb-1">{item.dosage}</p>
                  <p className="text-xs text-gray-500">
                    {item.quantity} × GHS {item.price.toFixed(2)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">GHS {item.total.toFixed(2)}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="mt-6 space-y-2 pt-4 border-t">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Subtotal:</span>
              <span className="text-gray-900">GHS {subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Tax (10%):</span>
              <span className="text-gray-900">GHS {taxAmount.toFixed(2)}</span>
            </div>
            <div className="flex justify-between font-bold text-lg pt-2 border-t">
              <span className="text-gray-900">Total:</span>
              <span className="text-gray-900">GHS {totalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 print:p-4 bg-gray-50 rounded-b-lg print:bg-white">
          <div className="text-center text-xs text-gray-500 space-y-1">
            <p>Thank you for your purchase!</p>
            <p>All items verified via barcode scanning for your safety</p>
            <p>For returns, please present this receipt within 7 days</p>
            <p className="mt-2 text-gray-400">Contact: support@pharmapos.com | Tel: 030-123-4567</p>
          </div>
        </div>

        {/* Action Buttons - Hidden during print */}
        <div className="p-6 print:hidden border-t">
          <div className="flex gap-3">
            <Button onClick={handlePrint} className="flex-1 gap-2">
              <Printer className="h-4 w-4" />
              Print Receipt
            </Button>
            <Button onClick={handleDownloadPDF} variant="outline" className="flex-1 gap-2">
              <Download className="h-4 w-4" />
              Save as PDF
            </Button>
            <Button variant="outline" onClick={handleClose} className="flex-1">
              Close
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}