import React, { useState } from "react";
import { Transaction, CATEGORIES } from "../types";
import { Search, Filter, Plus, Trash2, AlertTriangle, Download, ArrowUpDown } from "lucide-react";
import { formatCurrency, downloadCSV, generateCSV } from "../utils";
import AddTransactionModal from "./AddTransactionModal";

interface TransactionTableProps {
  transactions: Transaction[];
  onUpdate: (transactions: Transaction[]) => void;
}

type SortField = "date" | "amount" | null;
type SortOrder = "asc" | "desc";

export default function TransactionTable({ transactions, onUpdate }: TransactionTableProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("All");
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("desc");
    }
  };

  const handleUpdateTransaction = (id: string, field: keyof Transaction, value: any) => {
    const updated = transactions.map((t) => (t.id === id ? { ...t, [field]: value } : t));
    onUpdate(updated);
  };

  const handleDelete = (id: string) => {
    onUpdate(transactions.filter((t) => t.id !== id));
  };

  const parseDate = (dateStr: string) => {
    // Check if the date is DD-MMM-YYYY (e.g. 06-jan-2026)
    if (/^\d{2}-[a-zA-Z]{3}-\d{4}$/.test(dateStr)) {
      const [day, monthStr, year] = dateStr.split("-");
      const monthIndex = new Date(`${monthStr} 1, 2000`).getMonth() + 1;
      const month = monthIndex.toString().padStart(2, '0');
      return new Date(`${year}-${month}-${day}`).getTime();
    }
    // Check if the date is YYYY-MM-DD (from modal)
    if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) {
      const [year, month, day] = dateStr.split("-");
      return new Date(`${year}-${month}-${day}`).getTime();
    }
    // Check if the date is DD/MM/YYYY (from OCR/Demo)
    const parts = dateStr.split("/");
    if (parts.length === 3) {
      const [day, month, year] = parts;
      return new Date(`${year}-${month}-${day}`).getTime();
    }
    // fallback 
    const time = new Date(dateStr).getTime();
    return isNaN(time) ? 0 : time;
  };

  const filteredAndSorted = transactions
    .filter((t) => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = categoryFilter === "All" || t.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      if (!sortField) return 0;
      
      if (sortField === "amount") {
        return sortOrder === "asc" ? Number(a.amount) - Number(b.amount) : Number(b.amount) - Number(a.amount);
      }
      
      if (sortField === "date") {
        const timeA = parseDate(a.date);
        const timeB = parseDate(b.date);
        return sortOrder === "asc" ? timeA - timeB : timeB - timeA;
      }
      return 0;
    });

  const handleExportCSV = () => {
    const csvContent = generateCSV(filteredAndSorted);
    downloadCSV(csvContent);
  };

  const handleAddTransaction = (newTransaction: Transaction) => {
    onUpdate([newTransaction, ...transactions]);
  };

  return (
    <div className="bg-slate-900 rounded-xl shadow-sm border border-slate-800 overflow-hidden">
      <div className="p-4 border-b border-slate-800 bg-slate-950 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex flex-col md:flex-row items-center gap-4 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search description..."
              className="w-full pl-9 pr-4 py-2 text-sm border border-slate-700 bg-slate-800 text-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 placeholder:text-slate-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2 w-full md:w-auto">
            <button
              onClick={() => setCategoryFilter("All")}
              className={`shrink-0 px-4 py-2 text-sm font-medium rounded-lg transition-colors border ${
                categoryFilter === "All"
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700"
              }`}
            >
              All Categories
            </button>
            <div className="relative flex-1 md:w-48 flex items-center">
              <Filter className={`absolute left-3 w-4 h-4 transition-colors ${categoryFilter !== "All" ? "text-blue-500" : "text-slate-500"}`} />
              <select
                className={`w-full pl-9 pr-4 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-slate-800 transition-colors ${
                  categoryFilter !== "All" ? "border-blue-500 text-blue-400 font-medium" : "border-slate-700 text-slate-300"
                }`}
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="All" disabled className="text-slate-500 font-normal">Filter by category...</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c} className="text-slate-200 font-normal">{c}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Add Row</span>
          </button>
          
          <button
            onClick={handleExportCSV}
            className="flex-1 md:flex-none flex items-center justify-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm"
          >
            <Download className="w-4 h-4" />
            <span>Download CSV</span>
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-400 uppercase bg-slate-950 border-b border-slate-800">
            <tr>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-800 w-44 min-w-[150px]" onClick={() => handleSort("date")}>
                <div className="flex items-center space-x-1">
                  <span>Date</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 w-1/4 min-w-[200px]">Description</th>
              <th className="px-4 py-3 cursor-pointer hover:bg-slate-800 w-32" onClick={() => handleSort("amount")}>
                <div className="flex items-center space-x-1">
                  <span>Amount</span>
                  <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th className="px-4 py-3 w-48">Category</th>
              <th className="px-4 py-3 w-1/4 min-w-[150px]">Notes</th>
              <th className="px-4 py-3 w-16 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSorted.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-12 text-center text-slate-500">
                  No transactions found matching your filters.
                </td>
              </tr>
            ) : (
              filteredAndSorted.map((t) => (
                <tr key={t.id} className="border-b border-slate-800 hover:bg-slate-800/50 group">
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      placeholder="DD/MM/YYYY"
                      className="w-full bg-transparent border-none p-1 focus:ring-1 focus:ring-blue-500 rounded text-slate-300"
                      value={t.date}
                      onChange={(e) => handleUpdateTransaction(t.id, "date", e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <div className="flex items-center space-x-2">
                      {t.confidence < 0.7 && (
                        <div title="Low confidence extraction. Please review." className="text-amber-500 shrink-0">
                          <AlertTriangle className="w-4 h-4" />
                        </div>
                      )}
                        <input
                          type="text"
                          placeholder="Description"
                          className="w-full bg-transparent border-none p-1 focus:ring-1 focus:ring-blue-500 rounded text-slate-200 font-medium"
                          value={t.description}
                        onChange={(e) => handleUpdateTransaction(t.id, "description", e.target.value)}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      placeholder="0.00"
                      className={`w-full bg-transparent border-none p-1 focus:ring-1 focus:ring-blue-500 rounded font-medium ${
                        Number(t.amount) > 0 ? "text-[#16A34A]" : Number(t.amount) < 0 ? "text-[#DC2626]" : "text-slate-300"
                      }`}
                      value={Number(t.amount) > 0 && !String(t.amount).startsWith('+') ? `+${t.amount}` : t.amount}
                      onChange={(e) => {
                        let val = e.target.value.replace(/[^0-9.-]/g, '');
                        handleUpdateTransaction(t.id, "amount", val)
                      }}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <select
                      className="w-full bg-transparent border-none p-1 focus:ring-1 focus:ring-blue-500 rounded text-slate-300"
                      value={t.category}
                      onChange={(e) => handleUpdateTransaction(t.id, "category", e.target.value)}
                    >
                      <option value="" disabled className="text-slate-500">Select category...</option>
                      {CATEGORIES.map((c) => (
                        <option key={c} value={c} className="text-slate-800">{c}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="text"
                      className="w-full bg-transparent border-none p-1 focus:ring-1 focus:ring-blue-500 rounded text-slate-400"
                      value={t.notes || ""}
                      placeholder="Add note..."
                      onChange={(e) => handleUpdateTransaction(t.id, "notes", e.target.value)}
                    />
                  </td>
                  <td className="px-4 py-2 text-center">
                    <button
                      onClick={() => handleDelete(t.id)}
                      className="p-1.5 text-slate-500 hover:text-red-400 hover:bg-red-900/30 rounded opacity-0 group-hover:opacity-100 transition-all"
                      title="Delete row"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <AddTransactionModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        onAdd={handleAddTransaction} 
      />
    </div>
  );
}
