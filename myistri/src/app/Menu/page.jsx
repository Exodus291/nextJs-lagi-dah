'use client';

import React, { useEffect, useState } from 'react';
import { LayoutGrid, Plus, X, FolderPlus, ChevronsDown, Trash2 } from 'lucide-react';
import api from '../../../lib/api'; // Pastikan path ini benar
import AddCategoryForm from '../components/AddCategory'; // Impor komponen

const MenuPage = () => {
  const [menus, setMenus] = useState([])
  const [filteredMenus, setFilteredMenus] = useState([])
  
  const [actualCategories, setActualCategories] = useState([]); // Untuk menyimpan {id, name}
  const [categoryFilterOptions, setCategoryFilterOptions] = useState(['Semua']);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState('Semua')
  const [loading, setLoading] = useState(true)

  const [showCreateMenuForm, setShowCreateMenuForm] = useState(false)
  const [createMenuForm, setCreateMenuForm] = useState({ name: '', price: '', categoryId: '' })
  const [createMenuFormLoading, setCreateMenuFormLoading] = useState(false)
  const [createMenuFormError, setCreateMenuFormError] = useState('')
  const [createMenuFormSuccess, setCreateMenuFormSuccess] = useState('')

  const [showCreateCategoryForm, setShowCreateCategoryForm] = useState(false);

  // ✅ Fetch menu dan kategori dari API
  const fetchMenus = async () => {
    try {
      const res = await api.get('/menus')
      setMenus(res.data)
      setFilteredMenus(res.data)
      // Asumsi res.data memiliki menu dengan menu.category.name
    } catch (err) {
      console.error('Gagal fetch menu:', err)
    }
  }

  const fetchActualCategories = async () => {
    try {
      const res = await api.get('/categories');
      setActualCategories(res.data);
      setCategoryFilterOptions(['Semua', ...res.data.map(cat => cat.name)]);
    } catch (err) {
      console.error('Gagal fetch kategori:', err);
      setActualCategories([]); // Set ke array kosong jika gagal
      setCategoryFilterOptions(['Semua']);
    }
  };

  const loadInitialData = async () => {
    setLoading(true);
    await Promise.all([fetchMenus(), fetchActualCategories()]);
    setLoading(false);
  };

  useEffect(() => {
    loadInitialData()
  }, [])

  // 🔍 Filter berdasarkan nama kategori
  const handleFilter = (categoryName) => {
    setSelectedCategoryFilter(categoryName)
    if (categoryName === 'Semua') {
      setFilteredMenus(menus)
    } else {
      setFilteredMenus(menus.filter((m) => m.category && m.category.name === categoryName))
    }
  }

  // ✍️ Handle input form
  const handleChange = (e) => {
    setCreateMenuFormError('')
    setCreateMenuFormSuccess('')
    setCreateMenuForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  // 🧾 Submit menu baru
  const handleSubmit = async (e) => {
    e.preventDefault()
    setCreateMenuFormError('')
    setCreateMenuFormSuccess('')

    if (!createMenuForm.name || !createMenuForm.price || !createMenuForm.categoryId) {
      setCreateMenuFormError('Semua field wajib diisi!')
      return
    }
    if (isNaN(createMenuForm.price) || Number(createMenuForm.price) <= 0) {
      setCreateMenuFormError('Harga harus angka lebih dari 0')
      return
    }

    setCreateMenuFormLoading(true)
    try {
      await api.post('/menus', {
        name: createMenuForm.name,
        price: Number(createMenuForm.price),
        categoryId: parseInt(createMenuForm.categoryId),
      })
      setCreateMenuFormSuccess('Menu berhasil dibuat!')
      setCreateMenuForm({ name: '', price: '', categoryId: '' })
      setShowCreateMenuForm(false)
      loadInitialData() // Re-fetch menus and categories
    } catch (err) {
      setCreateMenuFormError(err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Gagal membuat menu. Coba lagi.')
      console.error(err)
    } finally {
      setCreateMenuFormLoading(false)
    }
  }

  // ❌ Hapus menu
  const handleDelete = async (id) => {
    if (!confirm('Yakin ingin menghapus menu ini?')) return
    try {
      await api.delete(`/menus/${id}`)
      loadInitialData() // Re-fetch menus
    } catch (err) {
      alert('Gagal menghapus menu.')
      console.error(err)
    }
  }

  // Callback setelah kategori baru ditambahkan
  const handleNewCategoryAdded = (newCategory) => {
    setActualCategories(prev => [...prev, newCategory]);
    setCategoryFilterOptions(prev => [...prev, newCategory.name]);
    setShowCreateCategoryForm(false); // Sembunyikan form tambah kategori
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-100 via-pink-50 to-white pt-24 px-4 pb-12">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 p-4 bg-white/50 backdrop-blur-md rounded-xl shadow-sm border border-pink-100">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <h1 className="text-3xl font-bold text-pink-700 flex items-center gap-3">
              <LayoutGrid className="w-8 h-8 text-pink-500" />
            Daftar Menu
          </h1>
            {/* Filter Kategori */}
            <div className="relative w-full sm:w-auto"> 
              <select
              value={selectedCategoryFilter}
              onChange={(e) => handleFilter(e.target.value)}
              className="appearance-none w-full bg-white border border-pink-300 text-pink-700 font-semibold py-2.5 px-4 pr-10 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pink-400 focus:border-transparent transition-all duration-300"
            >
              {categoryFilterOptions.map((catName) => (
                <option key={catName} value={catName}>
                  {catName}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                <ChevronsDown className="w-5 h-5 text-pink-400" />
            </div>
            </div>
          </div>
        </div>

        {/* Action Buttons: Tambah Menu & Tambah Kategori - di bawah header */}
        <div className="flex flex-col sm:flex-row items-center gap-4 mb-6">
          <button
            onClick={() => {
              setShowCreateMenuForm((v) => !v);
              if (showCreateCategoryForm) setShowCreateCategoryForm(false); 
            }}
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-2.5 px-5 rounded-lg shadow-md hover:shadow-lg transition-all duration-300"
          >
            {showCreateMenuForm ? (
              <><X className="w-5 h-5" /> Tutup Form Menu</>
            ) : (
              <><Plus className="w-5 h-5" /> Buat Menu Baru</>
            )}
          </button>
          <button
            onClick={() => {
              setShowCreateCategoryForm(prev => !prev);
              if (showCreateMenuForm) setShowCreateMenuForm(false);
            }}
            className="flex items-center justify-center gap-2 w-full sm:w-auto bg-white border border-pink-400 hover:bg-pink-50 text-pink-600 font-semibold py-2.5 px-5 rounded-lg shadow-sm hover:shadow-md transition-all duration-300"
          >
            {showCreateCategoryForm ? (
              <><X className="w-4 h-4" /> Tutup Form Kategori</>
            ) : (
              <><FolderPlus className="w-4 h-4" /> Tambah Kategori</>
            )}
          </button>
        </div>


        {/* Form Buat Menu */}
        {showCreateMenuForm && (
          <form
            onSubmit={handleSubmit}
            className="max-w-lg mx-auto bg-white/80 backdrop-blur-xl rounded-2xl p-6 sm:p-8 shadow-xl mb-8 border border-pink-200/70 space-y-6"
          >
            <div className="mb-4">
              <label className="block text-pink-700 font-semibold mb-1" htmlFor="name">
                Nama Menu
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={createMenuForm.name}
                onChange={handleChange}
                placeholder="Masukkan nama menu"
                className="w-full bg-white/70 border border-pink-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              />
            </div>

            <div className="mb-4">
              <label className="block text-pink-700 font-semibold mb-1" htmlFor="price">
                Harga (Rp)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                value={createMenuForm.price}
                onChange={handleChange}
                placeholder="Masukkan harga"
                className="w-full bg-white/70 border border-pink-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
                min="1"
              />
            </div>

            <div className="mb-4">
              <label className="block text-pink-700 font-semibold mb-1" htmlFor="categoryId">
                Kategori
              </label>
              <select
                id="categoryId"
                name="categoryId"
                value={createMenuForm.categoryId}
                onChange={handleChange}
                className="w-full bg-white/70 border border-pink-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all"
              >
                <option value="">Pilih Kategori</option>
                {actualCategories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            {createMenuFormError && <p className="text-red-500 mb-2">{createMenuFormError}</p>}
            {createMenuFormSuccess && <p className="text-green-600 mb-2">{createMenuFormSuccess}</p>}

            <button
              type="submit"
              disabled={createMenuFormLoading}
              className="w-full py-3 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold rounded-lg shadow-md hover:shadow-lg transition-all duration-300 disabled:opacity-70"
            >
              {createMenuFormLoading ? 'Menyimpan...' : 'Buat Menu'}
            </button>
          </form>
        )}

        {/* Form Tambah Kategori */}
        {showCreateCategoryForm && (
          <AddCategoryForm onCategoryAdded={handleNewCategoryAdded} />
        )}

        {/* List Menu */}
        {loading ? (
          <p className="text-center text-pink-400">Memuat menu...</p>
        ) : filteredMenus.length === 0 ? (
          <p className="text-center text-pink-500">Tidak ada menu dalam kategori ini.</p>
        ) : ( // Grid untuk kartu menu
          <div className="grid gap-5 sm:gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {filteredMenus.map((menu) => (
              <div
                key={menu.id}
                className="bg-white/90 backdrop-blur-sm rounded-xl shadow-lg hover:shadow-xl border border-pink-100/70 p-5 flex flex-col justify-between transition-all duration-300 hover:scale-[1.02]"
              >
                <div>
                  <h2 className="text-lg font-semibold text-pink-700 mb-1 truncate" title={menu.name}>{menu.name}</h2>
                  <p className="text-md font-bold text-rose-600 mb-2">Rp {menu.price.toLocaleString()}</p>
                  <p className="text-xs text-pink-500 italic mb-3">
                    {menu.category ? menu.category.name : 'Tanpa Kategori'}
                  </p>
                </div>
                <button
                  onClick={() => handleDelete(menu.id)}
                  className="mt-3 self-end flex items-center gap-1.5 text-xs text-red-500 hover:text-red-700 hover:bg-red-50 py-1 px-2 rounded-md transition-colors"
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
  )
}

export default MenuPage
