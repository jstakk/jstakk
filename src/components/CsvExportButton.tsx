import React from 'react';
import { unparse } from 'papaparse';
import { Transaction } from '../types/transaction';

interface CsvExportButtonProps {
  transactions: Transaction[];
  className?: string;
}

export const CsvExportButton: React.FC<CsvExportButtonProps> = ({ transactions, className }) => {

  const handleExport = () => {
    if (transactions.length === 0) {
      alert('Ingen transaksjoner å eksportere.');
      return;
    }

    // Convert JSON to CSV
    const csvData = unparse(transactions, {
        header: true,
        columns: ['date', 'type', 'amount', 'note', 'id']
    });

    // Create a Blob from the CSV data
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });

    // Create a link and trigger the download
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    const date = new Date();
    const fileName = `transactions-${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}.csv`;
    link.setAttribute('download', fileName);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button
      onClick={handleExport}
      className={`w-full border-2 border-slate-600 rounded-lg p-3 text-center font-bold text-slate-300 hover:bg-yellow-500/20 hover:border-yellow-500/80 transition-colors flex items-center justify-center space-x-2 ${className}`}
    >
        <span>↓</span>
        <span>Eksporter til CSV</span>
    </button>
  );
};
