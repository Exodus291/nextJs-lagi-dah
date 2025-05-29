'use client'

import { useState } from 'react';
import { Eye, EyeOff, Mail, ArrowRight, AlertCircle, Heart, User, Lock, Briefcase, UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../lib/api'; // Assuming api.js is in src/lib

const LOGIN_MODE = 'login';
const REGISTER_OWNER_MODE = 'register_owner';
const REGISTER_STAFF_MODE = 'register_staff';


const initialFormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: '',
  referralCode: '',
};

export default function AuthPage() {
  const [mode, setMode] = useState(LOGIN_MODE);
  const [formData, setFormData] = useState(initialFormState);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const switchModeHandler = (newMode) => {
    setMode(newMode);
    setError('');
    setLoading(false);
    setFormData(initialFormState);
    setShowPassword(false);
    setShowConfirmPassword(false);
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
      // Jika request berhasil (tidak ada error), kita asumsikan cookie HTTP-only telah di-set oleh server.
      // Token tidak lagi diakses/disimpan secara manual di frontend.
      console.log('Login successful, cookie should be set by the server:', response.data);
      router.push('/'); // Redirect to home or dashboard
    } catch (err) {
      setError(err.response?.data?.message || (err.response?.data?.errors && err.response.data.errors[0]?.msg) || 'Login gagal. Periksa kembali email dan password Anda.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegisterOwnerSubmit = async () => {
    if (!formData.name.trim()) return setError('Nama wajib diisi.');
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
        password: formData.password,
      });
      alert('Registrasi Owner berhasil! Silakan login.');
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
      alert('Registrasi Staff berhasil! Silakan login.');
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

  const isRegisterMode = mode === REGISTER_OWNER_MODE || mode === REGISTER_STAFF_MODE;

  return (
    <div className="h-screen overflow-hidden bg-gradient-to-br from-pink-100 via-rose-50 to-white flex">
      {/* Left Side - Hero */}
      <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-pink-300/30 to-rose-200/30 z-10"></div>
        <img src="/91108963_1.jpg" alt="Background" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute top-20 left-20 w-32 h-32 bg-pink-200/40 rounded-full blur-xl animate-pulse"></div>
        <div className="absolute bottom-40 right-32 w-24 h-24 bg-rose-200/50 rounded-full blur-lg animate-bounce"></div>
        <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-pink-300/40 rounded-full blur-md animate-pulse delay-1000"></div>

        <div className="relative z-20 flex flex-col justify-center items-start p-16 text-gray-800 max-w-lg">
          <AnimatePresence mode="wait">
            {mode === LOGIN_MODE ? (
              <motion.div
                key="login"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }} // Smoother transition
              >
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-pink-600 bg-clip-text text-transparent">
                  Kenapa Harus Elaina?
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Karena Elaina itu wanita yang Cantik dan Wangyyy 😘😘😘😍😍
                </p>
              </motion.div>
            ) : mode === REGISTER_OWNER_MODE ? (
              <motion.div
                key="register_owner"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-pink-600 bg-clip-text text-transparent">
                  Become an Owner
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Start managing your business with Elaina POS. Register as an owner today!
                </p>
              </motion.div>
            ) : ( // REGISTER_STAFF_MODE
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-pink-600 bg-clip-text text-transparent">
                  Join Elaina's World!
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Register as staff and be part of the amazing team powered by Elaina.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className={`
        flex w-full lg:w-2/5 items-center justify-center p-8 h-full
        overflow-y-auto /* Always allow scroll if needed */
      `}>
        <div className="w-full max-w-md">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-200/50 p-6"> {/* Reduced padding */}
            <div className="text-center mb-6 relative min-h-[120px]"> {/* Adjusted min-h */}
              {/* Login Title/Icon */}
              <div className={`absolute inset-x-0 top-0 transition-opacity duration-500 ease-in-out ${mode === LOGIN_MODE ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"> {/* Reduced mb */}
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                <p className="text-gray-600 text-sm">Sign in to continue your journey</p>
              </div>
              {/* Register Owner Title/Icon */}
              <div className={`absolute inset-x-0 top-0 transition-opacity duration-500 ease-in-out ${mode === REGISTER_OWNER_MODE ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  <Briefcase className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Register Owner</h2>
                <p className="text-gray-600 text-sm">Create an owner account</p>
              </div>
              {/* Register Staff Title/Icon */}
              <div className={`absolute inset-x-0 top-0 transition-opacity duration-500 ease-in-out ${mode === REGISTER_STAFF_MODE ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"> {/* Reduced mb */}
                  <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Register Staff</h2>
                <p className="text-gray-600 text-sm">Join with a referral code</p>
              </div>
            </div>

            {error && (
              <div className="mb-3 p-3 bg-red-100 border border-red-300 rounded-xl flex items-center space-x-2 text-red-700"> {/* Reduced p and space-x */}
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit}>
              <div className="space-y-3"> {/* Apply space-y to the direct parent of fields */}
                {/* Name Field - Animatable */}
                <div
                  className={`grid transition-all duration-500 ease-in-out ${
                    isRegisterMode ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden"> {/* Inner wrapper for grid animation */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        name="name"
                        value={isRegisterMode ? formData.name : ''} // Clear value when hidden
                        onChange={handleChange}
                        placeholder="Full Name"
                        className="w-full pl-12 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-pink-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300" // Adjusted py
                      />
                    </div>
                  </div>
                </div>

                {/* Email Field - perlu margin atas jika Name field tidak ada */}
                <div className="relative"> {/* Removed conditional margin, space-y will handle */}
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    // required
                    value={formData.email} // Email is always visible
                    onChange={handleChange}
                    placeholder="Email address"
                    className="w-full pl-12 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-pink-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300" // Adjusted py
                  />
                </div>

                <div className="relative"> {/* Removed mt, space-y will handle */}
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password} // Password is always visible
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full pl-12 pr-12 py-2.5 bg-white/80 backdrop-blur-sm border border-pink-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300" // Adjusted py
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>

                {/* Confirm Password Field - Animatable */}
                <div
                  className={`grid transition-all duration-500 ease-in-out ${ // Removed mt, space-y will handle
                    isRegisterMode ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden"> {/* Inner wrapper for grid animation */}
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Lock className="w-5 h-5 text-gray-500" />
                      </div>
                      <input
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={isRegisterMode ? formData.confirmPassword : ''} // Clear value when hidden
                        onChange={handleChange}
                        placeholder="Confirm Password"
                        className="w-full pl-12 pr-12 py-2.5 bg-white/80 backdrop-blur-sm border border-pink-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300" // Adjusted py
                      />
                      <button
                        type="button"
                        onClick={() => isRegisterMode && setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Referral Field - Animatable */}
                <div
                  className={`grid transition-all duration-500 ease-in-out ${ // Removed mt, space-y will handle
                    mode === REGISTER_STAFF_MODE ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                  }`}
                >
                  <div className="overflow-hidden">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <UserPlus className="w-5 h-5 text-gray-500" />
                      </div>
                      <input
                        type="text"
                        name="referralCode"
                        value={mode === REGISTER_STAFF_MODE ? formData.referralCode : ''}
                        onChange={handleChange}
                        placeholder="Referral Code"
                        className="w-full pl-12 pr-4 py-2.5 bg-white/80 backdrop-blur-sm border border-pink-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300" // Adjusted py
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group" // Adjusted py, removed mt
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>
                        {mode === LOGIN_MODE ? 'Sign In' : (mode === REGISTER_OWNER_MODE ? 'Register Owner' : 'Register Staff')}
                      </span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Switch mode text - Animatable */}
            <div className="text-center text-sm text-gray-600 mt-6"> {/* Increased mt slightly */}
              {mode === LOGIN_MODE ? (
                <>
                  Don't have an account?{' '}
                  <button onClick={() => switchModeHandler(REGISTER_OWNER_MODE)} className="font-semibold text-pink-600 hover:text-pink-700">
                    Register as Owner
                  </button>
                  {' or '}
                  <button onClick={() => switchModeHandler(REGISTER_STAFF_MODE)} className="font-semibold text-pink-600 hover:text-pink-700">
                    Register as Staff
                  </button>
                </>
              ) : mode === REGISTER_OWNER_MODE ? (
                <>
                  Already have an account?{' '}
                  <button onClick={() => switchModeHandler(LOGIN_MODE)} className="font-semibold text-pink-600 hover:text-pink-700">
                    Sign In
                  </button>
                  <br /> Or{' '}
                  <button onClick={() => switchModeHandler(REGISTER_STAFF_MODE)} className="font-semibold text-pink-600 hover:text-pink-700">
                    Register as Staff
                  </button>
                </>
              ) : ( // REGISTER_STAFF_MODE
                <>
                  Already have an account?{' '}
                  <button onClick={() => switchModeHandler(LOGIN_MODE)} className="font-semibold text-pink-600 hover:text-pink-700">
                    Sign In
                  </button>
                  <br /> Or{' '}
                  <button onClick={() => switchModeHandler(REGISTER_OWNER_MODE)} className="font-semibold text-pink-600 hover:text-pink-700">
                    Register as Owner
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
