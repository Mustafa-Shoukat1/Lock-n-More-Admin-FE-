export interface User {
    id?: number;
    name: string;
    email: string;
    role: 'agent' | 'admin' | 'super_admin';
    password?: string;
    created_at?: Date;
}
