export function getExpiresAtDate(): Date {
  return new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
}

export function calculateTTL(expiresAt: Date | null): number {
  if (expiresAt) {
    return Math.floor((expiresAt.getTime() - Date.now()) / 1000);
  }

  return 86400;
}
