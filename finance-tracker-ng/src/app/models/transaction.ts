import { Category } from "./category";
import { User } from "./user";

export interface Transaction {
    id?: number;
    amount: number;
    date: string; // ISO format, e.g., "2025-03-20"
    type: 'income' | 'expense';
    category: Category;
    user: User;
    _links?: {
        self: { href: string };
        category?: { href: string };
        user?: { href: string };
    };
}