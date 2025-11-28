import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    let supabaseResponse = NextResponse.next({
        request,
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value, options }) => request.cookies.set(name, value))
                    supabaseResponse = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) =>
                        supabaseResponse.cookies.set(name, value, options)
                    )
                },
            },
        }
    )

    // IMPORTANT: Avoid writing any logic between createServerClient and
    // supabase.auth.getUser(). A simple mistake could make it very hard to debug
    // issues with users being randomly logged out.

    const {
        data: { user },
    } = await supabase.auth.getUser()

    // 인증이 필요한 경로 확인
    const isAuthRoute = request.nextUrl.pathname.startsWith('/login') ||
        request.nextUrl.pathname.startsWith('/join')
    const isPendingRoute = request.nextUrl.pathname.startsWith('/pending')
    const isProtectedRoute = request.nextUrl.pathname.startsWith('/bylaws') ||
        request.nextUrl.pathname.startsWith('/finance') ||
        request.nextUrl.pathname.startsWith('/members') ||
        request.nextUrl.pathname.startsWith('/my-page')

    // 미인증 사용자가 보호된 경로에 접근하려고 하면 로그인 페이지로 리다이렉트
    if (!user && (isProtectedRoute || isPendingRoute)) {
        const url = request.nextUrl.clone()
        url.pathname = '/login'
        return NextResponse.redirect(url)
    }

    // 인증된 사용자의 역할 확인
    if (user) {
        const { data: member } = await supabase
            .from('members')
            .select('role')
            .eq('id', user.id)
            .single()

        // GUEST 사용자는 pending 페이지로만 접근 가능
        if (member?.role === 'GUEST') {
            if (!isPendingRoute && !isAuthRoute) {
                const url = request.nextUrl.clone()
                url.pathname = '/pending'
                return NextResponse.redirect(url)
            }
        } else {
            // MEMBER 이상은 pending 페이지 접근 불가
            if (isPendingRoute) {
                const url = request.nextUrl.clone()
                url.pathname = '/bylaws'
                return NextResponse.redirect(url)
            }
            // 로그인/회원가입 페이지 접근 시 메인 페이지로 리다이렉트
            if (isAuthRoute) {
                const url = request.nextUrl.clone()
                url.pathname = '/bylaws'
                return NextResponse.redirect(url)
            }
        }
    }

    return supabaseResponse
}
