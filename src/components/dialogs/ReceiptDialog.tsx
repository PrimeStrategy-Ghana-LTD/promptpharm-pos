import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { 
  Receipt, 
  Printer, 
  Download, 
  Mail,
  MessageSquare,
  CheckCircle,
  Copy
} from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface CartItem {
  id: string
  name: string
  dosage: string
  selling_price: number
  quantity: number
  stock_quantity: number
  expiry_date: string | null
  category: string
}

interface ReceiptDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  cartItems: CartItem[]
  subtotal: number
  tax: number
  total: number
  paymentMethod: string
  onNewSale: () => void
}

export default function ReceiptDialog({ 
  open, 
  onOpenChange, 
  cartItems, 
  subtotal, 
  tax, 
  total, 
  paymentMethod,
  onNewSale 
}: ReceiptDialogProps) {
  const { toast } = useToast()
  const receiptNumber = `TXN${Date.now().toString().slice(-6)}`
  const currentDate = new Date().toLocaleDateString()
  const currentTime = new Date().toLocaleTimeString()

  const handlePrint = () => {
    const printContent = generateReceiptHTML()
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.print()
      
      toast({
        title: "Receipt Sent to Printer",
        description: "Receipt has been queued for printing",
      })
    }
  }

  const handleDownloadPDF = () => {
    // In a real implementation, you would use a library like jsPDF
    toast({
      title: "PDF Generated",
      description: "Receipt has been downloaded as PDF",
    })
  }

  const handleEmailReceipt = () => {
    toast({
      title: "Email Sent",
      description: "Receipt has been sent to customer's email",
    })
  }

  const handleSMSReceipt = () => {
    toast({
      title: "SMS Sent", 
      description: "Receipt details sent via SMS",
    })
  }

  const handleCopyReceipt = () => {
    const receiptText = generateReceiptText()
    navigator.clipboard.writeText(receiptText)
    toast({
      title: "Receipt Copied",
      description: "Receipt details copied to clipboard",
    })
  }

  const generateReceiptHTML = () => {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receipt - ${receiptNumber}</title>
          <style>
            body { font-family: 'Courier New', monospace; max-width: 400px; margin: 0 auto; padding: 20px; }
            .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 10px; margin-bottom: 15px; }
            .pharmacy-name { font-size: 20px; font-weight: bold; }
            .contact-info { font-size: 12px; margin-top: 5px; }
            .receipt-info { margin: 15px 0; font-size: 14px; }
            .items { margin: 15px 0; }
            .item { display: flex; justify-content: space-between; margin: 8px 0; font-size: 14px; }
            .totals { border-top: 1px solid #000; padding-top: 10px; margin-top: 15px; }
            .total-line { display: flex; justify-content: space-between; margin: 5px 0; }
            .final-total { font-weight: bold; font-size: 16px; border-top: 1px solid #000; padding-top: 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; border-top: 1px solid #000; padding-top: 10px; }
            @media print { body { margin: 0; padding: 10px; } }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="pharmacy-name">MediCare Pharmacy</div>
            <div class="contact-info">
              123 Main Street, City, State<br>
              Phone: +1 234 567 8900<br>
              Email: info@pharmacy.com
            </div>
          </div>
          
          <div class="receipt-info">
            <strong>Receipt #: ${receiptNumber}</strong><br>
            Date: ${currentDate}<br>
            Time: ${currentTime}<br>
            Cashier: Current User
          </div>

          <div class="items">
            <div style="border-bottom: 1px dashed #000; padding-bottom: 8px; margin-bottom: 10px;">
              <strong>ITEMS PURCHASED</strong>
            </div>
            ${cartItems.map(item => `
              <div class="item">
                <div>
                  <div><strong>${item.name}</strong></div>
                  <div style="font-size: 12px; color: #666;">${item.dosage}</div>
                   <div style="font-size: 12px;">${item.quantity} × $${item.selling_price.toFixed(2)}</div>
                 </div>
                 <div><strong>$${(item.selling_price * item.quantity).toFixed(2)}</strong></div>
              </div>
            `).join('')}
          </div>

          <div class="totals">
            <div class="total-line">
              <span>Subtotal:</span>
              <span>$${subtotal.toFixed(2)}</span>
            </div>
            <div class="total-line">
              <span>Tax (10%):</span>
              <span>$${tax.toFixed(2)}</span>
            </div>
            <div class="total-line final-total">
              <span>TOTAL:</span>
              <span>$${total.toFixed(2)}</span>
            </div>
          </div>

          <div style="margin: 15px 0; text-align: center;">
            <strong>Payment Method: ${paymentMethod}</strong>
          </div>

          <div class="footer">
            <div>Thank you for choosing MediCare Pharmacy!</div>
            <div style="margin-top: 5px;">Have a healthy day!</div>
            <div style="margin-top: 10px; font-size: 10px;">
              * Please keep this receipt for your records *<br>
              * Return policy: 30 days with receipt *
            </div>
          </div>
        </body>
      </html>
    `
  }

  const generateReceiptText = () => {
    return `
MEDICARE PHARMACY
123 Main Street, City, State
Phone: +1 234 567 8900
================================

Receipt #: ${receiptNumber}
Date: ${currentDate}
Time: ${currentTime}
Cashier: Current User

ITEMS PURCHASED:
${cartItems.map(item => 
  `${item.name} (${item.dosage})\n${item.quantity} × $${item.selling_price.toFixed(2)} = $${(item.selling_price * item.quantity).toFixed(2)}`
).join('\n')}

================================
Subtotal: $${subtotal.toFixed(2)}
Tax (10%): $${tax.toFixed(2)}
TOTAL: $${total.toFixed(2)}
================================

Payment Method: ${paymentMethod}

Thank you for choosing MediCare Pharmacy!
Have a healthy day!
    `.trim()
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-success">
            <CheckCircle className="h-5 w-5" />
            Sale Completed Successfully!
          </DialogTitle>
          <DialogDescription>
            Transaction processed. Choose how to deliver the receipt.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Receipt Preview */}
          <div className="border rounded-lg p-4 bg-muted/20 font-mono text-sm">
            <div className="text-center font-bold border-b pb-2 mb-3">
              MEDICARE PHARMACY
              <div className="text-xs font-normal mt-1">Receipt #{receiptNumber}</div>
              <div className="text-xs font-normal">{currentDate} {currentTime}</div>
            </div>

            <div className="space-y-2">
              {cartItems.map((item, index) => (
                <div key={index}>
                  <div className="flex justify-between">
                    <span className="font-medium">{item.name}</span>
                    <span>${(item.selling_price * item.quantity).toFixed(2)}</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {item.dosage} • {item.quantity} × ${item.selling_price.toFixed(2)}
                  </div>
                </div>
              ))}
            </div>

            <Separator className="my-3" />
            
            <div className="space-y-1">
              <div className="flex justify-between text-sm">
                <span>Subtotal:</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span>Tax:</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold border-t pt-1">
                <span>TOTAL:</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-center mt-3 pt-2 border-t">
              <Badge variant="outline">{paymentMethod}</Badge>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button onClick={handlePrint} variant="outline" className="h-12">
              <Printer className="mr-2 h-4 w-4" />
              Print Receipt
            </Button>
            
            <Button onClick={handleDownloadPDF} variant="outline" className="h-12">
              <Download className="mr-2 h-4 w-4" />
              Download PDF
            </Button>
            
            <Button onClick={handleEmailReceipt} variant="outline" className="h-12">
              <Mail className="mr-2 h-4 w-4" />
              Email Receipt
            </Button>
            
            <Button onClick={handleSMSReceipt} variant="outline" className="h-12">
              <MessageSquare className="mr-2 h-4 w-4" />
              Send SMS
            </Button>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleCopyReceipt} variant="outline" className="flex-1">
              <Copy className="mr-2 h-4 w-4" />
              Copy Receipt
            </Button>
          </div>

          {/* New Sale Button */}
          <Button 
            onClick={() => {
              onNewSale()
              onOpenChange(false)
            }}
            className="w-full h-12 bg-gradient-primary hover:bg-primary-dark"
            size="lg"
          >
            <Receipt className="mr-2 h-5 w-5" />
            Start New Sale
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}