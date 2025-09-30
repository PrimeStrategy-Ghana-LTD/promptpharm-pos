"use client";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { Camera, Scan, CheckCircle, XCircle, RotateCcw, Smartphone } from "lucide-react";
import { QRCodeSVG as QRCode } from "qrcode.react"; // FIXED IMPORT

export default function SalesScannerPage() {
  const [scanning, setScanning] = useState(false);
  const [scannedCodes, setScannedCodes] = useState<string[]>([]);
  const [lastScanned, setLastScanned] = useState<string>("");
  const [scanCount, setScanCount] = useState(0);
  const searchParams = useSearchParams();
  const session = searchParams.get('session');

  const handleBarcodeScanned = async (barcode: string) => {
    if (!session) {
      alert("No session found. Please scan the QR code from the sales page.");
      return;
    }

    try {
      const { error } = await supabase
        .from('scanned_barcodes')
        .insert({
          session_id: session,
          barcode: barcode,
          scanned_at: new Date().toISOString(),
          type: 'sales'
        });

      if (error) throw error;

      setLastScanned(barcode);
      setScannedCodes(prev => [barcode, ...prev.slice(0, 9)]); // Keep last 10 scans
      setScanCount(prev => prev + 1);
      
      // Success feedback
      console.log(`Barcode sent to sales POS: ${barcode}`);
    } catch (error) {
      console.error("Error sending barcode:", error);
      alert("Failed to send barcode to sales system.");
    }
  };

  // Simulate scanning for demo
  const simulateBarcodeScan = () => {
    const sampleBarcodes = [
      "MED001234567", "MED002345678", "MED003456789", 
      "MED004567890", "MED005678901", "MED006789012",
      "MED007890123", "MED008901234", "MED009012345"
    ];
    
    const randomBarcode = sampleBarcodes[Math.floor(Math.random() * sampleBarcodes.length)];
    handleBarcodeScanned(randomBarcode);
  };

  const startScanning = () => {
    setScanning(true);
    // In real app: initialize camera scanner here
  };

  const stopScanning = () => {
    setScanning(false);
    // In real app: stop camera scanner here
  };

  const clearHistory = () => {
    setScannedCodes([]);
    setLastScanned("");
    setScanCount(0);
  };

  if (!session) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-600">
              <XCircle className="h-6 w-6" />
              Invalid Session
            </CardTitle>
            <CardDescription>
              Please scan the QR code from the sales page to connect.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white p-4">
      <div className="max-w-md mx-auto space-y-6">
        <Card className="shadow-lg border-2 border-green-200">
          <CardHeader className="text-center bg-green-50 rounded-t-lg">
            <CardTitle className="flex items-center justify-center gap-2 text-green-700">
              <Smartphone className="h-6 w-6" />
              Pharmacy Sales Scanner
            </CardTitle>
            <CardDescription className="text-green-600">
              Scan medicine barcodes for sales transaction
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-6">
            {/* Scanner Preview */}
            <div className="aspect-square bg-black rounded-lg flex items-center justify-center relative overflow-hidden border-4 border-green-500 shadow-lg">
              {scanning ? (
                <>
                  <div className="absolute inset-0 border-2 border-green-400 animate-pulse rounded-lg"></div>
                  <div className="text-white text-center z-10">
                    <Camera className="h-16 w-16 mx-auto mb-3 text-green-400" />
                    <p className="font-medium text-lg">Scanning Active</p>
                    <p className="text-sm text-green-300 mt-2">Point camera at barcode</p>
                    <p className="text-xs text-green-200 mt-1">Scans will auto-send to POS</p>
                  </div>
                </>
              ) : (
                <div className="text-white text-center">
                  <Camera className="h-16 w-16 mx-auto mb-3 opacity-50" />
                  <p className="text-lg font-medium">Ready to Scan</p>
                  <p className="text-sm text-gray-400 mt-2">Tap start to begin scanning</p>
                </div>
              )}
            </div>

            {/* Scan Stats */}
            <div className="grid grid-cols-2 gap-4 text-center">
              <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                <p className="text-2xl font-bold text-blue-600">{scanCount}</p>
                <p className="text-xs text-blue-700">Total Scans</p>
              </div>
              <div className="bg-green-50 p-3 rounded-lg border border-green-200">
                <p className="text-2xl font-bold text-green-600">{scannedCodes.length}</p>
                <p className="text-xs text-green-700">Recent Scans</p>
              </div>
            </div>

            {/* Controls */}
            <div className="flex gap-2">
              {!scanning ? (
                <Button onClick={startScanning} className="flex-1 bg-green-600 hover:bg-green-700 h-12 text-base">
                  <Camera className="h-5 w-5 mr-2" />
                  Start Scanning
                </Button>
              ) : (
                <Button onClick={stopScanning} variant="outline" className="flex-1 h-12 text-base">
                  Stop Scanning
                </Button>
              )}
              
              <Button onClick={simulateBarcodeScan} variant="outline" className="bg-blue-100 h-12">
                <CheckCircle className="h-5 w-5 mr-2" />
                Test Scan
              </Button>
            </div>

            {/* Last Scan Result */}
            {lastScanned && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg animate-pulse">
                <div className="flex items-center gap-2 text-green-700 mb-2">
                  <CheckCircle className="h-5 w-5" />
                  <span className="font-semibold">Scanned Successfully!</span>
                </div>
                <div className="bg-white p-3 rounded border text-center">
                  <p className="text-sm font-mono font-bold">{lastScanned}</p>
                </div>
                <p className="text-xs text-green-600 mt-2 text-center">
                  ✅ Sent to sales system
                </p>
              </div>
            )}

            {/* Scan History */}
            {scannedCodes.length > 0 && (
              <div className="border rounded-lg p-4 bg-white">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-semibold text-sm text-gray-900">Recent Scans</h4>
                  <Button variant="ghost" size="sm" onClick={clearHistory}>
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Clear All
                  </Button>
                </div>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {scannedCodes.map((code, index) => (
                    <div key={index} className="flex items-center gap-3 text-sm p-2 bg-gray-50 rounded border">
                      <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-700">
                        {index + 1}
                      </Badge>
                      <code className="flex-1 font-mono text-xs">{code}</code>
                      <CheckCircle className="h-3 w-3 text-green-500 flex-shrink-0" />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Session Info */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-blue-700 font-medium">Connected to Pharmacy POS</p>
              <p className="text-xs text-blue-600 mt-1">Scans will appear instantly on the sales terminal</p>
              <code className="text-xs bg-white text-blue-800 px-2 py-1 rounded mt-2 inline-block border">
                Session: {session.substring(0, 12)}...
              </code>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="p-4">
            <div className="text-center">
              <p className="text-amber-700 font-medium text-sm">💡 How to Use</p>
              <ul className="text-xs text-amber-600 mt-2 space-y-1 text-left">
                <li>• Point camera at medicine barcode</li>
                <li>• Ensure good lighting</li>
                <li>• Hold steady until scan completes</li>
                <li>• Scanned items auto-add to cart</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}