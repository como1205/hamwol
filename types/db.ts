// Database types for Supabase
export interface Database {
    public: {
        Tables: {
            members: {
                Row: {
                    id: string
                    email: string
                    name: string
                    phone: string | null
                    role: 'MEMBER' | 'ADMIN' | 'PRESIDENT'
                    status: 'ACTIVE' | 'INACTIVE' | 'WITHDRAWN'
                    joined_at: string
                    updated_at: string
                }
                Insert: {
                    id: string
                    email: string
                    name: string
                    phone?: string | null
                    role?: 'MEMBER' | 'ADMIN' | 'PRESIDENT'
                    status?: 'ACTIVE' | 'INACTIVE' | 'WITHDRAWN'
                    joined_at?: string
                    updated_at?: string
                }
                Update: {
                    id?: string
                    email?: string
                    name?: string
                    phone?: string | null
                    role?: 'MEMBER' | 'ADMIN' | 'PRESIDENT'
                    status?: 'ACTIVE' | 'INACTIVE' | 'WITHDRAWN'
                    joined_at?: string
                    updated_at?: string
                }
            }
            bylaws: {
                Row: {
                    id: string
                    version: string
                    title: string
                    content: string
                    effective_date: string
                    created_at: string
                    author_id: string
                }
                Insert: {
                    id?: string
                    version: string
                    title: string
                    content: string
                    effective_date: string
                    created_at?: string
                    author_id: string
                }
                Update: {
                    id?: string
                    version?: string
                    title?: string
                    content?: string
                    effective_date?: string
                    created_at?: string
                    author_id?: string
                }
            }
            transactions: {
                Row: {
                    id: string
                    date: string
                    type: 'DEPOSIT' | 'WITHDRAWAL'
                    amount: number
                    balance: number
                    category: string
                    description: string | null
                    created_at: string
                    created_by: string
                }
                Insert: {
                    id?: string
                    date: string
                    type: 'DEPOSIT' | 'WITHDRAWAL'
                    amount: number
                    balance: number
                    category: string
                    description?: string | null
                    created_at?: string
                    created_by: string
                }
                Update: {
                    id?: string
                    date?: string
                    type?: 'DEPOSIT' | 'WITHDRAWAL'
                    amount?: number
                    balance?: number
                    category?: string
                    description?: string | null
                    created_at?: string
                    created_by?: string
                }
            }
        }
    }
}
