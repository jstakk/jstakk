import { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { Transaction, TxType } from '../types/transaction';

// --- Mock Data ---
const MOCK_INITIAL_COINS = 5000;
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: uuidv4(),
    date: new Date(Date.now() - 2 * 86400000).toISOString(),
    type: 'deposit',
    amount: 1000,
    note: 'Innskudd med Visa',
  },
  {
    id: uuidv4(),
    date: new Date(Date.now() - 1 * 86400000).toISOString(),
    type: 'gameCost',
    amount: -50,
    note: 'Spill: Lucky Spin',
  },
    {
    id: uuidv4(),
    date: new Date().toISOString(),
    type: 'gameWin',
    amount: 250,
    note: 'Lucky Spin gevinst',
  },
];

// --- Hook Definition ---
export const useRedeem = () => {
  const [redeemableCoins, setRedeemableCoins] = useState<number>(() => {
    const savedCoins = localStorage.getItem('redeemableCoins');
    return savedCoins ? JSON.parse(savedCoins) : MOCK_INITIAL_COINS;
  });

  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const savedTransactions = localStorage.getItem('transactions');
    return savedTransactions ? JSON.parse(savedTransactions) : MOCK_TRANSACTIONS;
  });

  // Persist state to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('redeemableCoins', JSON.stringify(redeemableCoins));
  }, [redeemableCoins]);

  useEffect(() => {
    localStorage.setItem('transactions', JSON.stringify(transactions));
  }, [transactions]);

  // --- Core Functions ---
  const addTransaction = (type: TxType, amount: number, note?: string) => {
    const newTransaction: Transaction = {
      id: `RD-${new Date().toISOString().replace(/[-:.]/g, '')}`, // Per spec
      date: new Date().toISOString(),
      type,
      amount,
      note,
    };
    setTransactions(prev => [newTransaction, ...prev]);
  };

  const redeem = (amount: number, pin: string, type: 'redeemCash' | 'redeemGift', giftCardProvider?: string): { success: boolean; message: string } => {
    // 1. Validate PIN
    if (pin !== '1234') {
      return { success: false, message: 'Feil PIN-kode.' };
    }

    // 2. Validate Amount
    if (amount <= 0) {
        return { success: false, message: 'Beløpet må være positivt.' };
    }
    if (amount > redeemableCoins) {
      return { success: false, message: 'Ikke nok mynter.' };
    }
     if (amount < 50) {
      return { success: false, message: 'Minimumsbeløp er 50 mynter.' };
    }


    // 3. Update Balance
    setRedeemableCoins(prev => prev - amount);

    // 4. Add Transaction
    const note = type === 'redeemGift' ? `${giftCardProvider}-kort` : 'Overført til bankkonto';
    addTransaction(type, -amount, note);

    return { success: true, message: 'Innløsning vellykket!' };
  };

  return {
    redeemableCoins,
    transactions,
    redeem,
  };
};
