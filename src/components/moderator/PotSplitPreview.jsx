import { calculatePotSplit, formatKes } from '../../utils/potSplit';

export default function PotSplitPreview({ totalPot, moderatorFee }) {
  const pot = Number(totalPot) || 0;
  if (pot <= 0) return null;

  const { platformFee, moderationFee, winnerPrize } = calculatePotSplit(pot, moderatorFee);

  return (
    <div className="mt-3 rounded-xl border border-base2 bg-base2/20 p-4 space-y-2">
      <p className="text-[10px] font-black uppercase tracking-widest text-text/50">Payout breakdown</p>
      <div className="flex justify-between text-sm">
        <span className="text-text/70">Total pot</span>
        <span className="font-bold text-text-emphasis">{formatKes(pot)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-text/70">Platform (1.5%)</span>
        <span className="font-bold text-amber-600">{formatKes(platformFee)}</span>
      </div>
      <div className="flex justify-between text-sm">
        <span className="text-text/70">Your moderator fee</span>
        <span className="font-bold text-blue">{formatKes(moderationFee)}</span>
      </div>
      <div className="flex justify-between text-sm border-t border-base2 pt-2">
        <span className="text-text/70">Winner prize</span>
        <span className="font-bold text-emerald-600">{formatKes(winnerPrize)}</span>
      </div>
    </div>
  );
}
