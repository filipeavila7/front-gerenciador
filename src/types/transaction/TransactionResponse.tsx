export type TransactionType = "INCOME" | "EXPENSE";

export interface TransactionResponse {
  id: number;
  familyId: number;
  purchaseId: number;
  title: string;
  ammount: number;
  type: TransactionType;
  dateTime: string;
  description: string;
}