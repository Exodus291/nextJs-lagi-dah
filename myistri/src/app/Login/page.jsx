'use client'

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';
import HeroSection from '../components/heroSecction';
import FormLogin from '../components/FormLogin';
import ToastNotification from '../components/toastNotif';
import api from '../../lib/api'; 

const LOGIN_MODE = 'login';
const REGISTER_OWNER_MODE = 'register_owner';
const REGISTER_STAFF_MODE = 'register_staff';

const initialFormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  store: '',
  referralCode: '',
};

export default function AuthPage() {
  const [mode, setMode] = useState(LOGIN_MODE);
  const [formData, setFormData] = useState(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({ message: '', type: 'info', id: null });
  const router = useRouter();

  const switchModeHandler = (newMode) => {
    setMode(newMode);
    setError('');
    setLoading(false);
    setFormData(initialFormState);
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const showToast = (message, type = 'success') => {
    setToast({ message, type, id: Date.now() }); // Gunakan Date.now() untuk key unik
  };

  const clearToast = () => {
    setToast({ message: '', type: 'info', id: null });
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (error) setError('');
  };

  const handleLoginSubmit = async () => {
    if (!formData.email || !formData.password) {
      setError('Email dan password wajib diisi.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const response = await api.post('/auth/login', {
        email: formData.email,
        password: formData.password,
      });
      console.log('Login successful, cookie should be set by the server:', response.data);
      router.push('/');
    } catch (err) {
      setError(err.response?.data?.message || (err.response?.data?.errors && err.response.data.errors[0]?.msg) || 'Login gagal. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterOwnerSubmit = async () => {
    if (!formData.name.trim()) return setError('Nama wajib diisi.');
    if (!formData.store.trim()) return setError('Nama toko wajib diisi.');
    if (!formData.email.trim()) return setError('Email wajib diisi.');
    if (!formData.password) return setError('Password wajib diisi.');
    if (formData.password.length < 6) return setError('Password minimal 6 karakter.');
    if (formData.password !== formData.confirmPassword) return setError('Konfirmasi password tidak cocok.');

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register/owner', {
        name: formData.name,
        email: formData.email,
        storeName: formData.store,
        password: formData.password,
      });
      showToast('Registrasi Owner berhasil! Silakan login.', 'success');
      switchModeHandler(LOGIN_MODE);
    } catch (err) {
      setError(err.response?.data?.message || (err.response?.data?.errors && err.response.data.errors[0]?.msg) || 'Registrasi Owner gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterStaffSubmit = async () => {
    if (!formData.name.trim()) return setError('Nama wajib diisi.');
    if (!formData.email.trim()) return setError('Email wajib diisi.');
    if (!formData.password) return setError('Password wajib diisi.');
    if (formData.password.length < 6) return setError('Password minimal 6 karakter.');
    if (formData.password !== formData.confirmPassword) return setError('Konfirmasi password tidak cocok.');
    if (!formData.referralCode.trim()) return setError('Kode referral wajib diisi.');

    setLoading(true);
    setError('');
    try {
      await api.post('/auth/register/staff', {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        referralCode: formData.referralCode,
      });
      showToast('Registrasi Staff berhasil! Silakan login.', 'success');
      switchModeHandler(LOGIN_MODE);
    } catch (err) {
      setError(err.response?.data?.message || (err.response?.data?.errors && err.response.data.errors[0]?.msg) || 'Registrasi Staff gagal. Coba lagi.');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (mode === LOGIN_MODE) {
      await handleLoginSubmit();
    } else if (mode === REGISTER_OWNER_MODE) {
      await handleRegisterOwnerSubmit();
    } else if (mode === REGISTER_STAFF_MODE) {
      await handleRegisterStaffSubmit();
    }
  };

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-rose-50 to-white flex">
      <HeroSection mode={mode} />
      <FormLogin
        mode={mode}
        formData={formData}
        showPassword={showPassword}
        showConfirmPassword={showConfirmPassword}
        error={error}
        loading={loading}
        onModeSwitch={switchModeHandler}
        onChange={handleChange}
        onSubmit={handleFormSubmit}
        onTogglePassword={() => setShowPassword(!showPassword)}
        onToggleConfirmPassword={() => setShowConfirmPassword(!showConfirmPassword)}
      />
      <AnimatePresence>
        {toast.message && toast.id && (
          <ToastNotification
            key={toast.id}
            message={toast.message}
            type={toast.type}
            onDismiss={clearToast}
            duration={3000}// duration defaultnya 5 detik, bisa di-override di sini jika perlu
          />
        )}
      </AnimatePresence>
    </div>
  );
}