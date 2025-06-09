import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import Dashboard from './Dashboard';
import Login from './Login';

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });
    supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });
  }, []);

  return session ? (
    <Dashboard session={session} />
  ) : (
    <Login />
  );
}