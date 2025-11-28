import { createClient } from '@/lib/supabase/server';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: '이메일과 비밀번호를 입력해주세요.'
      }, { status: 400 });
    }

    const supabase = await createClient();

    // Sign in the user using Supabase Auth
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Login Error:', error);
      return NextResponse.json({
        success: false,
        error: error.message
      }, { status: 400 });
    }

    // Set the session cookies
    const nextCookies = cookies();

    if (data.session) {
      // In a real implementation, you'd want to properly handle the session cookies
      // with Supabase SSR utilities, but for now we'll return success
      // which the frontend can handle appropriately
    }

    // Return success response
    return NextResponse.json({
      success: true,
      user: data.user
    });

  } catch (error: any) {
    console.error('Server Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}