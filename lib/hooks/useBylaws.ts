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
    updated_at: string
    author_id: string
    is_active: boolean
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
                .eq('is_active', true)
                .maybeSingle()

            console.log('fetchCurrentBylaw: Supabase response', { data, error })

            if (error) {
                console.error('fetchCurrentBylaw: Error', error)
                throw error
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

    const createBylaw = async (bylaw: Omit<Bylaw, 'id' | 'created_at' | 'updated_at' | 'author_id' | 'is_active'>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('로그인이 필요합니다.')

            // @ts-ignore
            const { error } = await supabase
                .from('bylaws')
                .insert({
                    ...bylaw,
                    author_id: user.id,
                    is_active: true, // New bylaws are active by default
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

    const updateBylaw = async (id: string, updates: Partial<Omit<Bylaw, 'id' | 'created_at' | 'author_id'>>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('로그인이 필요합니다.')

            // @ts-ignore
            const { error } = await supabase
                .from('bylaws')
                .update({
                    ...updates,
                    updated_at: new Date().toISOString(),
                })
                .eq('id', id)

            if (error) throw error

            if (autoFetch) {
                await fetchCurrentBylaw()
            }
            return { success: true, error: null }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    }

    const setActiveBylaw = async (id: string) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('로그인이 필요합니다.')

            // @ts-ignore
            const { error } = await supabase
                .from('bylaws')
                .update({ is_active: true })
                .eq('id', id)

            if (error) throw error

            if (autoFetch) {
                await fetchCurrentBylaw()
            }
            return { success: true, error: null }
        } catch (err: any) {
            return { success: false, error: err.message }
        }
    }

    const fetchBylawById = async (id: string) => {
        try {
            const { data, error } = await supabase
                .from('bylaws')
                .select('*')
                .eq('id', id)
                .single()

            if (error) throw error
            return { success: true, data, error: null }
        } catch (err: any) {
            return { success: false, data: null, error: err.message }
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
        fetchBylawById,
        createBylaw,
        updateBylaw,
        setActiveBylaw,
    }
}
