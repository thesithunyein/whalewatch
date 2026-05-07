"use client";

import { useState, useEffect } from "react";
import { Activity, TrendingUp, AlertTriangle, Wallet } from "lucide-react";

export default function Home() {
  const [whales, setWhales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchWhaleTransactions();
    const interval = setInterval(fetchWhaleTransactions, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchWhaleTransactions = async () => {
    try {
      const response = await fetch("/api/whales");
      const data = await response.json();
      setWhales(data.transactions || []);
      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch whale transactions:", error);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900">
      {/* Header */}
      <header className="border-b border-gray-800 bg-black/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-8 h-8 text-blue-500" />
            <h1 className="text-2xl font-bold text-white">WhaleWatch</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">Real-time Solana Whale Tracking</span>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-sm text-green-500">Live</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <span className="text-gray-400 text-sm">24h Transactions</span>
            </div>
            <p className="text-3xl font-bold text-white">1,247</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-green-500" />
              <span className="text-gray-400 text-sm">Total Volume</span>
            </div>
            <p className="text-3xl font-bold text-white">$42.8M</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <Wallet className="w-5 h-5 text-purple-500" />
              <span className="text-gray-400 text-sm">Active Whales</span>
            </div>
            <p className="text-3xl font-bold text-white">384</p>
          </div>
          <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-500" />
              <span className="text-gray-400 text-sm">Price Alerts</span>
            </div>
            <p className="text-3xl font-bold text-white">23</p>
          </div>
        </div>

        {/* Live Whale Feed */}
        <div className="bg-gray-800/50 backdrop-blur border border-gray-700 rounded-xl overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              Live Whale Feed
            </h2>
            <p className="text-gray-400 text-sm mt-1">Real-time large transactions on Solana</p>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              <p className="text-gray-400 mt-4">Loading whale transactions...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-900/50">
                  <tr>
                    <th className="text-left p-4 text-gray-400 font-medium text-sm">Time</th>
                    <th className="text-left p-4 text-gray-400 font-medium text-sm">Token</th>
                    <th className="text-left p-4 text-gray-400 font-medium text-sm">Amount</th>
                    <th className="text-left p-4 text-gray-400 font-medium text-sm">Value (USD)</th>
                    <th className="text-left p-4 text-gray-400 font-medium text-sm">From</th>
                    <th className="text-left p-4 text-gray-400 font-medium text-sm">To</th>
                    <th className="text-left p-4 text-gray-400 font-medium text-sm">Price Impact</th>
                  </tr>
                </thead>
                <tbody>
                  {whales.map((whale, index) => (
                    <tr key={index} className="border-t border-gray-700 hover:bg-gray-700/30 transition-colors">
                      <td className="p-4 text-gray-300 text-sm">{new Date(whale.blockTime * 1000).toLocaleTimeString()}</td>
                      <td className="p-4 text-white font-medium">{whale.tokenSymbol || 'SOL'}</td>
                      <td className="p-4 text-gray-300">{whale.amount?.toLocaleString() || '0'}</td>
                      <td className="p-4 text-green-400 font-medium">${whale.valueUsd?.toLocaleString() || '0'}</td>
                      <td className="p-4 text-gray-400 text-sm font-mono">{whale.from?.slice(0, 8)}...</td>
                      <td className="p-4 text-gray-400 text-sm font-mono">{whale.to?.slice(0, 8)}...</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded text-xs font-medium ${
                          whale.priceImpact > 2 ? 'bg-red-500/20 text-red-400' :
                          whale.priceImpact > 1 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-green-500/20 text-green-400'
                        }`}>
                          {whale.priceImpact?.toFixed(2) || '0.00'}%
                        </span>
                      </td>
                    </tr>
                  ))}
                  {whales.length === 0 && (
                    <tr>
                      <td colSpan={7} className="p-12 text-center text-gray-400">
                        No whale transactions found. Check API configuration.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Call to Action */}
        <div className="mt-8 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-xl p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-2">Never Miss a Whale Move</h3>
          <p className="text-gray-400 mb-4">Get real-time alerts when whales make large transactions. Set custom thresholds and receive notifications via Telegram.</p>
          <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors">
            Set Up Alerts
          </button>
        </div>
      </div>
    </main>
  );
}
