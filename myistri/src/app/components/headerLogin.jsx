'use client'

import { Heart, Briefcase, UserPlus } from 'lucide-react';

const LOGIN_MODE = 'login';
const REGISTER_OWNER_MODE = 'register_owner';
const REGISTER_STAFF_MODE = 'register_staff';

export default function HeaderLogin({ mode }) {
  return (
    <div className="text-center mb-10 relative min-h-[120px]">
      <HeaderContent
        mode={LOGIN_MODE}
        currentMode={mode}
        icon={Heart}
        title="Welcome Back"
        subtitle="Sign in to continue your journey"
      />
      <HeaderContent
        mode={REGISTER_OWNER_MODE}
        currentMode={mode}
        icon={Briefcase}
        title="Register Owner"
        subtitle="Create an owner account"
      />
      <HeaderContent
        mode={REGISTER_STAFF_MODE}
        currentMode={mode}
        icon={UserPlus}
        title="Register Staff"
        subtitle="Join with a referral code"
      />
    </div>
  );
}

function HeaderContent({ mode, currentMode, icon: Icon, title, subtitle }) {
  const isActive = mode === currentMode;
  
  return (
    <div className={`absolute inset-x-0 top-0 transition-opacity duration-500 ease-in-out ${
      isActive ? 'opacity-100' : 'opacity-0 pointer-events-none'
    }`}>
      <div className="w-16 h-16 bg-gradient-to-r from-pink-500 to-rose-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h2 className="text-3xl font-bold text-gray-800 mb-2">{title}</h2>
      <p className="text-gray-600 text-sm">{subtitle}</p>
    </div>
  );
}