'use client'
import { useState, useEffect, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import ToastNotification from './components/toastNotif'; // Sesuaikan path jika perlu
import { X as XIcon, Search as SearchIcon, Trash2 } from 'lucide-react';
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
  // const [submitOrderStatus, setSubmitOrderStatus] = useState({ message: '', type: '' }); // Diganti dengan toast
  const [toast, setToast] = useState({ message: '', type: 'info', id: null });
  // const [showFullScreenLoader, setShowFullScreenLoader] = useState(false); // Dihapus

  const searchContainerRef = useRef(null);


  // Debounce search term
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300); // Waktu debounce 300ms

    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm]);

  // Click outside to close search dropdown
  useEffect(() => {
    function handleClickOutside(event) {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [searchContainerRef]);


  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() });
  };

  const clearToast = () => {
    setToast({ message: '', type: 'info', id: null });
  };

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
    (total, item) => total + Number(item.price) * item.qty, // Pastikan item.price adalah angka
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
      // Only hide dropdown if search term is truly empty and not just debouncing
      if (searchTerm.trim() === '') {
        setShowDropdown(false);
      }
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
  }, [debouncedSearchTerm, searchTerm]); // Added searchTerm to deps for immediate clear effect

  const handleProcessOrder = async () => {
    if (selectedItems.length === 0) {
      showToast('Keranjang Anda kosong. Silakan pilih menu terlebih dahulu.', 'error');
      return;
    }

    setIsSubmittingOrder(true);
    // setShowFullScreenLoader(true); // Dihapus
    // setSubmitOrderStatus({ message: '', type: '' }); // Dihapus

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
      showToast(`Pesanan berhasil dibuat! ID Transaksi: ${response.data?.transaction?.id || ''}`, 'success');
      // Reset form setelah berhasil
      setCustomerName('');
      setCustomerNote('');
      setSelectedItems([]);
      setSearchTerm('');
      setSelectedPaymentMethod('');
      // Mungkin redirect atau tindakan lain
    } catch (error) {
      console.error('Error processing order:', error);
      showToast(error.response?.data?.message || 'Gagal memproses pesanan. Coba lagi.', 'error');
    } finally {
      setIsSubmittingOrder(false);
      // setShowFullScreenLoader(false); // Dihapus
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-purple-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto ">
        <AnimatePresence>
          {toast.message && toast.id && (
            <ToastNotification
              key={toast.id}
              message={toast.message}
              type={toast.type}
              onDismiss={clearToast}
              duration={5000} 
            />
          )}
        </AnimatePresence>
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Left Column: Customer Info & Menu Selection */}
          {/* Diubah menjadi: Left Column: Menu Selection & Cart */}
          <div className="lg:w-7/12 space-y-2">
            {/* Menu Selection Card */}
            <div className="bg-white p-4 rounded-xl shadow-lg border border-pink-200/60">
              <h2 className="text-xl font-semibold text-pink-700 mb-4">
                Pilih Menu
              </h2>
              <div className="relative" ref={searchContainerRef}>
                <div className="relative"> {/* Wrapper for input and clear button */}
                  <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <SearchIcon className="h-5 w-5 text-gray-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Cari menu..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setShowDropdown(true); 
                    }}
                    onFocus={() => {
                      if (searchTerm.trim() !== '' || searchResults.length > 0) {
                        setShowDropdown(true);
                      }
                    }}
                    onKeyDown={handleKeyDown}
                    className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                  />
                  {searchTerm && (
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSearchResults([]); 
                        setShowDropdown(false); 
                      }}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
                      aria-label="Clear search"
                    >
                      <XIcon className="h-5 w-5" />
                    </button>
                  )}
                </div>
                {showDropdown && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-200 rounded-lg shadow-lg mt-1 max-h-60 overflow-y-auto custom-scrollbar">
                    {isSearching && <li className="px-4 py-3 text-gray-500 text-center">Mencari...</li>}
                    {!isSearching && searchError && <li className="px-4 py-3 text-red-500 text-center">{searchError}</li>}
                    {!isSearching && !searchError && searchResults.length === 0 && debouncedSearchTerm.trim() !== '' && (
                      <li className="px-4 py-3 text-gray-500 text-center">Menu tidak ditemukan.</li>
                    )}
                    {!isSearching && !searchError && searchResults.length > 0 && searchResults.map((menu, index) => (
                      <li
                        key={menu.id}
                        onClick={() => handleAddItem(menu)}
                        className={`px-4 py-3 cursor-pointer ${
                          index === highlightIndex 
                            ? 'bg-pink-100 text-pink-700' 
                            : 'hover:bg-pink-50'
                        }`}
                      >
                        <div className="flex justify-between">
                          <span>{menu.name}</span>
                          <span className="font-medium text-pink-600">
                            Rp{Number(menu.price).toLocaleString()}
                          </span>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {/* Card 1: Keranjang Pesanan (Selected Items) */}
            {/* Dipindahkan ke Kolom Kiri */}
            <div className="bg-white p-4 rounded-xl shadow-lg border border-pink-200/60">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-pink-700">
                  Keranjang Pesanan
                </h2>
                {selectedItems.length > 0 && (
                  <button
                    onClick={() => {
                      setSelectedItems([]);
                      showToast('Keranjang berhasil dikosongkan.', 'info');
                    }}
                    className="text-sm text-pink-600 hover:text-pink-800 font-medium py-1 px-2 rounded-md hover:bg-pink-100 transition-colors flex items-center gap-1"
                    aria-label="Kosongkan keranjang"
                  >
                    <Trash2 className="w-4 h-4" /> Kosongkan
                  </button>
                )}
              </div>
              {selectedItems.length === 0 ? (
                <p className="text-gray-500 text-center py-2">Keranjang kosong.</p>
              ) : (
                <div className="space-y-3 max-h-[calc(100vh-500px)] min-h-[100px] overflow-y-auto pr-2 custom-scrollbar">
                {selectedItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex justify-between items-center p-3 bg-pink-50 border border-pink-200 rounded-lg shadow-sm"
                  >
                    <div>
                      <div className="font-medium">{item.name}</div>
                      <div className="text-sm text-gray-600">
                        Rp{Number(item.price).toLocaleString()} × {item.qty}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleQtyChange(item.id, -1)}
                        className="w-8 h-8 bg-pink-500 hover:bg-pink-600 text-white rounded-full flex items-center justify-center font-semibold transition-colors"
                      >
                        −
                      </button>
                      <span className="w-8 text-center font-medium">{item.qty}</span>
                      <button
                        onClick={() => handleQtyChange(item.id, 1)}
                        className="w-8 h-8 bg-pink-500 hover:bg-pink-600 text-white rounded-full flex items-center justify-center font-semibold transition-colors"
                      >
                        +
                      </button>
                    </div>
                  </div>
                ))}
              </div>
              )}
            </div>
          </div>

          {/* Right Column: Cart, Summary & Payment */}
          {/* Diubah menjadi: Right Column: Customer Info, Summary & Payment */}
          <div className="lg:w-5/12 space-y-2">
            {/* Customer Info Card */}
            {/* Dipindahkan ke Kolom Kanan */}
            <div className="bg-white p-4 rounded-xl shadow-lg border border-pink-200/60">
              <h2 className="text-xl font-semibold text-pink-700 mb-4">
                Informasi Pelanggan
              </h2>
              <input
                type="text"
                placeholder="Nama pelanggan (opsional)"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="w-full mb-4 px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
              />
              <textarea
                placeholder="Catatan pesanan (opsional)"
                value={customerNote}
                onChange={(e) => setCustomerNote(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:ring-2 focus:ring-pink-500 focus:border-pink-500 resize-none transition-colors"
                rows={4}
              />
            </div>

            {/* Card 2: Ringkasan & Pembayaran */}
            <div className="bg-white p-4 rounded-xl shadow-lg border border-pink-200/60">
              <h2 className="text-xl font-semibold text-pink-700 mb-4">
                Ringkasan & Pembayaran
              </h2>

              <div className="border-y border-pink-100 py-4 mb-4">
                <div className="flex justify-between items-center text-lg font-semibold text-pink-700">
                  <span>Total Pesanan:</span>
                  <span>Rp{totalPrice.toLocaleString()}</span>
                </div>
              </div>

              <h3 className="text-md font-semibold text-pink-700 mb-3">
                Metode Pembayaran
              </h3>
              <div className="space-y-2 mb-6">
                {paymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all duration-200 ${
                      selectedPaymentMethod === method.id
                        ? 'bg-pink-100 border-pink-500 ring-2 ring-pink-400'
                        : 'border-gray-300 hover:border-pink-300 hover:bg-pink-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={(e) => setSelectedPaymentMethod(e.target.value)}
                      className="h-4 w-4 text-pink-600 border-gray-300 focus:ring-pink-500 mr-3"
                    />
                    <span className="text-sm font-medium text-gray-700">{method.name}</span>
                  </label>
                ))}
              </div>

              {selectedItems.length > 0 && (
                <button 
                  onClick={handleProcessOrder}
                  disabled={isSubmittingOrder || selectedItems.length === 0}
                  className="w-full bg-pink-600 hover:bg-pink-700 text-white px-6 py-3 rounded-lg font-semibold shadow-md hover:shadow-lg transform hover:scale-[1.02] transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
                >
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
    </div>
  );
}
