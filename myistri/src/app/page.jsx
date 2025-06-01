'use client'
import { useState, useEffect } from 'react';
import api from '@/lib/api'; // Impor instance API


export default function Home() {
  const [customerName, setCustomerName] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);

  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // Waktu debounce 300ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const handleAddItem = (menu) => {
    const exists = selectedItems.find((item) => item.id === menu.id);
    if (exists) {
      setSelectedItems((prev) =>
        prev.map((item) =>
          item.id === menu.id ? { ...item, qty: item.qty + 1 } : item
        )
      );
    } else {
      setSelectedItems((prev) => [...prev, { ...menu, qty: 1 }]);
    }
    setSearchTerm('');
    setShowDropdown(false);
    setHighlightIndex(0);
    setSearchResults([]); // Kosongkan hasil pencarian setelah item ditambahkan
  };

  const handleQtyChange = (id, delta) => {
    setSelectedItems((prev) =>
      prev
        .map((item) =>
          item.id === id ? { ...item, qty: item.qty + delta } : item
        )
        .filter((item) => item.qty > 0)
    );
  };

  const handleKeyDown = (e) => {
    if (!showDropdown) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev + 1 < searchResults.length ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev - 1 >= 0 ? prev - 1 : searchResults.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults.length > 0 && searchResults[highlightIndex]) {
        handleAddItem(searchResults[highlightIndex]);
      }
    }
  };

  const totalPrice = selectedItems.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  useEffect(() => {
    // Reset highlight index ketika hasil pencarian berubah
    setHighlightIndex(0);
  }, [searchResults]);

  // Fetch menu berdasarkan debouncedSearchTerm
  useEffect(() => {
    if (debouncedSearchTerm.trim() === '') {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const fetchMenus = async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const response = await api.get(`/menus/search/items?q=${encodeURIComponent(debouncedSearchTerm)}`); // Ubah 'query' menjadi 'q'
        setSearchResults(response.data.data || []); // Sesuaikan dengan struktur API: response.data.data
        setShowDropdown(true);
      } catch (error) {
        console.error('Error fetching menus:', error);
        setSearchError('Gagal memuat menu. Coba lagi.');
        setSearchResults([]);
      }
      setIsSearching(false);
    };

    fetchMenus();
  }, [debouncedSearchTerm]);

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-pink-400 text-center mb-8">
          Sistem Pemesanan
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Customer Info */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Informasi Pelanggan
            </h2>
            
            <input
              type="text"
              placeholder="Nama pelanggan"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full mb-4 px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:border-pink-400"
            />
            
            <textarea
              placeholder="Catatan pesanan"
              value={customerNote}
              onChange={(e) => setCustomerNote(e.target.value)}
              className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:border-pink-400 resize-none"
              rows={4}
            />
          </div>

          {/* Menu Selection */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Pilih Menu
            </h2>
            
            <div className="relative mb-4">
              <input
                type="text"
                placeholder="Cari menu..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setShowDropdown(true);
                }}
                onKeyDown={handleKeyDown}
                className="w-full px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:border-pink-400"
              />
              
              {showDropdown && (
                <ul className="absolute z-10 w-full bg-white border border-pink-200 rounded-lg shadow-lg mt-1 max-h-48 overflow-y-auto">
                  {isSearching && <li className="px-4 py-3 text-gray-500">Mencari...</li>}
                  {!isSearching && searchError && <li className="px-4 py-3 text-red-500">{searchError}</li>}
                  {!isSearching && !searchError && searchResults.length === 0 && debouncedSearchTerm && (
                    <li className="px-4 py-3 text-gray-500">Menu tidak ditemukan.</li>
                  )}
                  {!isSearching && !searchError && searchResults.map((menu, index) => (
                    <li
                      key={menu.id}
                      onClick={() => handleAddItem(menu)}
                      className={`px-4 py-3 cursor-pointer ${
                        index === highlightIndex 
                          ? 'bg-pink-100' 
                          : 'hover:bg-pink-50'
                      }`}
                    >
                      <div className="flex justify-between">
                        <span>{menu.name}</span>
                        <span className="font-medium text-pink-400">
                          Rp{menu.price.toLocaleString()}
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Menu Dipilih
            </h3>
            
            {selectedItems.length === 0 ? (
              <p className="text-gray-500 text-center py-4">
                Belum ada menu yang dipilih
              </p>
            ) : (
              <div className="space-y-3 mb-4">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 bg-pink-50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">
                        Rp{item.price.toLocaleString()} × {item.qty}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQtyChange(item.id, -1)}
                        className="w-8 h-8 bg-pink-200 hover:bg-pink-300 text-pink-600 rounded-full flex items-center justify-center font-bold"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium">{item.qty}</span>
                      <button
                        onClick={() => handleQtyChange(item.id, 1)}
                        className="w-8 h-8 bg-pink-200 hover:bg-pink-300 text-pink-600 rounded-full flex items-center justify-center font-bold"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-pink-200 pt-4">
              <div className="bg-gradient-to-r from-pink-400 to-rose-400 text-white p-4 rounded-lg text-center">
                <span className="text-lg font-bold">
                  Total: Rp{totalPrice.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {selectedItems.length > 0 && (
          <div className="text-center mt-6">
            <button className="bg-gradient-to-r from-pink-400 to-rose-400 hover:from-pink-500 hover:to-rose-500 text-white px-8 py-3 rounded-lg font-semibold shadow-md">
              Proses Pesanan
            </button>
          </div>
        )}
      </div>
    </div>
  );
}