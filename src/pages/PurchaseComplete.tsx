import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Package, ArrowLeft } from "lucide-react";

export default function PurchaseComplete() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderNumber = searchParams.get('order');
  const amount = searchParams.get('amount');
  const itemCount = searchParams.get('items');

  useEffect(() => {
    // Auto redirect after 8 seconds
    const timer = setTimeout(() => {
      navigate('/purchases');
    }, 8000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-bg flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card className="shadow-medical text-center">
          <CardHeader className="pb-8">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-success to-success-light rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-2xl font-bold text-success">Purchase Order Created!</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {orderNumber && (
              <div className="space-y-2">
                <p className="text-muted-foreground">Order Number</p>
                <p className="text-xl font-bold">{orderNumber}</p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-center">
              {itemCount && (
                <div className="space-y-2">
                  <p className="text-muted-foreground">Items</p>
                  <p className="text-lg font-bold">{itemCount}</p>
                </div>
              )}
              
              {amount && (
                <div className="space-y-2">
                  <p className="text-muted-foreground">Total</p>
                  <p className="text-lg font-bold text-primary">${parseFloat(amount).toFixed(2)}</p>
                </div>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              Purchase order created successfully.<br />
              Inventory will be updated upon receipt.<br />
              Redirecting in 8 seconds...
            </div>

            <div className="flex gap-3">
              <Button 
                onClick={() => navigate('/purchases')} 
                className="flex-1 bg-gradient-primary hover:bg-primary-dark"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                New Purchase
              </Button>
              <Button 
                variant="outline" 
                onClick={() => navigate('/inventory')}
                className="flex-1"
              >
                <Package className="mr-2 h-4 w-4" />
                View Inventory
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}