import { createClient, User, AuthError } from '@supabase/supabase-js';
import { emit } from 'process';
import{supabaseBrowser} from "@/lib/supabase/supabase-browser"
// Initialize Supabase client
//To be deleted, using browser instead !
// const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
// const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = supabaseBrowser();

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

export type UserProfile = {
  name: string;
  email: string;
  isCoach: boolean;
};

export type FullUser = {
  id: string;
  email: string;
  profile: UserProfile;
};


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
const { data: sessionData } = await supabase.auth.getSession();
console.log("DEBUG A — SESSION RIGHT AFTER LOGIN:", sessionData);

    return {
      success: true,
      message: `Account created successfully. ${sessionData} is in progress. Please check your email to confirm.`,
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
    const { data: { session } } = await supabase.auth.getSession();

if (session) {
  console.log('User has active session');
} else {
  console.log('No active session');
}

    const { data:{user}, error: authError } = await supabase.auth.getUser();
console.log("auth.getUser result:", user);

    if ( !user) {
      return {
        user: null,
        error: authError?.message || "No authenticated user"
      };
    }
        console.log("Call before")

    const { data: profileData, error: profileError } = await supabase
      .from("user")
      .select("*")
      .eq("email", user.email)
      .single();
  // logst TBD
// console.log("PROFILE FETCH ERROR:", profileError);
// console.log("PROFILE FETCH RESPONSE:", profileData);

    if (profileError) {
      return {
        user: null,
        error: profileError.message
      };
    }


    const fullUser: FullUser  = {
      id: user.id,
      email: user.email ?? profileData.email,
      profile: {
        name: profileData.name,
        email: profileData.email,
        isCoach: profileData.isCoach ?? profileData.is_coach,
      },
    };
    console.log("calling after")
console.log(fullUser.profile.name)

    return { user: fullUser, error: null };

  } catch (err) {
    return {
      user: null,
      error:  "Unexpected error"
    };
  }
}
