export const PLATFORM_RATE = 0.015;

export function calculatePotSplit(totalPot, moderatorFee = 0) {
  const pot = Number(totalPot) || 0;
  const platformFee = pot * PLATFORM_RATE;
  const maxModeratorFee = Math.max(0, pot - platformFee);
  const moderationFee = Math.min(Math.max(0, Number(moderatorFee) || 0), maxModeratorFee);
  const winnerPrize = Math.max(0, pot - platformFee - moderationFee);

  return { totalPot: pot, platformFee, moderationFee, winnerPrize };
}

export function formatKes(amount) {
  return `KES ${Math.round(Number(amount) || 0).toLocaleString()}`;
}

export function winnerPrize(totalPot, moderatorFee = 0) {
  return calculatePotSplit(totalPot, moderatorFee).winnerPrize;
}
