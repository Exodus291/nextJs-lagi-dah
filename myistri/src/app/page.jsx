'use client'
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation'; // Impor useRouter
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
  
  // State untuk metode pembayaran dan proses pesanan
  const [paymentMethods] = useState([
    { id: 'cash', name: 'Tunai (Cash)' },
    { id: 'qris', name: 'QRIS' },
  ]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);
  const [submitOrderStatus, setSubmitOrderStatus] = useState({ message: '', type: '' }); // type: 'success' or 'error'

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

  const handleProcessOrder = async () => {
    if (selectedItems.length === 0) {
      setSubmitOrderStatus({ message: 'Keranjang Anda kosong. Silakan pilih menu terlebih dahulu.', type: 'error' });
      return;
    }

    setIsSubmittingOrder(true);
    setSubmitOrderStatus({ message: '', type: '' });

    const orderData = {
      // customerName and notes are now part of the first transactionItem if provided
      transactionItems: selectedItems.map((item, index) => {
        const transactionItem = {
          menuId: item.id,
          quantity: item.qty,
          priceAtTransaction: Number(item.price).toFixed(2), // Format as string with 2 decimal places
        };

        // Add customerName and customerNote only to the first item, if they exist
        if (index === 0) {
          const globalCustomerName = customerName.trim();
          const globalCustomerNote = customerNote.trim();
          if (globalCustomerName) {
            transactionItem.customerName = globalCustomerName;
          }
          if (globalCustomerNote) {
            transactionItem.customerNote = globalCustomerNote;
          }
        }
        return transactionItem;
      }),
      totalAmount: totalPrice,
      paymentMethod: selectedPaymentMethod || null, // Kirim null jika tidak ada metode pembayaran dipilih
      status: selectedPaymentMethod ? 'COMPLETED' : 'PENDING' // Atur status berdasarkan pilihan metode pembayaran
    };

    try {
      const response = await api.post('/transactions', orderData); 
      setSubmitOrderStatus({ message: `Pesanan berhasil dibuat! ID Transaksi: ${response.data?.transaction?.id || ''}`, type: 'success' });
      // Reset form setelah berhasil
      setCustomerName('');
      setCustomerNote('');
      setSelectedItems([]);
      setSearchTerm('');
      setSelectedPaymentMethod('');
      // Mungkin redirect atau tindakan lain
    } catch (error) {
      console.error('Error processing order:', error);
      setSubmitOrderStatus({ message: error.response?.data?.message || 'Gagal memproses pesanan. Coba lagi.', type: 'error' });
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold text-pink-400 text-center mb-8">
          Sistem Pemesanan
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Customer Info */}
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Informasi Pelanggan
            </h2>
            
            <input
              type="text"
              placeholder="Nama pelanggan (opsional)"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full mb-4 px-4 py-3 border border-pink-200 rounded-lg focus:outline-none focus:border-pink-400"
            />
            
            <textarea
              placeholder="Catatan pesanan (opsional)"
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
          </div>

          {/* Order Summary & Payment */}
          <div className="lg:col-span-1 bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">
              Ringkasan & Pembayaran
            </h2>

            <div className="border-y border-pink-200 py-4 mb-4">
              <div className="flex justify-between items-center text-lg font-semibold text-pink-600">
                <span>Total Pesanan:</span>
                <span>Rp{totalPrice.toLocaleString()}</span>
              </div>
            </div>

            <h3 className="text-lg font-medium text-gray-800 mb-3">
              Metode Pembayaran
            </h3>
            <div className="space-y-2 mb-6">
              {paymentMethods.map((method) => (
                <label
                  key={method.id}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                    selectedPaymentMethod === method.id
                      ? 'bg-pink-100 border-pink-400 ring-2 ring-pink-300'
                      : 'border-gray-200 hover:border-pink-300 hover:bg-pink-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value={method.id}
                    checked={selectedPaymentMethod === method.id}
                    onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                    className="h-4 w-4 text-pink-500 border-gray-300 focus:ring-pink-400 mr-3"
                  />
                  <span className="text-sm font-medium text-gray-700">{method.name}</span>
                </label>
              ))}
            </div>

            {submitOrderStatus.message && (
              <div className={`p-3 rounded-md text-sm mb-4 ${
                submitOrderStatus.type === 'success' ? 'bg-green-100 text-green-700 border border-green-300' : 'bg-red-100 text-red-700 border border-red-300'
              }`}>
                {submitOrderStatus.message}
              </div>
            )}

            {selectedItems.length > 0 && (
              <button 
                onClick={handleProcessOrder}
                disabled={isSubmittingOrder || selectedItems.length === 0}
                className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white px-6 py-3 rounded-lg font-semibold shadow-md transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center">
                {isSubmittingOrder ? (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : "Proses Pesanan"}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
