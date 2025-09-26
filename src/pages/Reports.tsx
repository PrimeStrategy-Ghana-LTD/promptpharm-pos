"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";

export default function Report() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchReports();
  }, []);

  const fetchReports = async () => {
    try {
      setLoading(true);

      // Adjusted query: join sales with customers for customer_name
      const { data, error } = await supabase
        .from("sales")
        .select(
          `
          id,
          total_amount,
          created_at,
          customers(name)
        `
        )
        .order("created_at", { ascending: false });

      if (error) throw error;

      // Map nicely
      const formatted = data.map((sale: any) => ({
        id: sale.id,
        customer_name: sale.customers?.name || "Unknown",
        total_amount: sale.total_amount,
        created_at: new Date(sale.created_at).toLocaleString(),
      }));

      setReports(formatted);
    } catch (err: any) {
      console.error("Failed to load reports:", err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (report: any) => {
    alert(`Sale ID: ${report.id}\nCustomer: ${report.customer_name}\nTotal: ${report.total_amount}`);
    // Later: navigate(`/reports/${report.id}`);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Sales Report</h1>

      {/* Placeholder for filter */}
      <div className="mb-4">
        <Button variant="outline" disabled>
          📅 Date range filter coming soon
        </Button>
      </div>

      {loading && <p>Loading reports...</p>}
      {error && <p className="text-red-500">Error: {error}</p>}

      {!loading && !error && reports.length === 0 && (
        <p>No reports found.</p>
      )}

      {!loading && !error && reports.length > 0 && (
        <table className="min-w-full border border-gray-300 rounded-lg">
          <thead>
            <tr className="bg-gray-100">
              <th className="py-2 px-4 border-b text-left">Sale ID</th>
              <th className="py-2 px-4 border-b text-left">Customer</th>
              <th className="py-2 px-4 border-b text-left">Total Amount</th>
              <th className="py-2 px-4 border-b text-left">Date</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr
                key={report.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(report)}
              >
                <td className="py-2 px-4 border-b">{report.id}</td>
                <td className="py-2 px-4 border-b">{report.customer_name}</td>
                <td className="py-2 px-4 border-b">${report.total_amount}</td>
                <td className="py-2 px-4 border-b">{report.created_at}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
