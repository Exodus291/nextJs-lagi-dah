'use client'

import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { LayoutGrid, ChevronsDown, Trash2, Plus, X } from 'lucide-react';

const MenuPage = () => {
  const [menus, setMenus] = useState([]);
  const [filteredMenus, setFilteredMenus] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [loading, setLoading] = useState(true);

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [form, setForm] = useState({
    name: '',
    price: '',
    category: '',
  });
  const [formLoading, setFormLoading] = useState(false);
  const [formError, setFormError] = useState('');
  const [formSuccess, setFormSuccess] = useState('');

  // Fetch menu data
  const fetchMenus = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/menu');
      setMenus(res.data);
      setFilteredMenus(res.data);
      const uniqueCats = ['Semua', ...new Set(res.data.map((m) => m.category || 'Lainnya'))];
      setCategories(uniqueCats);
    } catch (error) {
      console.error('Gagal mengambil data menu:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMenus();
  }, []);

  // Filter menu by category
  const handleFilter = (category) => {
    setSelectedCategory(category);
    if (category === 'Semua') setFilteredMenus(menus);
    else setFilteredMenus(menus.filter((m) => m.category === category));
  };

  // Form input change
  const handleChange = (e) => {
    setFormError('');
    setFormSuccess('');
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  // Submit create menu
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setFormSuccess('');

    if (!form.name || !form.price || !form.category) {
      setFormError('Semua field wajib diisi!');
      return;
    }
    if (isNaN(form.price) || Number(form.price) <= 0) {
      setFormError('Harga harus angka lebih dari 0');
      return;
    }

    setFormLoading(true);
    try {
      await axios.post('/api/menu', {
        name: form.name,
        price: Number(form.price),
        category: form.category,
      });
      setFormSuccess('Menu berhasil dibuat!');
      setForm({ name: '', price: '', category: '' });
      setShowCreateForm(false);
      fetchMenus();
    } catch (err) {
      setFormError('Gagal membuat menu. Coba lagi.');
      console.error(err);
    } finally {
      setFormLoading(false);
    }
  };

  // Delete menu
  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus menu ini?')) return;

    try {
      await axios.delete(`/api/menu/${id}`);
      fetchMenus();
    } catch (error) {
      alert('Gagal menghapus menu.');
      console.error(error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-white pt-24 px-4 pb-12">
      <div className="max-w-6xl mx-auto">

        {/* Header + Toggle Form */}
        <div className="flex flex-col sm:flex-row justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-bold text-pink-600 flex items-center gap-2">
            <LayoutGrid className="w-6 h-6" />
            Daftar Menu
          </h1>

          <button
            onClick={() => setShowCreateForm((v) => !v)}
            className="flex items-center gap-2 bg-pink-500 hover:bg-pink-600 text-white font-semibold py-2 px-4 rounded-lg transition"
          >
            {showCreateForm ? <><X className="w-5 h-5" /> Tutup Form</> : <><Plus className="w-5 h-5" /> Buat Menu Baru</>}
          </button>
        </div>

        {/* Dropdown Kategori */}
        <div className="flex justify-center mb-6">
          <div className="relative w-48">
            <select
              value={selectedCategory}
              onChange={(e) => handleFilter(e.target.value)}
              className="appearance-none bg-white border border-pink-300 text-pink-700 font-medium py-2 px-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent w-full"
            >
              {categories.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
              <ChevronsDown className="w-4 h-4 text-pink-400" />
            </div>
          </div>
        </div>

        {/* Create Menu Form */}
        {showCreateForm && (
          <form onSubmit={handleSubmit} className="max-w-md mx-auto bg-white rounded-3xl p-6 shadow-md mb-8 border border-pink-200">
            <div className="mb-4">
              <label className="block text-pink-700 font-semibold mb-1" htmlFor="name">Nama Menu</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Masukkan nama menu"
                className="w-full border border-pink-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-pink-700 font-semibold mb-1" htmlFor="price">Harga (Rp)</label>
              <input
                type="number"
                id="price"
                name="price"
                value={form.price}
                onChange={handleChange}
                placeholder="Masukkan harga menu"
                className="w-full border border-pink-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
                min="1"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-pink-700 font-semibold mb-1" htmlFor="category">Kategori</label>
              <input
                type="text"
                id="category"
                name="category"
                value={form.category}
                onChange={handleChange}
                placeholder="Misal: Makanan, Minuman"
                className="w-full border border-pink-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-pink-300"
                required
              />
            </div>

            {formError && <p className="text-red-500 mb-2">{formError}</p>}
            {formSuccess && <p className="text-green-600 mb-2">{formSuccess}</p>}

            <button
              type="submit"
              disabled={formLoading}
              className="w-full py-3 bg-pink-500 hover:bg-pink-600 text-white font-semibold rounded-lg transition-colors disabled:opacity-70"
            >
              {formLoading ? 'Menyimpan...' : 'Buat Menu'}
            </button>
          </form>
        )}

        {/* Menu List */}
        {loading ? (
          <p className="text-center text-pink-400">Memuat menu...</p>
        ) : filteredMenus.length === 0 ? (
          <p className="text-center text-pink-500">Tidak ada menu dalam kategori ini.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {filteredMenus.map((menu) => (
              <div
                key={menu.id}
                className="bg-white rounded-2xl shadow-md hover:shadow-xl border border-pink-100 p-4 flex flex-col justify-between transition-all duration-200"
              >
                <div>
                  <h2 className="text-lg font-bold text-pink-700">{menu.name}</h2>
                  <p className="text-sm text-pink-500 mt-1 mb-3">Rp {menu.price.toLocaleString()}</p>
                  <p className="text-xs text-pink-400 italic">Kategori: {menu.category || '-'}</p>
                </div>
                <button
                  onClick={() => handleDelete(menu.id)}
                  className="mt-4 self-start flex items-center gap-2 text-red-600 hover:text-red-800 font-semibold transition"
                >
                  <Trash2 className="w-4 h-4" />
                  Hapus
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MenuPage;
