import React, { useState } from "react";
import { CATEGORIES, Transaction } from "../types";
import { formatDateToDDMMMYYYY } from "../utils";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (t: Transaction) => void;
}

export default function AddTransactionModal({ isOpen, onClose, onAdd }: Props) {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [description, setDescription] = useState("");
  const [amountStr, setAmountStr] = useState("");
  const [displayAmount, setDisplayAmount] = useState("");
  const [type, setType] = useState<"Debit" | "Credit">("Debit");
  const [category, setCategory] = useState("");
  const [notes, setNotes] = useState("");

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Keep only numbers and a single decimal point
    const val = e.target.value.replace(/[^0-9.]/g, "");
    setAmountStr(val);
    setDisplayAmount(val);
  };

  const handleAmountBlur = () => {
    const num = parseFloat(amountStr);
    if (!isNaN(num)) {
      setDisplayAmount(`₹${num.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`);
    } else {
      setDisplayAmount("");
    }
  };

  const handleAmountFocus = () => {
    setDisplayAmount(amountStr);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amountStr);
    if (isNaN(numAmount) || numAmount <= 0) return;

    const finalAmount = type === "Debit" ? -numAmount : numAmount;

    onAdd({
      id: Math.random().toString(36).substring(7),
      date: formatDateToDDMMMYYYY(date),
      description,
      amount: finalAmount,
      category,
      notes,
      confidence: 1, // Manual entry is always high confidence
    });

    // Reset and close
    setDate(new Date().toISOString().split("T")[0]);
    setDescription("");
    setAmountStr("");
    setDisplayAmount("");
    setType("Debit");
    setCategory("");
    setNotes("");
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 rounded-xl shadow-xl border border-slate-800 w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950">
          <h3 className="text-lg font-bold text-white">Add New Transaction</h3>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Date</label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-3 py-2 border border-slate-700 bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Description</label>
            <input
              type="text"
              required
              placeholder="Enter transaction description (e.g. Swiggy, Amazon)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3 py-2 border border-slate-700 bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Amount (₹)</label>
              <input
                type="text"
                required
                placeholder="₹0.00"
                value={displayAmount}
                onChange={handleAmountChange}
                onBlur={handleAmountBlur}
                onFocus={handleAmountFocus}
                className="w-full px-3 py-2 border border-slate-700 bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white font-medium placeholder:text-slate-500 placeholder:font-normal"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1.5">Transaction Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as "Debit" | "Credit")}
                className="w-full px-3 py-2 border border-slate-700 bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
              >
                <option value="Debit">Debit</option>
                <option value="Credit">Credit</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Category</label>
            <select
              required
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={`w-full px-3 py-2 border border-slate-700 bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                category === "" ? "text-slate-500" : "text-white"
              }`}
            >
              <option value="" disabled className="text-slate-500">Select category...</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c} className="text-white">{c}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1.5">Notes</label>
            <input
              type="text"
              placeholder="Optional notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3 py-2 border border-slate-700 bg-slate-800 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white placeholder:text-slate-500"
            />
          </div>

          <div className="pt-4 flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition-colors border border-slate-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
            >
              Save Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
