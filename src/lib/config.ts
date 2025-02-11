export function getJwtSecret(): string {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }
  if (secret.length < 32) {
    throw new Error('JWT_SECRET should be at least 32 characters long');
  }
  return secret;
}

export function getDatabaseUrl(): string {
  if (process.env.NODE_ENV === 'production') {
    return process.env.POSTGRES_PRISMA_URL || '';
  }
  return process.env.DATABASE_URL || 'file:./dev.db';
}

export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
} 