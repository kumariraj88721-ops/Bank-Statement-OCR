import React, { useState } from "react";
import { Transaction } from "./types";
import { formatDateToDDMMMYYYY } from "./utils";
import UploadSection from "./components/UploadSection";
import DashboardSummary from "./components/DashboardSummary";
import TransactionTable from "./components/TransactionTable";
import { ShieldCheck, FileText } from "lucide-react";

const DEMO_DATA: Transaction[] = [
  { id: "1", date: "05-sep-2026", description: "UPI Payment - Swiggy", amount: -450, category: "Food", notes: "Online food order", confidence: 0.95 },
  { id: "2", date: "06-sep-2026", description: "Salary Credit ACME Corp", amount: 45000, category: "Salary", notes: "Monthly salary", confidence: 0.99 },
  { id: "3", date: "07-sep-2026", description: "ATM Withdrawal", amount: -2000, category: "ATM/Cash Withdrawal", notes: "ATM transaction", confidence: 0.9 },
  { id: "4", date: "08-sep-2026", description: "Amazon Purchase", amount: -1299, category: "Shopping", notes: "Online purchase", confidence: 0.85 },
  { id: "5", date: "09-sep-2026", description: "Electricity Bill", amount: -1850, category: "Bills & Utilities", notes: "Electricity payment", confidence: 0.92 },
  { id: "6", date: "10-sep-2026", description: "Bank SMS Charges", amount: -15, category: "Bank Charges", notes: "Quarterly SMS fee", confidence: 0.7 },
  { id: "7", date: "12-sep-2026", description: "Unknown Debit X922", amount: -400, category: "Other", notes: "", confidence: 0.4 },
];

export default function App() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    setError(null);

    const formData = new FormData();
    formData.append("statement", file);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to process the document.");
      }

      const data = await response.json();
      
      if (!data.transactions || data.transactions.length === 0) {
        throw new Error("No transactions could be detected in this document.");
      }

      // Add unique IDs to the extracted transactions
      const mappedTransactions: Transaction[] = data.transactions.map((t: any) => ({
        ...t,
        id: Math.random().toString(36).substring(7),
        date: formatDateToDDMMMYYYY(t.date || ""),
        confidence: t.confidence ?? 1.0,
      }));

      setTransactions(mappedTransactions);
    } catch (err: any) {
      console.error(err);
      setError(err.message || "Something went wrong while processing your statement. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const loadDemo = () => {
    setTransactions([...DEMO_DATA]);
    setError(null);
  };

  const clearData = () => {
    setTransactions([]);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-black text-slate-200 font-sans">
      <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 relative flex items-center justify-between">
          {/* Empty div to balance flex layout if needed, or just let absolute handle it */}
          <div className="w-10"></div> 
          
          <div className="absolute left-1/2 -translate-x-1/2 flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center shadow-sm">
              <FileText className="text-white w-5 h-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-blue-600 leading-tight tracking-tight whitespace-nowrap">Bank Statement Extractor</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-1 text-xs text-emerald-400 bg-emerald-900/30 px-2 py-1 rounded-md border border-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Secure Processing</span>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-900/30 border border-red-800 text-red-400 px-4 py-3 rounded-lg relative flex items-start space-x-2">
            <span className="block sm:inline">{error}</span>
          </div>
        )}

        {transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center mt-12 mb-20 space-y-8">
            <UploadSection onProcess={handleProcessFile} isProcessing={isProcessing} />
            
            <div className="text-center">
              <span className="text-slate-400 text-sm">or</span>
              <button 
                onClick={loadDemo}
                className="block mt-2 text-blue-500 hover:text-blue-400 text-sm font-medium hover:underline transition-colors"
              >
                Try Demo Data
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">Statement Analysis</h2>
              <button
                onClick={clearData}
                className="text-sm text-slate-400 hover:text-red-400 font-medium transition-colors"
              >
                Clear & Upload New
              </button>
            </div>
            
            <DashboardSummary transactions={transactions} />
            
            <div className="bg-slate-900 p-6 rounded-xl shadow-sm border border-slate-800 border-l-4 border-l-amber-500 mb-6 flex items-start space-x-3">
              <p className="text-sm text-slate-300">
                <span className="font-semibold text-white">Review Required:</span> Please verify the extracted data below. 
                Any fields marked with a warning icon (<span className="text-amber-500 inline-block align-middle">⚠️</span>) had low extraction confidence. 
                You can click directly on any cell to edit it before downloading the CSV.
              </p>
            </div>

            <TransactionTable transactions={transactions} onUpdate={setTransactions} />
          </div>
        )}
      </main>
    </div>
  );
}

