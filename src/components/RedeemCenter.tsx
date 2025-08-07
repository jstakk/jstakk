import React from 'react';
import { useRedeem } from '../hooks/useRedeem';
import { RedeemForm } from './RedeemForm';
import { TxHistory } from './TxHistory';

export const RedeemCenter: React.FC = () => {
  const { redeemableCoins, transactions, redeem } = useRedeem();

  return (
    <div className="p-4 md:p-8">
      <header className="mb-8 text-center">
        <h1 className="text-4xl font-bold text-yellow-400">Innløsning & Historikk</h1>
        <p className="text-slate-400 mt-2">
          Du har <span className="font-bold text-yellow-300">{redeemableCoins.toLocaleString()}</span> innløsbare mynter.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
        <div className="lg:pr-4">
            <h2 className="text-2xl font-bold mb-4 border-b border-slate-700 pb-2">Løs inn mynter</h2>
            <RedeemForm redeemableCoins={redeemableCoins} redeem={redeem} />
        </div>

        <div className="lg:pl-4">
            <h2 className="text-2xl font-bold mb-4 border-b border-slate-700 pb-2">Transaksjonshistorikk</h2>
            <TxHistory transactions={transactions} />
        </div>
      </div>
    </div>
  );
};
