'use client';

import React, { useEffect, useState } from 'react';
import { ClipboardList } from 'lucide-react';
import api from '../../lib/api';
import formatRupiah from '@/utils/rupiah';
import formatDate from '@/utils/formatDate';

const TransactionsPage = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTransactions = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get('/transactions');
        const transactionsData = response.data?.transactions || response.data || [];
        setTransactions(Array.isArray(transactionsData) ? transactionsData : []);
      } catch (err) {
        setError(err.response?.data?.message || 'Gagal memuat data transaksi.');
        setTransactions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, []);

  const getStatusStyle = (status) => {
    switch (status?.toUpperCase()) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'FAILED':
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-100 via-indigo-50 to-purple-100 pt-24 px-4 pb-12">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center gap-3 text-indigo-700">
          <ClipboardList className="w-8 h-8" />
          <h1 className="text-3xl font-bold">Daftar Transaksi</h1>
        </div>

        {loading && (
          <p className="text-center text-indigo-500 text-lg py-10">Memuat data transaksi...</p>
        )}

        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 text-red-700 p-4 rounded-md shadow" role="alert">
            <p className="font-bold">Terjadi Kesalahan</p>
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && transactions.length === 0 && (
          <p className="text-center text-gray-600 text-lg py-10">Belum ada transaksi yang tercatat.</p>
        )}

        {!loading && !error && transactions.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
            {transactions.map((tx) => {
              // console.log('TX:', tx);
              const customerName = tx.customerName || 'Tidak ada';
              const customerNote = tx.customerNote || 'Tidak ada';

              return (
                <div
                  key={tx.id}
                  className="bg-white/90 backdrop-blur-md rounded-xl shadow-md p-5 border border-gray-200"
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-lg font-semibold text-indigo-700">
                        {customerName}
                      </h2>
                      <p className="text-sm text-gray-500">ID: {tx.id.substring(0, 8)}...</p>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusStyle(tx.status)}`}
                    >
                      {tx.status}
                    </span>
                  </div>

                  <div className="mt-4 space-y-1 text-sm text-gray-700">
                    <p><span className="font-medium">Total:</span> {formatRupiah(tx.totalAmount)}</p>
                    <p><span className="font-medium">Metode Pembayaran:</span> {tx.paymentMethod || 'Belum Dipilih'}</p>
                    <p><span className="font-medium">Tanggal:</span> {formatDate(tx.createdAt)}</p>
                    <p><span className="font-medium">Catatan:</span> {customerNote}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default TransactionsPage;
