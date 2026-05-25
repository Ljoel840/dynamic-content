type ApiEnv = 'development' | 'production';

const API_BASE_URLS: Record<ApiEnv, string> = {
  development: 'http://localhost:8082/romaiamultiprod/',
  production: 'https://roma.multisenal.com.uy/',
};

const getApiEnv = (): ApiEnv => {
  const env = process.env.NEXT_PUBLIC_API_ENV as ApiEnv | undefined;
  if (env === 'development' || env === 'production') return env;
  return process.env.NODE_ENV === 'production' ? 'production' : 'development';
};

export const API_ENV = getApiEnv();
export const API_BASE_URL = API_BASE_URLS[API_ENV];

export const getApiUrl = (path: string) => `${API_BASE_URL}${path.replace(/^\/+/, '')}`;
