'use client'

import { ArrowRight } from 'lucide-react';

const LOGIN_MODE = 'login';
const REGISTER_OWNER_MODE = 'register_owner';
const REGISTER_STAFF_MODE = 'register_staff';

export default function SubmitButton({ mode, loading }) {
  const getButtonText = () => {
    switch (mode) {
      case LOGIN_MODE:
        return 'Sign In';
      case REGISTER_OWNER_MODE:
        return 'Register Owner';
      case REGISTER_STAFF_MODE:
        return 'Register Staff';
      default:
        return 'Submit';
    }
  };

  return (
    <button
      type="submit"
      disabled={loading}
      className="w-full bg-gradient-to-r from-pink-500 to-rose-500 hover:from-pink-600 hover:to-rose-600 text-white font-semibold py-2.5 rounded-xl transition-all duration-300 shadow-lg hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 group"
    >
      {loading ? (
        <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
      ) : (
        <>
          <span>{getButtonText()}</span>
          <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
        </>
      )}
    </button>
  );
}