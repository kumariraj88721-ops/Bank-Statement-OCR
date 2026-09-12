export interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number | string;
  category: string;
  notes: string;
  confidence: number;
}

export const CATEGORIES = [
  "Salary",
  "Food",
  "Groceries",
  "Shopping",
  "Bills & Utilities",
  "Rent",
  "Travel",
  "Transport",
  "Healthcare",
  "Education",
  "Entertainment",
  "ATM/Cash Withdrawal",
  "Bank Charges",
  "Transfer",
  "Investment",
  "Loan/EMI",
  "Insurance",
  "Refund",
  "UPI",
  "Other",
];
