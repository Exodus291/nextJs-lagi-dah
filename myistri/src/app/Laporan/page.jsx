'use client'

import React, { useState, useMemo, useEffect } from 'react';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Users, ShoppingCart, Calendar, Download, Filter, DollarSign, Heart, ArrowUp, ArrowDown } from 'lucide-react';
import formatRupiah from '../../utils/rupiah';

// Sample data untuk berbagai periode
const generateData = (days) => {
  const data = [];
  const baseRevenue = 50000;
  const baseCustomers = 100;
  const baseTransactions = 80;
  
  for (let i = 0; i < days; i++) {
    const date = new Date();
    date.setDate(date.getDate() - (days - 1 - i));
    
    const dayOfWeek = date.getDay();
    const weekendMultiplier = dayOfWeek === 0 || dayOfWeek === 6 ? 1.3 : 1;
    const randomFactor = 0.7 + Math.random() * 0.6;
    
    data.push({
      date: date.toLocaleDateString('id-ID', { 
        day: '2-digit', 
        month: 'short',
        year: days > 31 ? '2-digit' : undefined 
      }),
      fullDate: date.toISOString().split('T')[0],
      pendapatan: Math.round(baseRevenue * weekendMultiplier * randomFactor),
      pelanggan: Math.round(baseCustomers * weekendMultiplier * randomFactor),
      transaksi: Math.round(baseTransactions * weekendMultiplier * randomFactor),
    });
  }
  return data;
};

const periods = {
  '7': { label: 'Minggu Ini', days: 7 },
  '30': { label: 'Bulan Ini', days: 30 },
  '90': { label: '3 Bulan', days: 90 }
};

// Data kategori penjualan
const categoryData = [
  { name: 'Makanan', value: 45, color: '#ec4899' },
  { name: 'Minuman', value: 30, color: '#f43f5e' },
  { name: 'Lainnya', value: 10, color: '#a855f7' }
];

export default function LaporanPOSPage() {
  const [isClient, setIsClient] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('30');
  const [activeChart, setActiveChart] = useState('pendapatan');
  
  useEffect(() => {
    setIsClient(true);
  }, []);
  
  const data = useMemo(() => {
    if (!isClient) return []; // Return empty array during SSR or before client mount
    return generateData(periods[selectedPeriod].days);
  }, [selectedPeriod, isClient]);
  
  // Calculate totals and averages
  const totals = useMemo(() => {
    const totalPendapatan = data.reduce((sum, item) => sum + item.pendapatan, 0);
    const totalPelanggan = data.reduce((sum, item) => sum + item.pelanggan, 0);
    const totalTransaksi = data.reduce((sum, item) => sum + item.transaksi, 0);
    
    if (!isClient || data.length === 0) {
      return {
        totalPendapatan: 0,
        totalPelanggan: 0,
        totalTransaksi: 0,
        avgTransaksi: 0,
      };
    }
    return {
      totalPendapatan,
      totalPelanggan,
      totalTransaksi,
      avgTransaksi: totalTransaksi > 0 ? totalPendapatan / totalTransaksi : 0,
    };
  }, [data, isClient]);


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
                Laporan Elaina
              </h1>
              <p className="text-gray-600">Dashboard analytics untuk performa bisnis Anda</p>
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

        {!isClient && (
          <div className="text-center py-10">
            <p className="text-xl text-pink-600 animate-pulse">Memuat data laporan...</p>
          </div>
        )}

        {isClient && (
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              <StatCard
                title="Total Pendapatan"
                value={formatRupiah(totals.totalPendapatan)}
                icon={DollarSign}
                trend="up"
                trendValue="12.5"
                color="pink"
              />
              <StatCard
                title="Total Pelanggan"
                value={totals.totalPelanggan.toLocaleString('id-ID')}
                icon={Users}
                trend="up"
                trendValue="8.3"
                color="purple"
              />
              <StatCard
                title="Rata-rata Transaksi"
                value={formatRupiah(totals.avgTransaksi)}
                icon={TrendingUp}
                trend="up"
                trendValue="5.7"
                color="blue"
              />
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              
              {/* Main Chart */}
              <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-pink-100/50 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-800">Tren Performa</h3>
                  <div className="flex items-center space-x-2">
                    {[
                      { key: 'pendapatan', label: 'Pendapatan', color: '#ec4899' },
                      { key: 'pelanggan', label: 'Pelanggan', color: '#f43f5e' },
                    ].map((chart) => (
                      <button
                        key={chart.key}
                        onClick={() => setActiveChart(chart.key)}
                        className={`px-3 py-1 rounded-lg text-sm font-medium transition-all duration-300 ${
                          activeChart === chart.key
                            ? 'bg-pink-100 text-pink-700 shadow-md'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {chart.label}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={data}>
                      <defs>
                        <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#ec4899" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#ec4899" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#64748b" 
                        fontSize={12}
                        tickLine={false}
                      />
                      <YAxis 
                        stroke="#64748b" 
                        fontSize={12}
                        tickLine={false}
                        tickFormatter={(value) => 
                          activeChart === 'pendapatan' 
                            ? `${(value / 1000)}K` 
                            : value.toString()
                        }
                      />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #fecaca',
                          borderRadius: '12px',
                          boxShadow: '0 10px 25px rgba(0,0,0,0.1)'
                        }}
                        formatter={(value) => [
                          activeChart === 'pendapatan' 
                            ? formatRupiah(value)
                            : value.toLocaleString('id-ID'),
                          activeChart.charAt(0).toUpperCase() + activeChart.slice(1)
                        ]}
                      />
                      <Area
                        type="monotone"
                        dataKey={activeChart}
                        stroke="#ec4899"
                        strokeWidth={3}
                        fillOpacity={1}
                        fill="url(#colorGradient)"
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Category Distribution */}
              <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-pink-100/50 p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-6">Kategori Penjualan</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData} // categoryData is static, so it's fine
                        cx="50%"
                        cy="50%"
                        innerRadius={40}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {categoryData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip 
                        formatter={(value) => [`${value}%`, 'Persentase']}
                        contentStyle={{ 
                          backgroundColor: 'rgba(255, 255, 255, 0.95)',
                          border: '1px solid #fecaca',
                          borderRadius: '12px'
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="space-y-2 mt-4">
                  {categoryData.map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: item.color }}
                        ></div>
                        <span className="text-sm text-gray-600">{item.name}</span>
                      </div>
                      <span className="text-sm font-medium text-gray-800">{item.value}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Recent Transactions Table */}
            <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-xl border border-pink-100/50 p-6">
              <h3 className="text-xl font-bold text-gray-800 mb-6">Performa Harian Detail</h3>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-pink-100">
                      <th className="text-left py-3 px-4 font-semibold text-gray-700">Tanggal</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Pendapatan</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Pelanggan</th>
                      <th className="text-right py-3 px-4 font-semibold text-gray-700">Avg/Transaksi</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.slice(-7).reverse().map((item, index) => (
                      <tr key={index} className="border-b border-pink-50 hover:bg-pink-50/50 transition-colors">
                        <td className="py-3 px-4 text-gray-800">{item.date}</td>
                        <td className="py-3 px-4 text-right font-medium text-gray-800">
                          {formatRupiah(item.pendapatan)}
                        </td>
                        <td className="py-3 px-4 text-right text-gray-600">
                          {item.pelanggan.toLocaleString('id-ID')}
                        </td>
                        <td className="py-3 px-4 text-right font-medium text-pink-600">
                          {formatRupiah(item.pendapatan / item.transaksi)}
                        </td>
                      </tr>
                    ))}
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
