"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type SessionState = {
  loading: boolean;
  hasSession: boolean;
  userId: string | null;
  email: string | null;
  error: string | null;
};

export default function SessionTestPage() {
  const [state, setState] = useState<SessionState>({
    loading: true,
    hasSession: false,
    userId: null,
    email: null,
    error: null,
  });

  useEffect(() => {
    const run = async () => {
      try {
        const supabase = createClient();

        const {
          data: { session },
          error,
        } = await supabase.auth.getSession();

        setState({
          loading: false,
          hasSession: !!session,
          userId: session?.user?.id ?? null,
          email: session?.user?.email ?? null,
          error: error?.message ?? null,
        });
      } catch (err: any) {
        setState({
          loading: false,
          hasSession: false,
          userId: null,
          email: null,
          error: err?.message ?? "Error desconocido",
        });
      }
    };

    run();
  }, []);

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <h1 className="text-2xl font-bold mb-6">Session Test (browser)</h1>

      {state.loading ? (
        <p>Cargando...</p>
      ) : (
        <pre className="bg-zinc-900 p-4 rounded-xl border border-zinc-700 overflow-x-auto">
          {JSON.stringify(state, null, 2)}
        </pre>
      )}
    </main>
  );
}