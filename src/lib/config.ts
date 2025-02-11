export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    // 在开发环境使用默认密钥
    if (process.env.NODE_ENV === 'development') {
      return 'development-jwt-secret-key-32-chars-long';
    }
    throw new Error('JWT_SECRET environment variable is not set');
  }
  if (secret.length < 32) {
    console.warn('Warning: JWT_SECRET should be at least 32 characters long for security');
  }
  return secret;
}

export function getDatabaseUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return process.env.DATABASE_URL || '';
  }
  return process.env.DATABASE_URL || 'file:./dev.db';
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}