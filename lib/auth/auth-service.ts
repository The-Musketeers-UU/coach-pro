import { createClient, User, AuthError } from '@supabase/supabase-js';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface SignUpData {
  email: string;
  password: string;
  name?: string;
  isCoach?: boolean;
}

interface AuthResult {
  success: boolean;
  message: string;
  user?: User | null;
  error?: string | null;
  details?: AuthError | Error | unknown; // Added for debugging
}

/**
 * Sign up a new user with email and password
 */
export async function signUpUser(data: SignUpData): Promise<AuthResult> {
  console.log('🔵 signUpUser called with:', {
    email: data.email,
    hasPassword: !!data.password,
    passwordLength: data.password?.length,
    name: data.name,
    isCoach: data.isCoach
  });

  try {
    const { email, password, name, isCoach } = data;

    // Validate input
    if (!email || !password) {
      console.error('❌ Missing credentials');
      return {
        success: false,
        message: 'Email and password are required',
        error: 'MISSING_CREDENTIALS'
      };
    }

    if (password.length < 6) {
      console.error('❌ Password too short:', password.length);
      return {
        success: false,
        message: 'Password must be at least 6 characters',
        error: 'WEAK_PASSWORD'
      };
    }

    console.log('🟡 Calling Supabase signUp...');

    // Sign up the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name: name?.trim() || undefined,
          isCoach: isCoach || false,
        },
      },
    });

    console.log('🟡 Supabase signUp response:', {
      hasUser: !!authData?.user,
      userId: authData?.user?.id,
      userEmail: authData?.user?.email,
      hasSession: !!authData?.session,
      error: signUpError
    });

    if (signUpError) {
      console.error('❌ SignUp error:', {
        message: signUpError.message,
        code: signUpError.code,
        status: signUpError.status,
        fullError: signUpError
      });
      
      return {
        success: false,
        message: signUpError.message,
        error: signUpError.code || 'SIGNUP_ERROR',
        details: signUpError
      };
    }

    console.log('✅ User signed up successfully:', authData.user?.id);

    return {
      success: true,
      message: 'Account created successfully. Please check your email to confirm.',
      user: authData.user
    };
  } catch (error) {
    console.error('❌ Unexpected error in signUpUser:', error);
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      error: 'UNKNOWN_ERROR',
      details: error
    };
  }
}

/**
 * Sign in an existing user with email and password
 */
export async function signInUser(email: string, password: string): Promise<AuthResult> {
  console.log('🔵 signInUser called with:', { email, hasPassword: !!password });

  try {
    if (!email || !password) {
      console.error('❌ Missing credentials');
      return {
        success: false,
        message: 'Email and password are required',
        error: 'MISSING_CREDENTIALS'
      };
    }

    console.log('🟡 Calling Supabase signInWithPassword...');

    const { data: authData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    console.log('🟡 Supabase signIn response:', {
      hasUser: !!authData?.user,
      userId: authData?.user?.id,
      hasSession: !!authData?.session,
      error: signInError
    });

    if (signInError) {
      console.error('❌ SignIn error:', {
        message: signInError.message,
        code: signInError.code,
        status: signInError.status,
        fullError: signInError
      });
      
      return {
        success: false,
        message: signInError.message,
        error: signInError.code || 'SIGNIN_ERROR',
        details: signInError
      };
    }

    console.log('✅ User signed in successfully:', authData.user?.id);

    return {
      success: true,
      message: 'Signed in successfully',
      user: authData.user
    };
  } catch (error) {
    console.error('❌ Unexpected error in signInUser:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      error: 'UNKNOWN_ERROR',
      details: error
    };
  }
}

/**
 * Sign out the current user
 */
export async function signOutUser(): Promise<AuthResult> {
  console.log('🔵 signOutUser called');

  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error('❌ SignOut error:', error);
      return {
        success: false,
        message: error.message,
        error: 'SIGNOUT_ERROR',
        details: error
      };
    }

    console.log('✅ User signed out successfully');

    return {
      success: true,
      message: 'Signed out successfully'
    };
  } catch (error) {
    console.error('❌ Unexpected error in signOutUser:', error);
    
    return {
      success: false,
      message: error instanceof Error ? error.message : 'An unexpected error occurred',
      error: 'UNKNOWN_ERROR',
      details: error
    };
  }
}

/**
 * Get the current authenticated user
 */
export async function getCurrentUser() {
  console.log('🔵 getCurrentUser called');

  try {
    const { data: { user }, error } = await supabase.auth.getUser();

    console.log('🟡 getCurrentUser response:', {
      hasUser: !!user,
      userId: user?.id,
      error: error
    });

    if (error) {
      console.error('❌ GetUser error:', error);
      return { user: null, error: error.message };
    }

    console.log('✅ Current user retrieved:', user?.id);

    return { user, error: null };
  } catch (error) {
    console.error('❌ Unexpected error in getCurrentUser:', error);
    
    return {
      user: null,
      error: error instanceof Error ? error.message : 'An unexpected error occurred'
    };
  }
}