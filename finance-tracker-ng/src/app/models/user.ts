
export interface User {
    id: number;
    email: string;
    _links?: { self: { href: string } };
}