'use client'

import { useState } from 'react';
import api from '../../lib/api'; // Pastikan path ini benar
import { PlusCircle, AlertCircle, CheckCircle } from 'lucide-react';

export default function AddCategoryForm({ onCategoryAdded }) {
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!categoryName.trim()) {
      setError('Nama kategori tidak boleh kosong.');
      return;
    }

    setLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await api.post('/categories', { name: categoryName });
      setSuccessMessage(`Kategori "${response.data.name}" berhasil ditambahkan.`);
      setCategoryName(''); // Kosongkan input setelah berhasil
      if (onCategoryAdded) {
        onCategoryAdded(response.data); // Callback jika ingin melakukan sesuatu setelah kategori ditambahkan
      }
    } catch (err) {
      const apiError = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Gagal menambahkan kategori. Coba lagi.';
      setError(apiError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white/70 backdrop-blur-xl rounded-xl shadow-lg border border-pink-200/50 p-6 my-6 max-w-md mx-auto">
      <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center">
        <PlusCircle className="w-7 h-7 mr-2 text-pink-500" />
        Tambah Kategori Baru
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg flex items-center space-x-2 text-red-700 text-sm">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 border border-green-300 rounded-lg flex items-center space-x-2 text-green-700 text-sm">
          <CheckCircle className="w-5 h-5 flex-shrink-0" />
          <span>{successMessage}</span>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="space-y-4">
          <div>
            <label htmlFor="categoryName" className="block text-sm font-medium text-gray-700 mb-1">
              Nama Kategori
            </label>
            <input
              type="text"
              name="categoryName"
              id="categoryName"
              value={categoryName}
              onChange={(e) => {
                setCategoryName(e.target.value);
                if (error) setError('');
                if (successMessage) setSuccessMessage('');
              }}
              placeholder="Contoh: Minuman Dingin"
              className="w-full px-4 py-2.5 bg-white/80 backdrop-blur-sm border border-pink-200 rounded-lg text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-2.5 rounded-lg transition-all duration-300 shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
          >
            {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <span>Tambah Kategori</span>}
          </button>
        </div>
      </form>
    </div>
  );
}
