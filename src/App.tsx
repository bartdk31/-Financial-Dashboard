import React, { useState, useCallback, useEffect } from 'react';
import { DollarSign, TrendingDown, TrendingUp } from 'lucide-react';
import { io } from 'socket.io-client';

// Definer server URL baseret på miljø
const SERVER_URL = process.env.NODE_ENV === 'production' 
  ? 'https://din-app.railway.app'  // Opdater denne URL med din Railway URL
  : 'http://localhost:8080';

interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
}

function App() {
  const [revenue, setRevenue] = useState<Transaction[]>([
    { id: '1', amount: 1500, date: '2024-03-10', description: 'Shopify Sales' },
    { id: '2', amount: 2300, date: '2024-03-11', description: 'Shopify Sales' },
  ]);
  
  const [expenses, setExpenses] = useState<Transaction[]>([
    { id: '1', amount: 500, date: '2024-03-10', description: 'TikTok Ads' },
    { id: '2', amount: 700, date: '2024-03-11', description: 'TikTok Ads' },
  ]);

  useEffect(() => {
    const socket = io(SERVER_URL);

    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
    });

    socket.on('newTransaction', (data) => {
      console.log('Received new transaction:', data);
      const newTransaction: Transaction = {
        id: Date.now().toString(),
        amount: data.amount,
        date: data.date.split('T')[0],
        description: data.description
      };

      if (data.type === 'shopify') {
        setRevenue(prev => [...prev, newTransaction]);
      } else if (data.type === 'tiktok') {
        setExpenses(prev => [...prev, newTransaction]);
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const simulateTransaction = useCallback(async (type: 'shopify' | 'tiktok', amount: number) => {
    try {
      console.log(`Sending ${type} transaction:`, amount);
      
      const response = await fetch(`${SERVER_URL}/webhook/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ amount }),
      });
      
      const data = await response.json();
      console.log('Server response:', data);
    } catch (error) {
      console.error('Error in simulateTransaction:', error);
      alert('Der opstod en fejl ved forbindelse til serveren');
    }
  }, []);

  const totalRevenue = revenue.reduce((sum, item) => sum + item.amount, 0);
  const totalExpenses = expenses.reduce((sum, item) => sum + item.amount, 0);
  const profit = totalRevenue - totalExpenses;

  const handleAddRevenue = () => {
    const amount = Math.floor(Math.random() * 1000) + 500;
    simulateTransaction('shopify', amount);
  };

  const handleAddExpense = () => {
    const amount = Math.floor(Math.random() * 300) + 200;
    simulateTransaction('tiktok', amount);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Finansiel Oversigt</h1>
          <p className="mt-2 text-gray-600">Shopify og TikTok udgifter</p>
        </div>

        {/* Test Buttons */}
        <div className="mb-8 flex gap-4">
          <button
            onClick={handleAddRevenue}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            Tilføj Shopify Indtægt
          </button>
          <button
            onClick={handleAddExpense}
            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            Tilføj TikTok Udgift
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Omsætning</p>
                <p className="text-2xl font-semibold text-green-600">{totalRevenue.toLocaleString('da-DK')} kr</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Udgifter</p>
                <p className="text-2xl font-semibold text-red-600">{totalExpenses.toLocaleString('da-DK')} kr</p>
              </div>
              <div className="bg-red-100 p-3 rounded-full">
                <TrendingDown className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overskud</p>
                <p className="text-2xl font-semibold text-blue-600">{profit.toLocaleString('da-DK')} kr</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <DollarSign className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Transactions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Revenue Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">Shopify Omsætning</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {revenue.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.description}</p>
                      <p className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString('da-DK')}</p>
                    </div>
                    <p className="text-green-600 font-medium">{item.amount.toLocaleString('da-DK')} kr</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Expenses Section */}
          <div className="bg-white rounded-lg shadow">
            <div className="p-6 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-900">TikTok Udgifter</h2>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {expenses.map((item) => (
                  <div key={item.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{item.description}</p>
                      <p className="text-sm text-gray-500">{new Date(item.date).toLocaleDateString('da-DK')}</p>
                    </div>
                    <p className="text-red-600 font-medium">{item.amount.toLocaleString('da-DK')} kr</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;