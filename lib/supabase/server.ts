import { createClient } from "@supabase/supabase-js";

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  return Boolean(
    url &&
    key &&
    !url.includes("placeholder") &&
    !url.includes("your-project-id") &&
    url.startsWith("https://")
  );
}

export function createServerClient() {
  if (!isSupabaseConfigured()) {
    // Return a lightweight mock client that fails immediately without network timeout
    return {
      from: () => ({
        select: () => ({
          eq: () => ({
            order: () => Promise.resolve({ data: null, error: new Error("Supabase unconfigured") }),
            single: () => Promise.resolve({ data: null, error: new Error("Supabase unconfigured") }),
            gte: () => Promise.resolve({ data: null, error: new Error("Supabase unconfigured") }),
          }),
          gte: () => ({
            order: () => Promise.resolve({ data: null, error: new Error("Supabase unconfigured") }),
          }),
          order: () => Promise.resolve({ data: null, error: new Error("Supabase unconfigured") }),
          single: () => Promise.resolve({ data: null, error: new Error("Supabase unconfigured") }),
        }),
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: { id: "mock-" + Date.now() }, error: null }),
          }),
          then: (resolve: any) => resolve({ data: null, error: null }),
        }),
        update: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
        }),
        delete: () => ({
          eq: () => Promise.resolve({ data: null, error: null }),
        }),
      }),
    } as any;
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
    },
    global: {
      fetch: (url, options = {}) => {
        // Enforce a strict 1500ms timeout so external networks never freeze the floor tablet
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 1500);
        return fetch(url, {
          ...options,
          signal: controller.signal,
        }).finally(() => clearTimeout(timeoutId));
      },
    },
  });
}
