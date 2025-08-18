import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../supabase';

// Start Supabase OAuth flow for Google using Expo WebBrowser auth session
export async function signInWithGoogle(desiredRole?: 'worker' | 'hirer'): Promise<void> {
  const redirectTo = AuthSession.makeRedirectUri({ scheme: 'ez-clear', path: 'auth/callback' });

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo,
      skipBrowserRedirect: true as any,
    },
  });
  if (error) throw error;

  const authUrl = data?.url;
  if (!authUrl) throw new Error('Failed to start Google OAuth flow');

  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectTo);
  if (result.type !== 'success' || !result.url) {
    throw new Error('Google sign-in was cancelled or failed');
  }

  // Handle both flows: code (PKCE) and implicit (access_token in hash)
  const url = result.url as string;
  console.log('OAuth redirect URL (Google):', url);
  const parsed = new URL(url);

  // Try code flow first
  let code = parsed.searchParams.get('code');
  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;
  } else {
    // Fallback: implicit flow (tokens in hash)
    const hashParams = new URLSearchParams(parsed.hash.replace(/^#/, ''));
    const access_token = hashParams.get('access_token') || undefined;
    const refresh_token = hashParams.get('refresh_token') || undefined;
    if (access_token && refresh_token) {
      const { error: setErr } = await supabase.auth.setSession({ access_token, refresh_token });
      if (setErr) throw setErr;
    } else {
      throw new Error('Missing authorization code');
    }
  }

  // Ensure profile exists and has the correct user_type
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    const meta: any = user.user_metadata || {};
    const role = (desiredRole || (meta.user_type as 'worker' | 'hirer') || 'worker');

    const { data: existing } = await supabase
      .from('profiles')
      .select('id, user_type')
      .eq('id', user.id)
      .maybeSingle();

    if (!existing) {
      await supabase.from('profiles').upsert(
        {
          id: user.id,
          email: user.email,
          full_name: meta.full_name || meta.name || (user.email ?? '').split('@')[0],
          name: meta.name || (user.email ?? '').split('@')[0],
          avatar_url: meta.avatar_url || meta.picture,
          user_type: role,
          is_online: true,
        },
        { onConflict: 'id' }
      );
    } else if (desiredRole && existing.user_type !== desiredRole) {
      // If profile exists but has a different role, update it to match selection
      await supabase
        .from('profiles')
        .update({ user_type: desiredRole })
        .eq('id', user.id);
    }
  }
}
