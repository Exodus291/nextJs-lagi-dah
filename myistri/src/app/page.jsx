'use client'
import { useState, useEffect } from 'react';


export default function Home() {
  const [customerName, setCustomerName] = useState('');
  const [customerNote, setCustomerNote] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);

  const filteredMenus = searchTerm
    ? mockMenus.filter((menu) =>
        menu.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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
        prev + 1 < filteredMenus.length ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlightIndex((prev) =>
        prev - 1 >= 0 ? prev - 1 : filteredMenus.length - 1
      );
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredMenus.length > 0) {
        handleAddItem(filteredMenus[highlightIndex]);
      }
    }
  };

  const totalPrice = selectedItems.reduce(
    (total, item) => total + item.price * item.qty,
    0
  );

  useEffect(() => {
    setHighlightIndex(0); // reset saat search berubah
  }, [searchTerm]);

  return (
    <div className="min-h-screen p-6 bg-gray-100">
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Kiri */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Informasi Pelanggan</h2>
          <input
            type="text"
            placeholder="Nama"
            value={customerName}
            onChange={(e) => setCustomerName(e.target.value)}
            className="w-full mb-4 px-4 py-2 border rounded"
          />
          <textarea
            placeholder="Pesan / Catatan"
            value={customerNote}
            onChange={(e) => setCustomerNote(e.target.value)}
            className="w-full px-4 py-2 border rounded"
            rows={4}
          />
        </div>

        {/* Kanan */}
        <div className="bg-white p-6 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Pilih Menu</h2>
          <div className="relative">
            <input
              type="text"
              placeholder="Cari menu..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setShowDropdown(true);
              }}
              onKeyDown={handleKeyDown}
              className="w-full mb-2 px-4 py-2 border rounded"
            />
            {showDropdown && filteredMenus.length > 0 && (
              <ul className="absolute z-10 w-full bg-white border rounded shadow max-h-48 overflow-y-auto">
                {filteredMenus.map((menu, index) => (
                  <li
                    key={menu.id}
                    onClick={() => handleAddItem(menu)}
                    className={`px-4 py-2 cursor-pointer hover:bg-blue-100 ${
                      index === highlightIndex ? 'bg-blue-100' : ''
                    }`}
                  >
                    {menu.name} - Rp{menu.price.toLocaleString()}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <h3 className="text-lg font-semibold mt-4 mb-2">Menu Dipilih</h3>
          <ul className="space-y-2">
            {selectedItems.map((item) => (
              <li
                key={item.id}
                className="flex justify-between items-center border-b pb-2"
              >
                <div>
                  <div className="font-medium">{item.name}</div>
                  <div className="text-sm text-gray-500">
                    Rp{item.price.toLocaleString()} x {item.qty}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleQtyChange(item.id, -1)}
                    className="bg-red-100 px-2 rounded"
                  >
                    -
                  </button>
                  <span>{item.qty}</span>
                  <button
                    onClick={() => handleQtyChange(item.id, 1)}
                    className="bg-green-100 px-2 rounded"
                  >
                    +
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-4 text-right font-bold text-lg">
            Total: Rp{totalPrice.toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  );
}
