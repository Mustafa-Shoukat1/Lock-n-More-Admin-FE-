export interface AISetting {
    id: number;
    name: string;
    prompt: string;
    description?: string;
    is_active: boolean;
    created_at?: Date;
    updated_at?: Date;
}
