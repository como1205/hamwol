'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import type { User } from '@supabase/supabase-js'

interface Member {
    id: string
    email: string
    name: string
    phone: string | null
    role: 'MEMBER' | 'ADMIN' | 'PRESIDENT'
    status: 'ACTIVE' | 'INACTIVE' | 'WITHDRAWN'
    joined_at: string
    updated_at: string
}

export function useAuth() {
    const [user, setUser] = useState<User | null>(null)
    const [member, setMember] = useState<Member | null>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()
    const supabase = createClient()

    useEffect(() => {
        // 현재 사용자 가져오기
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user)

            if (user) {
                // 회원 정보 가져오기
                const { data: memberData } = await supabase
                    .from('members')
                    .select('*')
                    .eq('id', user.id)
                    .single()

                setMember(memberData)
            }

            setLoading(false)
        }

        getUser()

        // 인증 상태 변경 감지
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
            async (event, session) => {
                setUser(session?.user ?? null)

                if (session?.user) {
                    const { data: memberData } = await supabase
                        .from('members')
                        .select('*')
                        .eq('id', session.user.id)
                        .single()

                    setMember(memberData)
                } else {
                    setMember(null)
                }

                setLoading(false)
            }
        )

        return () => {
            subscription.unsubscribe()
        }
    }, [supabase, router])

    // 회원가입
    const signUp = async (email: string, password: string, name: string, phone?: string) => {
        console.log('Starting signup process with data:', { email, name, phone });

        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, name, phone }),
            });

            const data = await response.json();
            console.log('Backend signup response:', data);

            if (!data.success) {
                console.error('Signup failed:', data.error);
                return { success: false, error: data.error };
            }

            // On successful signup, redirect to bylaws
            router.push('/bylaws');
            return { success: true, error: null };
        } catch (error: any) {
            console.error('Signup error:', error);
            return { success: false, error: error.message };
        }
    }

    // 로그인
    const signIn = async (email: string, password: string) => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();
            console.log('Backend login response:', data);

            if (!data.success) {
                return { success: false, error: data.error };
            }

            router.push('/bylaws');
            return { success: true, error: null };
        } catch (error: any) {
            return { success: false, error: error.message };
        }
    }

    // 로그아웃
    const signOut = async () => {
        try {
            const { error } = await supabase.auth.signOut()
            if (error) throw error

            router.push('/login')
            return { success: true, error: null }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }

    // 내 정보 수정
    const updateProfile = async (name: string, phone?: string) => {
        try {
            if (!user) throw new Error('로그인이 필요합니다.')

            // @ts-ignore
            const { error } = await supabase
                .from('members')
                .update({
                    name,
                    phone: phone || null,
                    updated_at: new Date().toISOString(),
                } as any)
                .eq('id', user.id)

            if (error) throw error

            // 로컬 상태 업데이트
            if (member) {
                setMember({
                    ...member,
                    name,
                    phone: phone || null,
                })
            }

            return { success: true, error: null }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }

    // 비밀번호 변경
    const updatePassword = async (newPassword: string) => {
        try {
            const { error } = await supabase.auth.updateUser({
                password: newPassword,
            })

            if (error) throw error

            return { success: true, error: null }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }

    // 회원 탈퇴
    const withdraw = async () => {
        try {
            if (!user) throw new Error('로그인이 필요합니다.')

            // @ts-ignore
            const { error } = await supabase
                .from('members')
                .update({
                    status: 'WITHDRAWN',
                    updated_at: new Date().toISOString(),
                } as any)
                .eq('id', user.id)

            if (error) throw error

            await signOut()
            return { success: true, error: null }
        } catch (error: any) {
            return { success: false, error: error.message }
        }
    }

    return {
        user,
        member,
        loading,
        signUp,
        signIn,
        signOut,
        updateProfile,
        updatePassword,
        withdraw,
    }
}
