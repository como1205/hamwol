'use client'

import { createClient } from '@/lib/supabase/client'
import { useState, useEffect, useCallback } from 'react'

export interface Transaction {
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

export function useTransactions({ autoFetch = true } = {}) {
    const [transactions, setTransactions] = useState<Transaction[]>([])
    const [currentBalance, setCurrentBalance] = useState(0)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const supabase = createClient()

    const fetchTransactions = useCallback(async () => {
        try {
            setLoading(true)
            const { data, error } = await supabase
                .from('transactions')
                .select('*')
                .order('date', { ascending: false })
                .order('created_at', { ascending: false })

            if (error) throw error

            setTransactions(data || [])

            // 최신 거래의 잔액을 현재 잔액으로 설정
            if (data && data.length > 0) {
                setCurrentBalance(data[0].balance)
            } else {
                setCurrentBalance(0)
            }
        } catch (err: any) {
            setError(err.message)
        } finally {
            setLoading(false)
        }
    }, [])

    const createTransaction = async (transaction: Omit<Transaction, 'id' | 'balance' | 'created_at' | 'created_by'>) => {
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('로그인이 필요합니다.')

            // 현재 잔액 계산을 위해 최신 거래 조회
            const { data: latestTransaction, error: fetchError } = await supabase
                .from('transactions')
                .select('balance')
                .order('date', { ascending: false })
                .order('created_at', { ascending: false })
                .limit(1)
                .maybeSingle()

            if (fetchError) throw fetchError

            const previousBalance = latestTransaction?.balance || 0
            const newBalance = transaction.type === 'DEPOSIT'
                ? previousBalance + Number(transaction.amount)
                : previousBalance - Number(transaction.amount)

            // @ts-ignore
            const { error } = await supabase
                .from('transactions')
                .insert({
                    ...transaction,
                    balance: newBalance,
                    created_by: user.id,
                })

            if (error) throw error

            if (autoFetch) {
                await fetchTransactions()
            }
            return { success: true, error: null }
        } catch (err: any) {
            console.error('Transaction Error:', err)
            return { success: false, error: err.message }
        }
    }

    useEffect(() => {
        if (autoFetch) {
            fetchTransactions()
        } else {
            setLoading(false)
        }
    }, [fetchTransactions, autoFetch])

    return {
        transactions,
        currentBalance,
        loading,
        error,
        fetchTransactions,
        createTransaction,
    }
}
