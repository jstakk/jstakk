import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// --- Types ---
type RedeemType = 'bank' | 'giftcard';
type GiftCardProvider = 'Steam' | 'Amazon' | 'Zalando';

interface RedeemFormProps {
  redeemableCoins: number;
  redeem: (amount: number, pin: string, type: 'redeemCash' | 'redeemGift', giftCardProvider?: string) => { success: boolean; message: string };
}

// --- Helper Components ---
const PinInput = ({ pin, setPin, shake }: { pin: string, setPin: (p: string) => void, shake: boolean }) => (
    <motion.div animate={{ x: shake ? [-10, 10, -10, 10, 0] : 0 }} transition={{ duration: 0.5 }}>
        <input
            type="password"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            maxLength={4}
            placeholder="1234"
            className="w-full bg-slate-900 border border-slate-600 rounded p-2 text-center text-2xl tracking-widest"
        />
    </motion.div>
);


// --- Main Component ---
export const RedeemForm: React.FC<RedeemFormProps> = ({ redeemableCoins, redeem }) => {
  const [redeemType, setRedeemType] = useState<RedeemType>('bank');
  const [amount, setAmount] = useState<number>(50);
  const [pin, setPin] = useState<string>('');
  const [selectedGiftCard, setSelectedGiftCard] = useState<GiftCardProvider>('Steam');

  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showConfirmModal, setShowConfirmModal] = useState<boolean>(false);
  const [shakePin, setShakePin] = useState<boolean>(false);


  const handleAmountChange = (value: string) => {
    const numValue = parseInt(value, 10);
    setAmount(isNaN(numValue) ? 0 : numValue);
  };

  const handleRedeemClick = () => {
    // Basic validation before showing modal
    if (amount > redeemableCoins) {
      setError('Ikke nok mynter.');
      return;
    }
    if (amount < 50) {
      setError('Minimumsbeløp er 50 mynter.');
      return;
    }
    setError('');
    setShowConfirmModal(true);
  };

  const handleConfirmRedeem = () => {
    const redeemResult = redeem(
      amount,
      pin,
      redeemType === 'bank' ? 'redeemCash' : 'redeemGift',
      redeemType === 'giftcard' ? selectedGiftCard : undefined
    );

    if (redeemResult.success) {
      setSuccess(redeemResult.message);
      // TODO: Show confetti and snackbar
      setShowConfirmModal(false);
      setPin('');
      setAmount(50);
    } else {
      setError(redeemResult.message);
      if (redeemResult.message.includes('PIN')) {
        setShakePin(true);
        setTimeout(() => setShakePin(false), 500);
      }
    }
  };


  return (
    <div className="bg-slate-800 p-6 rounded-lg border border-yellow-500/50 shadow-lg space-y-6">
        {/* Type Toggle */}
        <div className="flex bg-slate-700 rounded-lg p-1">
            <button onClick={() => setRedeemType('bank')} className={`flex-1 p-2 rounded-md ${redeemType === 'bank' ? 'bg-yellow-500 text-slate-900' : ''}`}>Bankkonto</button>
            <button onClick={() => setRedeemType('giftcard')} className={`flex-1 p-2 rounded-md ${redeemType === 'giftcard' ? 'bg-yellow-500 text-slate-900' : ''}`}>Gavekort</button>
        </div>

        {/* Amount Slider & Input */}
        <div>
            <label className="block text-sm font-medium text-slate-400 mb-2">Beløp (i mynter)</label>
            <div className="flex items-center space-x-4">
                <input type="range" min="50" max={redeemableCoins} step="10" value={amount} onChange={(e) => handleAmountChange(e.target.value)} className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer range-lg accent-yellow-500"/>
                <input type="number" value={amount} onChange={(e) => handleAmountChange(e.target.value)} className="w-24 bg-slate-900 border border-slate-600 rounded p-2 text-center" />
            </div>
        </div>

        {/* Pre-computation view */}
        <div className="bg-slate-900/50 p-4 rounded-lg text-center">
            {redeemType === 'bank' ? (
                <div>
                    <p className="text-lg">Du får <span className="font-bold text-yellow-400">{amount} NOK</span></p>
                    <p className="text-xs text-slate-400">* Overføring tar 1-3 virkedager.</p>
                </div>
            ) : (
                <div className="flex flex-col items-center">
                     <p className="text-lg mb-2">Du får et gavekort på <span className="font-bold text-yellow-400">{amount} NOK</span></p>
                    <div className="flex space-x-4">
                        {['Steam', 'Amazon', 'Zalando'].map((p) => (
                             <button key={p} onClick={() => setSelectedGiftCard(p as GiftCardProvider)} className={`p-2 rounded-lg border-2 ${selectedGiftCard === p ? 'border-yellow-500' : 'border-transparent'}`}>
                                <div className="w-16 h-16 bg-slate-700 rounded flex items-center justify-center">{p}</div>
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>

        {/* Redeem Button */}
        <button onClick={handleRedeemClick} disabled={amount > redeemableCoins || amount < 50} className="w-full bg-yellow-500 text-slate-900 font-bold p-3 rounded-lg hover:bg-yellow-400 disabled:bg-slate-600 disabled:cursor-not-allowed">
            Løs inn {amount} mynter
        </button>

        {/* Modal */}
        {showConfirmModal && (
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
                <div className="bg-slate-800 p-8 rounded-lg shadow-2xl w-full max-w-sm border border-yellow-500/50">
                    <h3 className="text-2xl font-bold mb-4">Bekreft innløsning</h3>
                    <p className="mb-6">Er du sikker på at du vil løse inn {amount} mynter?</p>
                    <div className="space-y-4">
                        <PinInput pin={pin} setPin={setPin} shake={shakePin} />
                        {error && <p className="text-red-500 text-sm text-center">{error}</p>}
                        <button onClick={handleConfirmRedeem} className="w-full bg-green-600 text-white font-bold p-3 rounded-lg hover:bg-green-500">Bekreft & Løs inn</button>
                        <button onClick={() => setShowConfirmModal(false)} className="w-full bg-slate-700 text-white p-2 rounded-lg hover:bg-slate-600">Avbryt</button>
                    </div>
                </div>
            </div>
        )}
         {/* Success Message (placeholder, could be a snackbar) */}
        {success && <p className="text-green-500 bg-green-900/50 p-3 rounded-lg text-center">{success}</p>}
    </div>
  );
};
