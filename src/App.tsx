import React, { useState } from 'react';
import { RedeemCenter } from './components/RedeemCenter';

type Tab = 'home' | 'redeem';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>('redeem');

  return (
    <div className="bg-slate-900 min-h-screen text-white">
      {/* Main Navigation */}
      <nav className="bg-slate-800 p-4 flex justify-center space-x-4">
        <button
          onClick={() => setActiveTab('home')}
          className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'home' ? 'bg-yellow-500 text-slate-900' : 'text-slate-300'}`}
        >
          🏠 Hjem
        </button>
        <button
          onClick={() => setActiveTab('redeem')}
          className={`px-4 py-2 rounded-lg font-semibold ${activeTab === 'redeem' ? 'bg-yellow-500 text-slate-900' : 'text-slate-300'}`}
        >
          💰 Innløsning
        </button>
      </nav>

      {/* Page Content */}
      <main>
        {activeTab === 'home' && (
          <div className="p-8 text-center">
            <h1 className="text-4xl font-bold">Velkommen til SpareTrend</h1>
            <p className="mt-4 text-slate-400">Dette er hjem-siden. Gå til "Innløsning" for å se funksjonen.</p>
          </div>
        )}
        {activeTab === 'redeem' && <RedeemCenter />}
      </main>
    </div>
  );
};

export default App;
