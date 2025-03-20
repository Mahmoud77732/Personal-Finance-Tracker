
export interface Transaction {
    id?: number;
    amount: number;
    date: string; // ISO format, e.g., "2025-03-20"
    type: 'income' | 'expense';
    category: { id: number; name: string };
    user?: { id: number; email: string };
    _links?: any; // For Spring Data REST HATEOAS
}