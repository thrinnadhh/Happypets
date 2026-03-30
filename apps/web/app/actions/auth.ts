/**
 * Server Actions for Authentication
 * Handles login, register, logout, profile updates, and security
 */

'use server';

import { redirect } from 'next/navigation';
import { headers } from 'next/headers';
import { revalidatePath } from 'next/cache';
import createClient, { getUser, getSession } from '@/lib/supabase/server';
import { 
  loginSchema, 
  registerSchema, 
  changePasswordSchema,
  UserRole,
  UserStatus
} from '@happypets/shared';
import type { 
  LoginInput, 
  RegisterInput, 
  ChangePasswordInput 
} from '@happypets/shared';
import { getLogger } from '@/lib/logger';
import { rateLimit, clearCart } from '@/lib/redis';

const logger = getLogger('auth:actions');

/**
 * Get client IP address from request headers
 */
const getClientIp = async (): Promise<string> => {
  const headersList = await headers();
  return (
    headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headersList.get('x-real-ip') ||
    'unknown'
  );
};

/**
 * Determine redirect path based on user role
 */
const getRedirectPath = (role: UserRole): string => {
  switch (role) {
    case UserRole.SUPERADMIN:
      return '/superadmin/dashboard';
    case UserRole.ADMIN:
      return '/admin/dashboard';
    case UserRole.CUSTOMER:
    default:
      return '/';
  }
};

/**
 * Login user with rate limiting and role-based redirection
 */
export async function loginAction(input: LoginInput) {
  try {
    const validatedInput = loginSchema.parse(input);

    // Apply rate limiting: 10 attempts per minute per IP
    const clientIp = await getClientIp();
    const rateLimitResult = await rateLimit(clientIp, 10, 60);

    if (!rateLimitResult.allowed) {
      logger.warn(`Rate limit exceeded for IP ${clientIp}`);
      return {
        success: false,
        error: 'Too many login attempts. Please try again later.',
      };
    }

    const supabase = createClient();

    const { error, data } = await supabase.auth.signInWithPassword({
      email: validatedInput.email,
      password: validatedInput.password,
    });

    if (error) {
      logger.warn(`Login failed for ${validatedInput.email}: ${error.message}`);
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Login failed',
      };
    }

    // Fetch profile to check status and determine redirect
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role, is_active')
      .eq('id', data.user.id)
      .single();

    if (profileError || !profile) {
      logger.error(`Profile not found for user ${data.user.id}`);
      return {
        success: false,
        error: 'User profile not found. Please contact support.',
      };
    }

    // Check account status
    if (!profile.is_active) {
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'Your account has been suspended. Please contact support.',
      };
    }

    logger.info(`User ${data.user.id} logged in with role ${profile.role}`);

    // Redirect based on role
    const redirectPath = getRedirectPath(profile.role as UserRole);
    
    // In Next.js Server Actions, we return the path and let the client handle redirect 
    // OR we can use redirect() but it must be the last thing.
    // For better DX in client components, we'll return it.
    return {
      success: true,
      redirect: redirectPath,
      user: { ...data.user, role: profile.role },
    };
  } catch (error: any) {
    logger.error('Login action error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during login',
    };
  }
}

/**
 * Register new user with rate limiting
 */
export async function registerAction(input: RegisterInput) {
  try {
    const validatedInput = registerSchema.parse(input);

    // Apply rate limiting: 5 registration attempts per minute per IP
    const clientIp = await getClientIp();
    const rateLimitResult = await rateLimit(clientIp, 5, 60);

    if (!rateLimitResult.allowed) {
      return {
        success: false,
        error: 'Too many registration attempts. Please try again later.',
      };
    }

    const supabase = createClient();

    // Sign up with Supabase Auth
    // Note: Profiles are created via database triggers on auth.users insert
    const { error: signUpError, data } = await supabase.auth.signUp({
      email: validatedInput.email,
      password: validatedInput.password,
      options: {
        data: {
          full_name: validatedInput.full_name,
          phone: validatedInput.phone,
        },
      },
    });

    if (signUpError) {
      logger.warn(`Registration failed for ${validatedInput.email}: ${signUpError.message}`);
      return {
        success: false,
        error: signUpError.message,
      };
    }

    if (!data.user) {
      return {
        success: false,
        error: 'Registration failed. Please try again.',
      };
    }

    logger.info(`New user registered: ${data.user.id}`);

    return {
      success: true,
      message: 'Registration successful! Please check your email for verification.',
    };
  } catch (error: any) {
    logger.error('Register action error:', error);
    return {
      success: false,
      error: error.message || 'An error occurred during registration',
    };
  }
}

/**
 * logoutAction: Sign out user and clear cache
 */
export async function logoutAction() {
  try {
    const session = await getSession();
    if (session?.user?.id) {
      // Clear user cart from Redis on logout
      await clearCart(session.user.id);
    }

    const supabase = createClient();
    await supabase.auth.signOut();
    
    logger.info('User logged out');
  } catch (error) {
    logger.error('Logout action error:', error);
  }

  revalidatePath('/', 'layout');
  redirect('/login');
}

/**
 * updateProfileAction: Update user metadata and profile table
 */
export async function updateProfileAction(formData: FormData) {
  try {
    const user = await getUser();
    if (!user) return { success: false, error: 'Unauthorized' };

    const full_name = formData.get('full_name') as string;
    const phone = formData.get('phone') as string;

    const supabase = createClient();

    // Update profiles table
    const { error: profileError } = await supabase
      .from('profiles')
      .update({ full_name, phone, updated_at: new Date().toISOString() })
      .eq('id', user.id);

    if (profileError) throw profileError;

    // Update Auth metadata
    await supabase.auth.updateUser({
      data: { full_name, phone }
    });

    revalidatePath('/profile');
    return { success: true, message: 'Profile updated successfully' };
  } catch (error: any) {
    logger.error('Update profile error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * changePasswordAction: Securely update user password
 */
export async function changePasswordAction(input: ChangePasswordInput) {
  try {
    const validatedInput = changePasswordSchema.parse(input);
    const supabase = createClient();

    const { error } = await supabase.auth.updateUser({
      password: validatedInput.new_password
    });

    if (error) throw error;

    return { success: true, message: 'Password changed successfully' };
  } catch (error: any) {
    logger.error('Change password error:', error);
    return { success: false, error: error.message };
  }
}

/**
 * verifyEmailAction: Handle email verification tokens
 */
export async function verifyEmailAction(token: string, type: 'signup' | 'recovery' = 'signup') {
  try {
    const supabase = createClient();
    const { error } = await supabase.auth.verifyOtp({
      token_hash: token,
      type: type === 'signup' ? 'signup' : 'recovery',
    });

    if (error) throw error;

    return { success: true, redirect: '/login?verified=true' };
  } catch (error: any) {
    logger.error('Email verification error:', error);
    return { success: false, error: error.message };
  }
}

