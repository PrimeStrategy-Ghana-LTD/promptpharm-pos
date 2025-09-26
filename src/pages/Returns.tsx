import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { 
  RotateCcw, 
  Search,
  Receipt,
  AlertTriangle,
  CheckCircle,
  Clock,
  Package
} from "lucide-react"

const sampleSales = [
  {
    id: "TXN001",
    date: "2024-01-15",
    customer: "John Smith",
    items: [
      { name: "Paracetamol 500mg", quantity: 2, price: 3.00 },
      { name: "Cough Syrup", quantity: 1, price: 9.00 }
    ],
    total: 15.00,
    paymentMethod: "Cash"
  },
  {
    id: "TXN002", 
    date: "2024-01-14",
    customer: "Sarah Johnson",
    items: [
      { name: "Ibuprofen 400mg", quantity: 1, price: 6.00 },
      { name: "Vitamin C", quantity: 3, price: 5.00 }
    ],
    total: 21.00,
    paymentMethod: "Card"
  },
  {
    id: "TXN003",
    date: "2024-01-13", 
    customer: "Michael Brown",
    items: [
      { name: "Amoxicillin 250mg", quantity: 1, price: 15.00 }
    ],
    total: 15.00,
    paymentMethod: "Mobile Money"
  }
]

const returnHistory = [
  {
    id: "RET001",
    originalTxn: "TXN001",
    date: "2024-01-16",
    customer: "John Smith",
    item: "Cough Syrup",
    quantity: 1,
    amount: 9.00,
    reason: "Wrong medication",
    status: "Completed"
  },
  {
    id: "RET002",
    originalTxn: "TXN002", 
    date: "2024-01-15",
    customer: "Sarah Johnson",
    item: "Vitamin C",
    quantity: 1,
    amount: 5.00,
    reason: "Expired product",
    status: "Processing"
  },
  {
    id: "RET003",
    originalTxn: "TXN003",
    date: "2024-01-14",
    customer: "Michael Brown", 
    item: "Amoxicillin 250mg",
    quantity: 1,
    amount: 15.00,
    reason: "Customer changed mind",
    status: "Completed"
  }
]

export default function Returns() {
  const [receiptQuery, setReceiptQuery] = useState("")
  const [selectedSale, setSelectedSale] = useState<any>(null)
  const [returnItems, setReturnItems] = useState<any[]>([])
  const [returnReason, setReturnReason] = useState("")

  const filteredSales = sampleSales.filter(sale =>
    sale.id.toLowerCase().includes(receiptQuery.toLowerCase()) ||
    sale.customer.toLowerCase().includes(receiptQuery.toLowerCase())
  )

  const addItemToReturn = (item: any) => {
    const existingReturn = returnItems.find(r => r.name === item.name)
    if (existingReturn) {
      setReturnItems(returnItems.map(r => 
        r.name === item.name 
          ? { ...r, quantity: Math.min(r.quantity + 1, item.quantity) }
          : r
      ))
    } else {
      setReturnItems([...returnItems, { ...item, returnQuantity: 1 }])
    }
  }

  const updateReturnQuantity = (itemName: string, quantity: number) => {
    setReturnItems(returnItems.map(item => 
      item.name === itemName 
        ? { ...item, returnQuantity: Math.max(0, Math.min(quantity, item.quantity)) }
        : item
    ).filter(item => item.returnQuantity > 0))
  }

  const processReturn = () => {
    if (returnItems.length > 0 && returnReason) {
      // Process the return logic here
      console.log("Processing return:", { returnItems, returnReason, originalSale: selectedSale })
      // Reset form
      setReturnItems([])
      setReturnReason("")
      setSelectedSale(null)
      setReceiptQuery("")
    }
  }

  const totalReturnAmount = returnItems.reduce((total, item) => 
    total + (item.price * item.returnQuantity), 0
  )

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed": return "text-success"
      case "Processing": return "text-warning" 
      case "Cancelled": return "text-destructive"
      default: return "text-muted-foreground"
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "Completed": return <CheckCircle className="h-4 w-4" />
      case "Processing": return <Clock className="h-4 w-4" />
      default: return <AlertTriangle className="h-4 w-4" />
    }
  }

  return (
    <div className="p-6 space-y-6 bg-gradient-bg min-h-full">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Returns & Refunds</h1>
          <p className="text-muted-foreground">Process customer returns and manage refunds</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Return Process */}
        <div className="lg:col-span-2 space-y-6">
          {/* Find Sale */}
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt className="h-5 w-5" />
                Find Original Sale
              </CardTitle>
              <CardDescription>Search for the original transaction to process return</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4 mb-4">
                <Input
                  placeholder="Enter receipt number or customer name..."
                  value={receiptQuery}
                  onChange={(e) => setReceiptQuery(e.target.value)}
                  className="flex-1"
                />
                <Button>
                  <Search className="h-4 w-4" />
                </Button>
              </div>

              {receiptQuery && (
                <div className="space-y-3">
                  <h4 className="font-medium text-sm text-muted-foreground">Search Results</h4>
                  {filteredSales.map((sale) => (
                    <div 
                      key={sale.id}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedSale?.id === sale.id ? 'bg-primary/5 border-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedSale(sale)}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-semibold">{sale.id}</h4>
                          <p className="text-sm text-muted-foreground">{sale.customer}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">${sale.total.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">{sale.date}</p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {sale.items.length} items • {sale.paymentMethod}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Selected Sale Items */}
          {selectedSale && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Sale Items - {selectedSale.id}
                </CardTitle>
                <CardDescription>Select items to return from this transaction</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {selectedSale.items.map((item: any, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{item.name}</h4>
                        <p className="text-sm text-muted-foreground">
                          Qty: {item.quantity} × ${item.price.toFixed(2)} = ${(item.quantity * item.price).toFixed(2)}
                        </p>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => addItemToReturn(item)}
                      >
                        Add to Return
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Return Items */}
          {returnItems.length > 0 && (
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Return Items
                </CardTitle>
                <CardDescription>Items selected for return</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {returnItems.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        ${item.price.toFixed(2)} each
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        <Label className="text-sm">Qty:</Label>
                        <Input
                          type="number"
                          min="0"
                          max={item.quantity}
                          value={item.returnQuantity}
                          onChange={(e) => updateReturnQuantity(item.name, parseInt(e.target.value) || 0)}
                          className="w-16 text-center"
                        />
                      </div>
                      <span className="font-semibold text-primary">
                        ${(item.price * item.returnQuantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                ))}

                <div className="space-y-3 pt-4 border-t">
                  <div>
                    <Label>Return Reason</Label>
                    <select 
                      className="w-full p-2 border rounded-md bg-background mt-1"
                      value={returnReason}
                      onChange={(e) => setReturnReason(e.target.value)}
                    >
                      <option value="">Select reason</option>
                      <option value="Wrong medication">Wrong medication</option>
                      <option value="Expired product">Expired product</option>
                      <option value="Damaged packaging">Damaged packaging</option>
                      <option value="Customer changed mind">Customer changed mind</option>
                      <option value="Doctor changed prescription">Doctor changed prescription</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div className="flex justify-between items-center text-lg">
                    <span className="font-semibold">Total Refund Amount:</span>
                    <span className="font-bold text-primary">${totalReturnAmount.toFixed(2)}</span>
                  </div>

                  <Button 
                    onClick={processReturn}
                    disabled={!returnReason}
                    className="w-full bg-gradient-primary hover:bg-primary-dark"
                    size="lg"
                  >
                    <RotateCcw className="mr-2 h-4 w-4" />
                    Process Return & Refund
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Return History */}
        <div>
          <Card className="shadow-card">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Return History
              </CardTitle>
              <CardDescription>Recent returns and refunds</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {returnHistory.map((returnItem) => (
                <div key={returnItem.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h4 className="font-medium text-sm">{returnItem.id}</h4>
                      <p className="text-xs text-muted-foreground">{returnItem.customer}</p>
                    </div>
                    <div className={`flex items-center gap-1 ${getStatusColor(returnItem.status)}`}>
                      {getStatusIcon(returnItem.status)}
                      <span className="text-xs">{returnItem.status}</span>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <p className="text-sm font-medium">{returnItem.item}</p>
                    <p className="text-xs text-muted-foreground">
                      Qty: {returnItem.quantity} • Amount: ${returnItem.amount.toFixed(2)}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      Reason: {returnItem.reason}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {returnItem.date} • Ref: {returnItem.originalTxn}
                    </p>
                  </div>
                </div>
              ))}

              <Button variant="outline" size="sm" className="w-full">
                View All Returns
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}