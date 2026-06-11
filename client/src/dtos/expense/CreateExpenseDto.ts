export interface CreateExpenseDto {
  name: string;
  category: number;
  amount: number;
  date: string;
  description: string;
}