import React from "react";
import { Transaction } from "../types";
import { formatCurrency } from "../utils";
import { ArrowDownRight, ArrowUpRight, Activity, Wallet } from "lucide-react";

interface DashboardSummaryProps {
  transactions: Transaction[];
}

export default function DashboardSummary({ transactions }: DashboardSummaryProps) {
  const totalTransactions = transactions.length;
  
  const totalIncome = transactions
    .filter((t) => Number(t.amount) > 0)
    .reduce((sum, t) => sum + Number(t.amount), 0);
    
  const totalExpenses = transactions
    .filter((t) => Number(t.amount) < 0)
    .reduce((sum, t) => sum + Math.abs(Number(t.amount)), 0);
    
  const netAmount = totalIncome - totalExpenses;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      <div className="bg-blue-900/20 p-6 rounded-xl shadow-sm border border-blue-800/50 flex items-center space-x-4">
        <div className="p-3 bg-slate-800 text-blue-400 rounded-lg shadow-sm border border-slate-700">
          <Activity className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-blue-400">Total Transactions</p>
          <p className="text-2xl font-bold text-white">{totalTransactions}</p>
        </div>
      </div>

      <div className="bg-emerald-900/20 p-6 rounded-xl shadow-sm border border-emerald-800/50 flex items-center space-x-4">
        <div className="p-3 bg-slate-800 text-emerald-400 rounded-lg shadow-sm border border-slate-700">
          <ArrowDownRight className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-emerald-400">Total Income</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalIncome)}</p>
        </div>
      </div>

      <div className="bg-red-900/20 p-6 rounded-xl shadow-sm border border-red-800/50 flex items-center space-x-4">
        <div className="p-3 bg-slate-800 text-red-400 rounded-lg shadow-sm border border-slate-700">
          <ArrowUpRight className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm font-medium text-red-400">Total Expenses</p>
          <p className="text-2xl font-bold text-white">{formatCurrency(totalExpenses)}</p>
        </div>
      </div>

      <div className={`p-6 rounded-xl shadow-sm border flex items-center space-x-4 ${netAmount >= 0 ? "bg-indigo-900/20 border-indigo-800/50" : "bg-orange-900/20 border-orange-800/50"}`}>
        <div className={`p-3 bg-slate-800 rounded-lg shadow-sm border border-slate-700 ${netAmount >= 0 ? "text-indigo-400" : "text-orange-400"}`}>
          <Wallet className="w-6 h-6" />
        </div>
        <div>
          <p className={`text-sm font-medium ${netAmount >= 0 ? "text-indigo-400" : "text-orange-400"}`}>Net Amount</p>
          <p className="text-2xl font-bold text-white">
            {formatCurrency(netAmount)}
          </p>
        </div>
      </div>
    </div>
  );
}
