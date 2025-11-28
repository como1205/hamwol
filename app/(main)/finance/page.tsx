'use client'

import { useTransactions } from '@/lib/hooks/useTransactions'
import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import Link from 'next/link'
import { format } from 'date-fns'

export default function FinancePage() {
    const { transactions, currentBalance, loading, error } = useTransactions()
    const { member } = useAuth()
    const isAdmin = member?.role === 'ADMIN' || member?.role === 'PRESIDENT'

    if (loading) {
        return <div className="p-4 text-center">로딩 중...</div>
    }

    if (error) {
        return <div className="p-4 text-center text-red-600">에러 발생: {error}</div>
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">장부</h1>
                {isAdmin && (
                    <Button asChild size="sm">
                        <Link href="/finance/new">거래 등록</Link>
                    </Button>
                )}
            </div>

            {/* 현재 잔액 카드 */}
            <Card className="bg-gradient-to-br from-blue-500 to-blue-600 p-6 text-white">
                <h2 className="mb-2 text-sm font-medium opacity-90">현재 잔액</h2>
                <div className="text-3xl font-bold">
                    {currentBalance.toLocaleString()}원
                </div>
            </Card>

            {/* 거래 내역 리스트 */}
            <div className="space-y-4">
                <h3 className="text-lg font-semibold text-gray-900">최근 거래 내역</h3>

                {transactions.length > 0 ? (
                    transactions.map((transaction) => (
                        <Card key={transaction.id} className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex flex-col gap-1">
                                    <div className="flex items-center gap-2">
                                        <span className="font-medium">{transaction.category}</span>
                                        <span className="text-xs text-gray-500">
                                            {format(new Date(transaction.date), 'yyyy.MM.dd')}
                                        </span>
                                    </div>
                                    <p className="text-sm text-gray-600">{transaction.description}</p>
                                </div>
                                <div className={`text-lg font-bold ${transaction.type === 'DEPOSIT' ? 'text-blue-600' : 'text-red-600'
                                    }`}>
                                    {transaction.type === 'DEPOSIT' ? '+' : '-'}
                                    {transaction.amount.toLocaleString()}
                                </div>
                            </div>
                            <div className="mt-2 text-right text-xs text-gray-400">
                                잔액: {transaction.balance.toLocaleString()}
                            </div>
                        </Card>
                    ))
                ) : (
                    <Card className="p-12 text-center text-gray-500">
                        거래 내역이 없습니다.
                    </Card>
                )}
            </div>
        </div>
    )
}
