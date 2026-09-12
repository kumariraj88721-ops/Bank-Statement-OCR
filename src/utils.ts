import { Transaction } from "./types";

export function formatCurrency(amount: number, currency: string = "INR") {
  const formatted = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(Math.abs(amount));

  if (amount > 0) return `+${formatted}`;
  if (amount < 0) return `-${formatted}`;
  return formatted;
}

export function formatDateToDDMMMYYYY(dateInput: string): string {
  // If already in correct format like 06-jan-2026, return as is
  if (/^\d{2}-[a-zA-Z]{3}-\d{4}$/.test(dateInput)) return dateInput.toLowerCase();

  let d = new Date(dateInput);
  
  if (isNaN(d.getTime()) && dateInput.includes("/")) {
    const parts = dateInput.split("/");
    if (parts.length === 3) {
      // Assuming DD/MM/YYYY
      d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
    }
  }

  if (isNaN(d.getTime())) return dateInput; // return original if invalid

  const day = d.getDate().toString().padStart(2, "0");
  const month = d.toLocaleString('en-GB', { month: 'short' }).toLowerCase();
  const year = d.getFullYear();

  return `${day}-${month}-${year}`;
}

export function generateCSV(transactions: Transaction[]) {
  const headers = ["Date", "Description", "Amount", "Category", "Notes"];
  
  const rows = transactions.map((t) => [
    t.date,
    `"${t.description.replace(/"/g, '""')}"`,
    t.amount.toString(),
    `"${t.category.replace(/"/g, '""')}"`,
    `"${t.notes.replace(/"/g, '""')}"`,
  ]);

  const csvContent = [headers.join(","), ...rows.map((row) => row.join(","))].join("\n");
  
  return csvContent;
}

export function downloadCSV(csvContent: string, filename: string = "transactions.csv") {
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  link.style.visibility = "hidden";
  
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
