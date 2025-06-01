'use client';

import React, { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import api from '@/lib/api'; // Pastikan path ini benar, sesuaikan jika perlu
import { AUTH_TOKEN_KEY } from '@/lib/constants';

// 1. Membuat Context
const UserContext = createContext(null);

// 2. Membuat Provider Component
export const UserProvider = ({ children }) => {
  const [userData, setUserData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUserProfile = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    // Kita akan selalu mencoba mengambil profil.
    // Jika cookie HttpOnly yang valid ada, browser akan mengirimkannya secara otomatis
    // karena `withCredentials: true` di api.js.
    try {
      const response = await api.get('/auth/profile');
      const userProfile = response.data.user;
      if (!userProfile) {
        // Anda bisa memilih untuk throw error atau set error state dengan pesan spesifik
        console.warn("User data not found in response for context");
        setUserData(null); // Atau set ke state default jika ada
      } else {
        setUserData(userProfile);
      }
    } catch (err) {
      setUserData(null); // Pastikan userData null jika ada error

      if (err.response?.status === 401) {
        // Untuk 401, berarti tidak terautentikasi. Jangan set pesan error umum.
        // Middleware seharusnya menangani akses tidak sah ke rute yang dilindungi.
        // Redirect ini adalah fallback atau untuk kasus di mana state sisi klien perlu memaksanya.
        // Pesan ini hanya untuk debugging internal jika diperlukan, bukan untuk console.error publik.
        // console.log('UserProvider: Not authenticated (401). User data set to null.');
        if (pathname !== '/Login' && pathname !== '/Register') {
          router.push('/Login');
        }
      } else {
        // Untuk error lain (jaringan, server 500, dll.), set pesan error.
        // Dan log error ini karena ini adalah error yang tidak diharapkan.
        console.error('Failed to fetch user profile for context (non-401 error):', err);
        setError(err.message || 'Failed to load user data');
      }
    } finally {
      setIsLoading(false);
    }
  }, [router, pathname]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]); // useEffect berjalan ketika identitas fetchUserProfile berubah.

  // Gunakan useMemo untuk value agar tidak menyebabkan re-render yang tidak perlu
  const value = useMemo(() => ({
    userData,
    isLoading,
    error,
    refetchUserProfile: fetchUserProfile,
  }), [userData, isLoading, error, fetchUserProfile]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

// 3. Membuat Custom Hook untuk mengonsumsi Context
export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined || context === null) {
    // Jika context null, bisa jadi karena data belum termuat atau ada error.
    // Jika undefined, berarti hook dipanggil di luar Provider.
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};