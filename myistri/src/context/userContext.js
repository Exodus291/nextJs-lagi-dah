'use client';

import React, { createContext, useState, useEffect, useCallback, useContext, useMemo } from 'react';
import { useRouter } from 'next/navigation';
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

  const fetchUserProfile = useCallback(async () => {

    const tokenExists = !!document.cookie.includes(`${AUTH_TOKEN_KEY}`);

    if (!tokenExists) {
        setUserData(null);
        setIsLoading(false);
        setError(null);
        return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const response = await api.get('/auth/profile');
      const userProfile = response.data.user;
      if (!userProfile) {
        // Anda bisa memilih untuk throw error atau set error state dengan pesan spesifik
        console.warn("User data not found in response for context");
        setUserData(null); // Atau set ke state default jika ada
        // setError("User data not found"); // Opsional, tergantung bagaimana Anda ingin menangani ini
      } else {
        setUserData(userProfile);
      }
    } catch (err) {
      console.error('Failed to fetch user profile for context:', err);
      setError(err.message || 'Failed to load user data');
      setUserData(null); // Pastikan userData null jika ada error
      if (err.response?.status === 401) {
        router.push('/Login'); // Redirect jika tidak terautentikasi
      }
    } finally {
      setIsLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

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