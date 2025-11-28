'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

const navItems = [
    { href: '/bylaws', label: '회칙', icon: '📋' },
    { href: '/finance', label: '장부', icon: '💰' },
    { href: '/members', label: '회원', icon: '👥' },
    { href: '/my-page', label: '내정보', icon: '⚙️' },
]

export function Navigation() {
    const pathname = usePathname()

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-white sm:hidden">
            <div className="flex items-center justify-around">
                {navItems.map((item) => {
                    const isActive = pathname.startsWith(item.href)
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                'flex flex-1 flex-col items-center gap-1 py-3 text-xs transition-colors',
                                isActive
                                    ? 'text-blue-600 font-medium'
                                    : 'text-gray-600 hover:text-blue-600'
                            )}
                        >
                            <span className="text-xl">{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    )
                })}
            </div>
        </nav>
    )
}
