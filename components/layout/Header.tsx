'use client'

import { useAuth } from '@/lib/hooks/useAuth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function Header() {
    const { member, signOut } = useAuth()

    const handleSignOut = async () => {
        if (confirm('로그아웃하시겠습니까?')) {
            await signOut()
        }
    }

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-white">
            <div className="container flex h-16 items-center justify-between px-4">
                <div className="flex items-center gap-2">
                    <h1 className="text-2xl font-bold text-blue-600">함월</h1>
                </div>

                <div className="flex items-center gap-6">
                    {/* Desktop Navigation */}
                    <nav className="hidden sm:flex items-center gap-6">
                        <Link href="/bylaws" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">회칙</Link>
                        <Link href="/finance" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">장부</Link>
                        <Link href="/members" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">회원</Link>
                        <Link href="/my-page" className="text-sm font-medium text-gray-600 hover:text-blue-600 transition-colors">내정보</Link>
                    </nav>

                    <div className="flex items-center gap-4">
                        {member && (
                            <>
                                <div className="hidden sm:flex items-center gap-2 text-sm">
                                    <span className="font-medium">{member.name}</span>
                                    <span className="text-gray-500">
                                        ({member.role === 'PRESIDENT' ? '회장' : member.role === 'ADMIN' ? '관리자' : '회원'})
                                    </span>
                                </div>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={handleSignOut}
                                >
                                    로그아웃
                                </Button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
