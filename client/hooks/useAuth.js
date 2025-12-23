// hooks/useAuth.js
import { useEffect, useState } from "react";
import { supabase } from "../../supabase"

export function useAuth() {
  const [loading, setLoading] = useState(true);
  const [session, setSession] = useState(null);
  const user = session?.user ?? null;

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setSession(data.session ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_ev, sess) => {
      if (!mounted) return;
      setSession(sess ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return { loading, session, user };
}
