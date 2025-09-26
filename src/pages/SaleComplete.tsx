import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, Stethoscope } from "lucide-react";

interface SaleItem {
  name: string;
  dosage: string;
  quantity: number;
  price: number;
  total: number;
  verified_via_barcode: boolean;
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

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const saleId = params.get("saleId");
    if (!saleId) return;

    const fetchSale = async () => {
      try {
        // Fetch sale details with new fields
        const { data: saleData, error: saleError } = await supabase
          .from("sales")
          .select(`
            id,
            receipt_number,
            total_amount,
            tax_amount,
            customer_id,
            created_at,
            payment_method,
            condition_noted,
            cashier_id
          `)
          .eq("id", saleId)
          .single();
        
        if (saleError) throw saleError;

        setTotalAmount(saleData.total_amount);
        setTaxAmount(saleData.tax_amount || 0);
        setSubtotal(saleData.total_amount - (saleData.tax_amount || 0));
        setDate(new Date(saleData.created_at).toLocaleString());
        setPaymentMethod(saleData.payment_method);
        setConditionNoted(saleData.condition_noted || "");
        setReceiptNumber(saleData.receipt_number);

        // Fetch cashier name
        if (saleData.cashier_id) {
          const { data: cashier } = await supabase
            .from("profiles")
            .select("full_name")
            .eq("id", saleData.cashier_id)
            .single();
          setCashierName(cashier?.full_name || "Staff");
        }

        // Fetch customer name
        if (saleData.customer_id) {
          const { data: customer } = await supabase
            .from("customers")
            .select("name")
            .eq("id", saleData.customer_id)
            .single();
          setCustomerName(customer?.name || "Walk-in");
        } else {
          setCustomerName("Walk-in");
        }

        // Fetch sale items with verification status
        const { data: items } = await supabase
          .from("sale_items")
          .select("medicine_id, quantity, unit_price, verified_via_barcode")
          .eq("sale_id", saleId);

        const saleItemDetails: SaleItem[] = [];
        for (let item of items || []) {
          const { data: med } = await supabase
            .from("medicines")
            .select("name, dosage")
            .eq("id", item.medicine_id)
            .single();
          
          saleItemDetails.push({
            name: med?.name || "Unknown Medicine",
            dosage: med?.dosage || "",
            quantity: item.quantity,
            price: item.unit_price,
            total: item.quantity * item.unit_price,
            verified_via_barcode: item.verified_via_barcode || false,
          });
        }
        setSaleItems(saleItemDetails);
      } catch (error) {
        console.error("Error fetching sale:", error);
      }
    };

    fetchSale();
  }, []);

  return (
    <div className="p-6 max-w-2xl mx-auto bg-white shadow-lg rounded-lg">
      {/* Receipt Header */}
      <div className="text-center mb-6 border-b pb-4">
        <h2 className="text-3xl font-bold text-gray-900">PHARMAPOS RECEIPT</h2>
        <p className="text-sm text-gray-600">Professional Pharmacy Solutions</p>
        <div className="mt-2 grid grid-cols-2 gap-4 text-xs text-gray-500">
          <div className="text-left">
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
      <div className="mb-4">
        <p><strong>Customer:</strong> {customerName}</p>
        {conditionNoted && (
          <div className="mt-2 flex items-center gap-2 p-2 bg-blue-50 rounded">
            <Stethoscope className="h-4 w-4 text-blue-600" />
            <span className="text-sm"><strong>Condition:</strong> {conditionNoted}</span>
          </div>
        )}
      </div>

      {/* Sale Items */}
      <div className="border-t border-b divide-y">
        {saleItems.map((item, idx) => (
          <div key={idx} className="flex justify-between items-center py-3">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <p className="font-medium">{item.name}</p>
                {item.verified_via_barcode && (
                  <Badge variant="outline" className="text-green-600 border-green-300 text-xs">
                    <ShieldCheck className="h-3 w-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-sm text-gray-600">{item.dosage}</p>
              <p className="text-sm text-gray-500">{item.quantity} × GHS {item.price.toFixed(2)}</p>
            </div>
            <div className="font-medium text-right">
              <p>GHS {item.total.toFixed(2)}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Totals */}
      <div className="mt-4 space-y-2">
        <div className="flex justify-between text-sm">
          <span>Subtotal:</span>
          <span>GHS {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between text-sm">
          <span>Tax (10%):</span>
          <span>GHS {taxAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between font-bold text-lg border-t pt-2">
          <span>Total:</span>
          <span>GHS {totalAmount.toFixed(2)}</span>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-6 text-center text-xs text-gray-500 border-t pt-4">
        <p>Thank you for your purchase!</p>
        <p>All items verified via barcode scanning for your safety</p>
        <p>For returns, please present this receipt within 7 days</p>
      </div>

      {/* Action Buttons */}
      <div className="mt-6 flex gap-3">
        <Button className="flex-1" onClick={() => window.print()}>
          Print Receipt
        </Button>
        <Button variant="outline" className="flex-1" onClick={() => window.close()}>
          Close
        </Button>
      </div>
    </div>
  );
}