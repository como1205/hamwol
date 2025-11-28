import { createServiceClient } from '@/lib/supabase/service';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { email, password, name, phone } = await request.json();

    if (!email || !password || !name) {
      return NextResponse.json({
        success: false,
        error: '이메일, 비밀번호, 이름은 필수입니다.'
      }, { status: 400 });
    }

    const supabase = createServiceClient();

    // Create new user in Supabase Auth
    // The 'on_auth_user_created' trigger in Supabase will automatically
    // create the corresponding record in the 'members' table.
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Automatically confirm email
      user_metadata: {
        name,
        phone: phone || null
      }
    });

    if (authError) {
      console.error('Auth Error:', authError);
      // Handle "User already registered" specifically if needed, 
      // but passing the message is usually sufficient.
      return NextResponse.json({
        success: false,
        error: authError.message
      }, { status: 400 });
    }

    return NextResponse.json({
      success: true,
      message: '회원가입이 성공적으로 완료되었습니다.'
    });

  } catch (error: any) {
    console.error('Server Error:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}