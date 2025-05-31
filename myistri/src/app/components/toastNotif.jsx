'use client'

import { CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect } from 'react';

const icons = {
  success: CheckCircle,
  error: AlertTriangle,
  info: Info,
};

const bgColors = {
  success: 'bg-pink-500',
  error: 'bg-pink-500',
  info: 'bg-pink-500',
};

// Biasanya warna teks putih untuk background di atas
const textColors = {
  success: 'text-white',
  error: 'text-white',
  info: 'text-white',
};

export default function ToastNotification({
  message,
  type = 'info', // 'success', 'error', 'info'
  duration = 5000, // Durasi dalam milidetik sebelum otomatis hilang
  onDismiss, // Fungsi callback saat toast ditutup
}) {
  useEffect(() => {
    // Set timer untuk otomatis menghilangkan toast jika durasi dan onDismiss tersedia
    if (message && duration && onDismiss) {
      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer); // Bersihkan timer jika komponen unmount atau dependensi berubah
    }
  }, [message, duration, onDismiss]); // Jalankan efek ini jika message, duration, atau onDismiss berubah

  // Jangan render apa-apa jika tidak ada pesan
  // AnimatePresence di parent akan menangani animasi keluar-masuk
  if (!message) {
    return null;
  }

  const IconComponent = icons[type] || Info;
  const bgColorClass = bgColors[type] || bgColors.info;
  const textColorClass = textColors[type] || textColors.info;

  return (
    <motion.div
      layout // Untuk animasi layout yang mulus jika konten berubah ukuran
      initial={{ opacity: 0, y: 50, scale: 0.9 }} // Animasi awal
      animate={{ opacity: 1, y: 0, scale: 1 }} // Animasi saat muncul
      exit={{ opacity: 0, x: 100, scale: 0.9 }} // Animasi saat hilang (geser ke kanan)
      transition={{ type: 'spring', stiffness: 300, damping: 30 }} // Transisi tipe spring
      className={`fixed bottom-6 right-6 z-[100] p-4 rounded-xl shadow-2xl ${bgColorClass} ${textColorClass} flex items-start space-x-3 max-w-md min-w-[300px]`}
      role="alert"
      aria-live="assertive" // Penting untuk aksesibilitas, mengumumkan pesan ke screen reader
    >
      <IconComponent className="w-6 h-6 flex-shrink-0 mt-0.5" />
      <div className="flex-grow">
        <p className="text-sm font-semibold">{message}</p>
      </div>
      {onDismiss && ( // Tampilkan tombol tutup jika onDismiss disediakan
        <button
          onClick={onDismiss}
          className={`ml-auto -mr-1 -my-1 p-1.5 rounded-md ${textColorClass} hover:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/50 transition-colors`}
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </motion.div>
  );
}
