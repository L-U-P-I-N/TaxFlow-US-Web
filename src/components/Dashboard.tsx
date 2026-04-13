import React, { useEffect, useState } from 'react';
import { 
  DollarSign, 
  Receipt, 
  TrendingDown, 
  AlertTriangle, 
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import { formatCurrency, cn } from '../lib/utils';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { db, auth } from '../firebase/config';
import { collection, query, onSnapshot, where, orderBy } from 'firebase/firestore';
import { useAppSelector } from '../hooks/redux';

interface Transaction {
  id: string;
  amount: number;
  description: string;
  state_code: string;
  transaction_date: any;
  tax_amount: number;
}

interface NexusState {
  state_code: string;
  state_name: string;
  total_sales: number;
  threshold_amount: number;
  status: string;
}

const Dashboard: React.FC = () => {
  const { user } = useAppSelector(state => state.auth);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [nexusStates, setNexusStates] = useState<NexusState[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!user) return;

    const transactionsQuery = query(
      collection(db, `organizations/${user.uid}/transactions`),
      orderBy('transaction_date', 'desc')
    );

    const nexusQuery = query(
      collection(db, `organizations/${user.uid}/nexus`)
    );

    const unsubscribeTransactions = onSnapshot(transactionsQuery, 
      (snapshot) => {
        const txData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as Transaction));
        setTransactions(txData);
      },
      (err) => {
        console.error('Error fetching transactions:', err);
        setError('Failed to load transactions');
      }
    );

    const unsubscribeNexus = onSnapshot(nexusQuery,
      (snapshot) => {
        const nexusData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        } as NexusState));
        setNexusStates(nexusData);
        setLoading(false);
      },
      (err) => {
        console.error('Error fetching nexus states:', err);
        setError('Failed to load nexus data');
        setLoading(false);
      }
    );

    return () => {
      unsubscribeTransactions();
      unsubscribeNexus();
    };
  }, [user]);

  const handleSimulateShopify = async () => {
    if (!user) return;

    try {
      const response = await fetch('/api/simulate-shopify-sync', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ userId: user.uid }),
      });

      const data = await response.json();
      if (data.success) {
        alert('Shopify data simulated successfully!');
      } else {
        alert('Failed to simulate Shopify data');
      }
    } catch (error) {
      console.error('Simulation error:', error);
      alert('Error simulating Shopify data');
    }
  };

  const totalSales = transactions.reduce((sum, tx) => sum + tx.amount, 0);
  const totalTax = transactions.reduce((sum, tx) => sum + tx.tax_amount, 0);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {user?.displayName || 'User'}</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Sales</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalSales)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Tax</p>
                <p className="text-2xl font-bold text-gray-900">
                  {formatCurrency(totalTax)}
                </p>
              </div>
              <Receipt className="h-8 w-8 text-blue-600" />
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Transactions</p>
                <p className="text-2xl font-bold text-gray-900">
                  {transactions.length}
                </p>
              </div>
              <TrendingDown className="h-8 w-8 text-orange-600" />
            </div>
          </div>
        </div>

        {/* Nexus Status */}
        <div className="bg-white p-6 rounded-lg shadow-sm border mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-gray-900">Nexus Status</h2>
            <button
              onClick={handleSimulateShopify}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
            >
              Simulate Shopify Data
            </button>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nexusStates.map((state) => (
              <div
                key={state.id}
                className={cn(
                  "p-4 rounded-lg border",
                  state.status === 'EXCEEDED' ? 'border-red-200 bg-red-50' :
                  state.status === 'WARNING' ? 'border-yellow-200 bg-yellow-50' :
                  'border-green-200 bg-green-50'
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-medium text-gray-900">{state.state_name}</h3>
                  {state.status === 'EXCEEDED' && (
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  )}
                </div>
                <div className="text-sm text-gray-600">
                  <p>Sales: {formatCurrency(state.total_sales)}</p>
                  <p>Threshold: {formatCurrency(state.threshold_amount)}</p>
                  <p className="font-medium">Status: {state.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="bg-white p-6 rounded-lg shadow-sm border">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Recent Transactions</h2>
          
          {transactions.length > 0 ? (
            <div className="space-y-3">
              {transactions.slice(0, 10).map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-3 border-b">
                  <div>
                    <p className="font-medium text-gray-900">{tx.description}</p>
                    <p className="text-sm text-gray-600">{tx.state_code}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(tx.amount)}</p>
                    <p className="text-sm text-gray-600">Tax: {formatCurrency(tx.tax_amount)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              No transactions yet. Click "Simulate Shopify Data" to add sample data.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
