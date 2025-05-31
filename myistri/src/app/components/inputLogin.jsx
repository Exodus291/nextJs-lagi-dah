'use client'

import { Eye, EyeOff, Mail, User, Lock, UserPlus, Store } from 'lucide-react';

const LOGIN_MODE = 'login';
const REGISTER_OWNER_MODE = 'register_owner';
const REGISTER_STAFF_MODE = 'register_staff';

export default function InputLogin({
  mode,
  formData,
  showPassword,
  showConfirmPassword,
  onChange,
  onTogglePassword,
  onToggleConfirmPassword
}) {
  const isRegisterMode = mode === REGISTER_OWNER_MODE || mode === REGISTER_STAFF_MODE;

  return (
    <>
      {/* Name Field */}
      <AnimatedField show={isRegisterMode}>
        <InputField
          icon={User}
          type="text"
          name="name"
          value={isRegisterMode ? formData.name : ''}
          onChange={onChange}
          placeholder="Full Name"
        />
      </AnimatedField>

      {/* Store Name Field */}
      <AnimatedField show={mode === REGISTER_OWNER_MODE}>
        <InputField
          icon={Store}
          type="text"
          name="storeName"
          value={mode === REGISTER_OWNER_MODE ? formData.storeName : ''}
          onChange={onChange}
          placeholder="Nama Toko"
        />
      </AnimatedField>

      {/* Email Field */}
      <InputField
        icon={Mail}
        type="email"
        name="email"
        value={formData.email}
        onChange={onChange}
        placeholder="Email address"
      />

      {/* Password Field */}
      <InputField
        icon={Lock}
        type={showPassword ? 'text' : 'password'}
        name="password"
        value={formData.password}
        onChange={onChange}
        placeholder="Password"
        showToggle
        onToggle={onTogglePassword}
        toggleState={showPassword}
      />

      {/* Confirm Password Field */}
      <AnimatedField show={isRegisterMode}>
        <InputField
          icon={Lock}
          type={showConfirmPassword ? 'text' : 'password'}
          name="confirmPassword"
          value={isRegisterMode ? formData.confirmPassword : ''}
          onChange={onChange}
          placeholder="Confirm Password"
          showToggle
          onToggle={() => isRegisterMode && onToggleConfirmPassword()}
          toggleState={showConfirmPassword}
        />
      </AnimatedField>

      {/* Referral Code Field */}
      <AnimatedField show={mode === REGISTER_STAFF_MODE}>
        <InputField
          icon={UserPlus}
          type="text"
          name="referralCode"
          value={mode === REGISTER_STAFF_MODE ? formData.referralCode : ''}
          onChange={onChange}
          placeholder="Referral Code"
        />
      </AnimatedField>
    </>
  );
}

function AnimatedField({ show, children }) {
  return (
    <div
      className={`transition-all duration-900 ease-in-out overflow-hidden ${
        show ? 'max-h-11 opacity-100' : 'max-h-0 opacity-0'
    }`}>
      {children}
    </div>
  );
}

function InputField({ 
  icon: Icon, 
  type, 
  name, 
  value, 
  onChange, 
  placeholder, 
  showToggle = false, 
  onToggle, 
  toggleState 
}) {
  return (
    <div className="relative">
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Icon className="w-5 h-5 text-gray-500" />
      </div>
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full pl-12 ${showToggle ? 'pr-12' : 'pr-4'} py-2.5 bg-white/80 backdrop-blur-sm border border-pink-200 rounded-xl text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-transparent transition-all duration-300`}
      />
      {showToggle && (
        <button
          type="button"
          onClick={onToggle}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-500 hover:text-gray-700 transition-colors"
        >
          {toggleState ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
        </button>
      )}
    </div>
  );
}