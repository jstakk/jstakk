import React, { useState, useMemo } from 'react';
import { Transaction, TxType } from '../types/transaction';
import { CsvExportButton } from './CsvExportButton';

// --- Types ---
type FilterType = 'all' | 'deposit' | 'game' | 'redeem';

interface TxHistoryProps {
  transactions: Transaction[];
}

// --- Helper Functions & Components ---
const getTxIcon = (type: TxType) => {
  switch (type) {
    case 'deposit': return '¥';
    case 'gameCost':
    case 'gameWin': return '🎮';
    case 'redeemCash':
    case 'redeemGift': return '🎁';
    default: return '-';
  }
};

const groupTransactionsByMonth = (transactions: Transaction[]) => {
  return transactions.reduce((acc, tx) => {
    const month = new Date(tx.date).toLocaleString('default', { month: 'long', year: 'numeric' });
    if (!acc[month]) {
      acc[month] = [];
    }
    acc[month].push(tx);
    return acc;
  }, {} as Record<string, Transaction[]>);
};


// --- Main Component ---
export const TxHistory: React.FC<TxHistoryProps> = ({ transactions }) => {
  const [filter, setFilter] = useState<FilterType>('all');

  const filteredTransactions = useMemo(() => {
    if (filter === 'all') return transactions;
    return transactions.filter(tx => {
      if (filter === 'deposit') return tx.type === 'deposit';
      if (filter === 'game') return tx.type === 'gameCost' || tx.type === 'gameWin';
      if (filter === 'redeem') return tx.type === 'redeemCash' || tx.type === 'redeemGift';
      return false;
    });
  }, [transactions, filter]);

  const groupedTransactions = useMemo(() => groupTransactionsByMonth(filteredTransactions), [filteredTransactions]);
  const months = Object.keys(groupedTransactions);

  return (
    <div className="bg-slate-800 p-6 rounded-lg shadow-lg space-y-4 flex flex-col h-full">
        {/* Filter Chips */}
        <div className="flex space-x-2">
            {(['all', 'deposit', 'game', 'redeem'] as FilterType[]).map(f => (
                 <button key={f} onClick={() => setFilter(f)} className={`px-3 py-1 text-sm rounded-full ${filter === f ? 'bg-yellow-500 text-slate-900' : 'bg-slate-700 hover:bg-slate-600'}`}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                </button>
            ))}
        </div>

        {/* Transaction List */}
        <div className="space-y-4 flex-grow overflow-y-auto pr-2">
            {months.length > 0 ? months.map(month => (
                <div key={month}>
                    <h3 className="text-lg font-semibold text-slate-400 my-2">{month}</h3>
                    <ul className="space-y-2">
                        {groupedTransactions[month].map(tx => (
                            <li key={tx.id} className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg">
                                <div className="flex items-center">
                                    <span className="text-2xl mr-3">{getTxIcon(tx.type)}</span>
                                    <div>
                                        <p className="font-semibold">{tx.note || tx.type}</p>
                                        <p className="text-xs text-slate-400">{new Date(tx.date).toLocaleDateString()}</p>
                                    </div>
                                </div>
                                <p className={`font-bold text-lg ${tx.amount > 0 ? 'text-green-400' : 'text-red-400'}`}>
                                    {tx.amount > 0 ? '+' : ''}{tx.amount.toLocaleString()}
                                </p>
                            </li>
                        ))}
                    </ul>
                </div>
            )) : <p className="text-slate-400 text-center py-8">Ingen transaksjoner funnet.</p>}
        </div>

         {/* CSV Export Button */}
        <div className="pt-4 mt-auto border-t border-slate-700">
             <CsvExportButton transactions={filteredTransactions} />
        </div>
    </div>
  );
};
