import * as AuthSession from 'expo-auth-session';
import * as WebBrowser from 'expo-web-browser';
import { supabase } from '../supabase';

// Start Supabase OAuth flow for Facebook using Expo WebBrowser auth session
export async function signInWithFacebook(desiredRole?: 'worker' | 'hirer'): Promise<void> {
  const redirectTo = AuthSession.makeRedirectUri({ scheme: 'ez-clear', path: 'auth/callback' });

  // Ask Supabase to create the OAuth URL (do not auto-redirect in RN)
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'facebook',
    options: {
      redirectTo,
      skipBrowserRedirect: true as any,
      scopes: 'email,public_profile',
    },
  });
  if (error) throw error;

  const authUrl = data?.url;
  if (!authUrl) throw new Error('Failed to start Facebook OAuth flow');

  // Open the system browser auth session and wait for redirect back into the app
  const result = await WebBrowser.openAuthSessionAsync(authUrl, redirectTo);
  if (result.type !== 'success' || !result.url) {
    throw new Error('Facebook sign-in was cancelled or failed');
  }

  // Handle both flows: code and implicit
  const url = result.url as string;
  const parsed = new URL(url);
  let code = parsed.searchParams.get('code');

  if (code) {
    const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
    if (exchangeError) throw exchangeError;
  } else {
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
      await supabase
        .from('profiles')
        .update({ user_type: desiredRole })
        .eq('id', user.id);
    }
  }
}
