'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useCallback } from 'react'

export interface Bylaw {
    id: string
    version: string
    title: string
    content: string
    effective_date: string
    created_at: string
    author_id: string
}

export function useBylaws({ autoFetch = true } = {}) {
    const [currentBylaw, setCurrentBylaw] = useState<Bylaw | null>(null)
    const [bylawsHistory, setBylawsHistory] = useState<Bylaw[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchCurrentBylaw = useCallback(async () => {
        try {
            console.log('fetchCurrentBylaw: Starting fetch...')
            setLoading(true)
            const { data, error } = await supabase
                .from('bylaws')
                .select('*')
                .order('effective_date', { ascending: false })
                .limit(1)
                .single()

            console.log('fetchCurrentBylaw: Supabase response', { data, error })

            if (error) {
                if (error.code === 'PGRST116') {
                    // 데이터가 없는 경우
                    console.log('fetchCurrentBylaw: No data found (PGRST116)')
                    setCurrentBylaw(null)
                } else {
                    console.error('fetchCurrentBylaw: Error', error)
                    throw error
                }
            } else {
                console.log('fetchCurrentBylaw: Success', data)
                setCurrentBylaw(data)
            }
        } catch (err: any) {
            console.error('fetchCurrentBylaw: Catch Error', err)
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const fetchBylawsHistory = useCallback(async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('bylaws')
                .select('*')
                .order('effective_date', { ascending: false })

            if (error) throw error
            setBylawsHistory(data || [])
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const createBylaw = async (bylaw: Omit<Bylaw, 'id' | 'created_at' | 'author_id'>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('로그인이 필요합니다.')

            // @ts-ignore
            const { error } = await supabase
                .from('bylaws')
                .insert({
                    ...bylaw,
                    author_id: user.id,
                })

            if (error) throw error

            if (autoFetch) {
                await fetchCurrentBylaw()
            }
            return { success: true, error: null }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    }

    useEffect(() => {
        if (autoFetch) {
            fetchCurrentBylaw()
        } else {
            setLoading(false)
        }
    }, [fetchCurrentBylaw, autoFetch])

    return {
        currentBylaw,
        bylawsHistory,
        loading,
        error,
        fetchCurrentBylaw,
        fetchBylawsHistory,
        createBylaw,
    }
}
