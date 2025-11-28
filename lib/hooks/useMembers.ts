'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useCallback } from 'react'

export interface Member {
    id: string
    email: string
    name: string
    phone: string | null
    role: 'MEMBER' | 'ADMIN' | 'PRESIDENT'
    status: 'ACTIVE' | 'INACTIVE' | 'WITHDRAWN'
    joined_at: string
    updated_at: string
}

export function useMembers() {
    const [members, setMembers] = useState<Member[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchMembers = useCallback(async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('members')
                .select('*')
                .neq('status', 'WITHDRAWN')
                .order('name', { ascending: true })

            if (error) throw error

            setMembers(data || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const updateMemberRole = async (memberId: string, newRole: 'MEMBER' | 'ADMIN' | 'PRESIDENT') => {
        try {
            // @ts-ignore
            const { error } = await supabase
                .from('members')
                .update({ role: newRole })
                .eq('id', memberId)

            if (error) throw error

            await fetchMembers()
            return { success: true, error: null }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    }

    useEffect(() => {
        fetchMembers()
    }, [fetchMembers])

    return {
        members,
        loading,
        error,
        fetchMembers,
        updateMemberRole,
    }
}
