'use client'

import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, ShoppingCart, Calendar, Download, Filter, DollarSign, Heart, ArrowUp, ArrowDown } from 'lucide-react';
import formatRupiah from '../../utils/rupiah';
import api from '@/lib/api';

const periods = {
  '1': { label: 'Hari Ini', days: 1 },
  '7': { label: 'Minggu Ini', days: 7 },
  '30': { label: 'Bulan Ini', days: 30 },
  '90': { label: '3 Bulan', days: 90 }
};

export default function LaporanPOSPage() {
  const [isClient, setIsClient] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('1'); // Default ke 'Hari Ini'
  const [activeChart, setActiveChart] = useState('pendapatan');
  const [data, setData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!isClient) return;
    setLoading(true);
    setError(null);
    api(`/reports/sales?days=${periods[selectedPeriod].days}`)
      .then(json => {
        console.log('API Response:', json);
        setData(json.data); // Ambil hanya bagian data dari response
        setLoading(false);
      })
      .catch(err => {
        setError(err.message || 'Gagal mengambil data laporan');
        setLoading(false);
      });
  }, [selectedPeriod, isClient]);

  // Mapping data API ke variabel yang digunakan di komponen
  const safeData = (data && typeof data === 'object') ? data : {};
  const totalPendapatan = safeData.totalSales || 0;
  const totalPelanggan = safeData.totalTransactions || 0;
  const totalTransaksi = safeData.totalTransactions || 0;
  const totalBarangTerjual = safeData.totalItemsSold || 0;
  const avgTransaksi = totalTransaksi > 0 ? totalPendapatan / totalTransaksi : 0;
  const trenData = safeData.menuSalesSummary ? Object.entries(safeData.menuSalesSummary).map(([key, value]) => ({
    name: key,
    ...value
  })) : [];
  const storeName = safeData.storeName || '';
  const reportDate = safeData.reportDate || '';

  // Calculate totals and averages
  const totals = useMemo(() => ({
    totalPendapatan,
    totalPelanggan,
    totalTransaksi,
    avgTransaksi,
    totalBarangTerjual
  }), [data, isClient]);

  // Ambil data kategori dari API, dan beri warna default jika tidak ada
  const categoryColors = [
    '#ec4899', // pink
    '#f43f5e', // rose
    '#a855f7', // purple
    '#f59e42', // orange
    '#38bdf8', // blue
    '#22d3ee', // cyan
    '#10b981', // green
    '#fbbf24', // yellow
    '#6366f1', // indigo
    '#eab308', // gold
  ];
  const categoryData = useMemo(() => {
    if (!data.categorySalesSummary) return [];
    // Jika API mengembalikan array, gunakan langsung, jika object, ubah ke array
    let arr = Array.isArray(data.categorySalesSummary)
      ? data.categorySalesSummary
      : Object.entries(data.categorySalesSummary).map(([name, value], idx) => ({
          name,
          value: value.percent || value.value || value, // gunakan percent/value
        }));
    // Tambahkan warna
    return arr.map((item, idx) => ({
      ...item,
      color: item.color || categoryColors[idx % categoryColors.length],
      value: Number(item.value) || 0,
    }));
  }, [data]);

  const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = "pink" }) => {
    const colorClasses = {
      pink: "from-pink-500 to-rose-500",
      purple: "from-purple-500 to-pink-500",
      orange: "from-orange-500 to-pink-500",
      blue: "from-blue-500 to-purple-500"
    };

    return (
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-pink-100/50 p-6 hover:shadow-2xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between mb-4">
          <div className={`w-12 h-12 bg-gradient-to-r ${colorClasses[color]} rounded-xl flex items-center justify-center shadow-lg`}>
            <Icon className="w-6 h-6 text-white" />
          </div>
          {trend && (
            <div className={`flex items-center space-x-1 ${trend === 'up' ? 'text-green-600' : 'text-red-500'}`}>
              {trend === 'up' ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />}
              <span className="text-sm font-medium">{trendValue}%</span>
            </div>
          )}
        </div>
        <h3 className="text-gray-600 text-sm font-medium mb-1">{title}</h3>
        <p className="text-2xl font-bold text-gray-800">{value}</p>
      </div>
    );
  };

  // Untuk chart harian, gunakan data array harian jika ada, fallback ke data hari ini
  let dailyData = Array.isArray(safeData.dailySummary) && safeData.dailySummary.length > 0
    ? safeData.dailySummary.map(item => ({
        ...item,
        date: item.date || item.transactionDate || '', // pastikan ada key 'date'
        totalSales: item.totalSales ?? 0,
        totalTransactions: item.totalTransactions ?? 0,
      }))
    : [{
        date: reportDate,
        totalSales: safeData.totalSales || 0,
        totalTransactions: safeData.totalTransactions || 0,
      }];

  // Jika periode adalah hari ini, gunakan data per jam jika tersedia
  let chartData = dailyData;
  if (
    selectedPeriod === '1' &&
    Array.isArray(safeData.hourlySummary) &&
    safeData.hourlySummary.length > 0
  ) {
    chartData = safeData.hourlySummary.map(item => ({
      ...item,
      date: item.transactionTime
        ? new Date(item.transactionTime).getHours().toString().padStart(2, '0')
        : (item.hour || ''),
      totalSales: item.totalSales ?? 0,
      totalTransactions: item.totalTransactions ?? 0,
    }));
  }

  // Mapping chart key ke data tren
  const chartKeyMap = {
    pendapatan: 'totalSales',
    pelanggan: 'totalTransactions'
  };
  const chartDataKey = chartKeyMap[activeChart];

  // Hitung total QRIS dan Tunai dari data transaksi
  const totalQris = Array.isArray(safeData.transactions)
    ? safeData.transactions
        .filter(trx => (trx.paymentMethod || '').toLowerCase().includes('qris'))
        .reduce((sum, trx) => sum + Number(trx.totalAmount || 0), 0)
    : 0;

  const totalTunai = Array.isArray(safeData.transactions)
    ? safeData.transactions
        .filter(trx => (trx.paymentMethod || '').toLowerCase().includes('cash') || (trx.paymentMethod || '').toLowerCase().includes('tunai'))
        .reduce((sum, trx) => sum + Number(trx.totalAmount || 0), 0)
    : 0;

  // Build menu sales summary from transactions' items
  const menuSalesSummary = {};
  if (Array.isArray(safeData.transactions)) {
    safeData.transactions.forEach(trx => {
      if (Array.isArray(trx.items)) {
        trx.items.forEach(item => {
          const key = `${item.menu} (${item.category})`;
          if (!menuSalesSummary[key]) {
            menuSalesSummary[key] = {
              menu: item.menu,
              category: item.category,
              qty: 0,
              priceAtTransaction: Number(item.priceAtTransaction || 0),
              total: 0,
            };
          }
          menuSalesSummary[key].qty += Number(item.quantity || 0);
          menuSalesSummary[key].total += Number(item.priceAtTransaction || 0) * Number(item.quantity || 0);
        });
      }
    });
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-white p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center shadow-lg">
              <Heart className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-800 to-pink-600 bg-clip-text text-transparent">
                Laporan {storeName ? storeName : 'Elaina'}
              </h1>
              <p className="text-gray-600">Dashboard analytics untuk performa bisnis Anda</p>
              {reportDate && <p className="text-xs text-gray-400">Tanggal Laporan: {reportDate}</p>}
            </div>
          </div>
          
          {/* Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center space-x-3">
              <Calendar className="w-5 h-5 text-gray-500" />
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                className="px-3 py-2 bg-white/80 backdrop-blur-sm border border-pink-200 rounded-xl text-gray-700 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
              >
                {Object.entries(periods).map(([key, period]) => (
                  <option key={key} value={key}>{period.label}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center space-x-2">
              <button className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl">
                <Download className="w-4 h-4" />
                <span>Export</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm border border-pink-200 hover:bg-pink-50 text-gray-700 rounded-xl transition-all duration-300">
                <Filter className="w-4 h-4" />
                <span>Filter</span>
              </button>
            </div>
          </div>
        </div>

        {(!isClient || loading) && (
          <div className="text-center py-10">
            <p className="text-xl text-pink-600 animate-pulse">Memuat data laporan...</p>
          </div>
        )}
        {error && (
          <div className="text-center py-10">
            <p className="text-xl text-red-600">{error}</p>
          </div>
        )}
        {isClient && !loading && !error && (
          <>
            {/* Card List Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <StatCard
                title="Total Pendapatan"
                value={formatRupiah(totalPendapatan)}
                icon={DollarSign}
                color="pink"
              />
              <StatCard
                title="Total Pelanggan"
                value={totalPelanggan.toLocaleString('id-ID')}
                icon={Users}
                color="blue"
              />
              <StatCard
                title="Total QRIS"
                value={formatRupiah(totalQris)}
                icon={TrendingUp}
                color="purple"
              />
              <StatCard
                title="Total Tunai"
                value={formatRupiah(totalTunai)}
                icon={ShoppingCart}
                color="orange"
              />
            </div>
            {/* Recent Transactions Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-pink-100/50 p-6 mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Transaksi Terbaru</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-pink-100">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Nama Pelanggan</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Metode Pembayaran</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Array.isArray(safeData.transactions) && safeData.transactions.length > 0 ? (
                      safeData.transactions.map((trx, idx) => (
                        <tr key={trx.id || idx} className="border-b border-pink-50 hover:bg-pink-50/50 transition-colors">
                          <td className="py-3 px-4 text-gray-800">{trx.customerName || '-'}</td>
                          <td className="py-3 px-4 text-gray-600">
                            {trx.transactionDate ? new Date(trx.transactionDate).toLocaleString('id-ID') : '-'}
                          </td>
                          <td className="py-3 px-4 text-gray-600">{trx.paymentMethod || '-'}</td>
                          <td className="py-3 px-4 text-right font-medium text-gray-800">
                            {formatRupiah(Number(trx.totalAmount) || 0)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} className="py-3 px-4 text-center text-gray-500">Tidak ada transaksi</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Menu Sales Summary */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-pink-100/50 p-6 mt-8">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Ringkasan Penjualan Menu</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-pink-100">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Menu</th>
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Kategori</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Jumlah Terjual</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {Object.keys(menuSalesSummary).length > 0
                      ? Object.entries(menuSalesSummary).map(([menuKey, detail]) => (
                          <tr key={menuKey} className="border-b border-pink-50 hover:bg-pink-50/50 transition-colors">
                            <td className="py-3 px-4 text-gray-800">{detail.menu}</td>
                            <td className="py-3 px-4 text-gray-600">{detail.category}</td>
                            <td className="py-3 px-4 text-right text-gray-600">{detail.qty}</td>
                            <td className="py-3 px-4 text-right font-medium text-gray-800">
                              {formatRupiah(detail.total)}
                            </td>
                          </tr>
                        ))
                      : (
                        <tr>
                          <td colSpan={4} className="py-3 px-4 text-center text-gray-500">Tidak ada data menu</td>
                        </tr>
                      )}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
