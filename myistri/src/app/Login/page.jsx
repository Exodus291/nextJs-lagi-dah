'use client'

import { useState } from 'react';
import { Eye, EyeOff, Mail, ArrowRight, AlertCircle, Heart, User, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

const LOGIN_MODE = 'login';
const REGISTER_MODE = 'register';

const initialFormState = {
  name: '',
  email: '',
  password: '',
  confirmPassword: ''
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

  const handleLoginSubmit = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required.');
      return;
    }
    setLoading(true);
    setError('');
    setTimeout(() => {
      if (formData.email === 'demo@example.com' && formData.password === 'password') {
        router.push('/');
      } else {
        setError('Invalid email or password');
      }
      setLoading(false);
    }, 1500);
  };

  const handleRegisterSubmit = () => {
    if (!formData.name.trim()) return setError('Name is required');
    if (!formData.email.trim()) return setError('Email is required');
    if (!formData.password) return setError('Password is required');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');

    setLoading(true);
    setError('');
    setTimeout(() => {
      alert(`Registered successfully!\nName: ${formData.name}\nEmail: ${formData.email}`);
      setLoading(false);
      switchModeHandler(LOGIN_MODE);
    }, 1500);
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    if (mode === LOGIN_MODE) handleLoginSubmit();
    else handleRegisterSubmit();
  };

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
                transition={{ duration: 0.3 }}
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
            ) : (
              <motion.div
                key="register"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
              >
                <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
                  <User className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-pink-600 bg-clip-text text-transparent">
                  Join Elaina's World!
                </h1>
                <p className="text-xl text-gray-600 leading-relaxed">
                  Daftar sekarang dan rasakan keajaiban dunia Elaina yang penuh keindahan dan keceriaan.
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className={`
        flex w-full lg:w-2/5 items-center justify-center p-8 h-full
        ${mode === REGISTER_MODE ? 'overflow-y-hidden' : 'overflow-y-auto'}
      `}>
        <div className="w-full max-w-md">
          <div className="bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-pink-200/50 p-8">
            <div className="text-center mb-8 relative min-h-[160px]"> {/* Container for title/icon cross-fade, adjust min-h as needed */}
              {/* Login Title/Icon */}
              <div className={`absolute inset-x-0 top-0 transition-opacity duration-500 ease-in-out ${mode === LOGIN_MODE ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Heart className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
                <p className="text-gray-600">Sign in to continue your journey</p>
              </div>
              {/* Register Title/Icon */}
              <div className={`absolute inset-x-0 top-0 transition-opacity duration-500 ease-in-out ${mode === REGISTER_MODE ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"> {/* Different color for register */}
                  <User className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">Create Account</h2>
                <p className="text-gray-600">Let's get you started</p>
              </div>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-100 border border-red-300 rounded-xl flex items-center space-x-3 text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-6">
              <div> {/* Wrapper tambahan untuk menjaga space-y-6 jika diperlukan, atau bisa langsung di form */}
                {/* Name Field - Animatable */}
                <div
                  className={`grid transition-all duration-500 ease-in-out ${
                    mode === REGISTER_MODE ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
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
                        // required={mode === REGISTER_MODE} // 'required' di input dalam form akan memicu validasi browser bawaan
                        value={mode === REGISTER_MODE ? formData.name : ''} // Clear value when hidden
                        onChange={handleChange}
                        placeholder="Full Name"
                        className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-pink-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                      />
                    </div>
                  </div>
                </div>

                {/* Email Field - perlu margin atas jika Name field tidak ada */}
                <div className={`relative ${mode === LOGIN_MODE ? 'mt-0' : 'mt-6'}`}>
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Mail className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type="email"
                    name="email"
                    // required
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="Email address"
                    className="w-full pl-12 pr-4 py-4 bg-white/80 backdrop-blur-sm border border-pink-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                <div className="relative mt-6">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                    <Lock className="w-5 h-5 text-gray-500" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    // required
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Password"
                    className="w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-sm border border-pink-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
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
                  className={`grid transition-all duration-500 ease-in-out ${
                    mode === REGISTER_MODE ? 'grid-rows-[1fr] opacity-100 mt-6' : 'grid-rows-[0fr] opacity-0 mt-0' // Tambah mt-6 saat visible
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
                        // required={mode === REGISTER_MODE}
                        value={mode === REGISTER_MODE ? formData.confirmPassword : ''} // Clear value when hidden
                        onChange={handleChange}
                        placeholder="Confirm Password"
                        className="w-full pl-12 pr-12 py-4 bg-white/80 backdrop-blur-sm border border-pink-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300"
                      />
                      <button
                        type="button"
                        onClick={() => mode === REGISTER_MODE && setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>
                </div>

                <button
                  type="submit" // Ubah tipe tombol menjadi submit
                  disabled={loading}
                  className="w-full mt-6 bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-4 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  ) : (
                    <>
                      <span>{mode === LOGIN_MODE ? 'Sign In' : 'Sign Up'}</span>
                      <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Switch mode text - Animatable */}
            <div className="text-center text-gray-600 relative min-h-[24px] mt-6"> {/* min-h for stability, tambah mt-6 */}
              <div className={`absolute inset-x-0 top-0 transition-opacity duration-500 ease-in-out ${mode === LOGIN_MODE ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <>
                    <span>Don't have an account? </span>
                    <button
                      type="button"
                      onClick={() => switchModeHandler(REGISTER_MODE)}
                      className="text-pink-600 hover:text-pink-700 font-semibold transition-colors"
                    >
                      Register
                    </button>
                  </>
              </div>
              <div className={`absolute inset-x-0 top-0 transition-opacity duration-500 ease-in-out ${mode === REGISTER_MODE ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
                <>
                    <span>Already have an account? </span>
                    <button
                      type="button"
                      onClick={() => switchModeHandler(LOGIN_MODE)}
                      className="text-pink-600 hover:text-pink-700 font-semibold transition-colors"
                    >
                      Sign in
                    </button>
                  </>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
