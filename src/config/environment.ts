/**
 * Centralized environment configuration.
 * All environment-dependent values should be read from here.
 */

const env = {
  /** Current mode: 'development' | 'production' */
  mode: import.meta.env.MODE as 'development' | 'production',

  /** True when running in production build */
  isProd: import.meta.env.PROD,

  /** True when running in development */
  isDev: import.meta.env.DEV,

  /** Supabase project URL */
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL as string,

  /** Supabase public anon key */
  supabaseAnonKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string,

  /** Supabase project ID */
  supabaseProjectId: import.meta.env.VITE_SUPABASE_PROJECT_ID as string,

  /** Base URL for edge functions */
  get edgeFunctionsUrl() {
    return `${this.supabaseUrl}/functions/v1`;
  },
} as const;

export default env;
