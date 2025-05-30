'use client'

const LOGIN_MODE = 'login';
const REGISTER_OWNER_MODE = 'register_owner';
const REGISTER_STAFF_MODE = 'register_staff';

export default function SwitchUserButton({ mode, onModeSwitch }) {
  return (
    <div className="text-center text-sm text-gray-600 mt-6">
      {mode === LOGIN_MODE && (
        <>
          Don't have an account?{' '}
          <button 
            onClick={() => onModeSwitch(REGISTER_OWNER_MODE)} 
            className="font-semibold text-pink-600 hover:text-pink-700"
          >
            Register as Owner
          </button>
          {' or '}
          <button 
            onClick={() => onModeSwitch(REGISTER_STAFF_MODE)} 
            className="font-semibold text-pink-600 hover:text-pink-700"
          >
            Register as Staff
          </button>
        </>
      )}
      
      {mode === REGISTER_OWNER_MODE && (
        <>
          Already have an account?{' '}
          <button 
            onClick={() => onModeSwitch(LOGIN_MODE)} 
            className="font-semibold text-pink-600 hover:text-pink-700"
          >
            Sign In
          </button>
          <br /> Or{' '}
          <button 
            onClick={() => onModeSwitch(REGISTER_STAFF_MODE)} 
            className="font-semibold text-pink-600 hover:text-pink-700"
          >
            Register as Staff
          </button>
        </>
      )}
      
      {mode === REGISTER_STAFF_MODE && (
        <>
          Already have an account?{' '}
          <button 
            onClick={() => onModeSwitch(LOGIN_MODE)} 
            className="font-semibold text-pink-600 hover:text-pink-700"
          >
            Sign In
          </button>
          <br /> Or{' '}
          <button 
            onClick={() => onModeSwitch(REGISTER_OWNER_MODE)} 
            className="font-semibold text-pink-600 hover:text-pink-700"
          >
            Register as Owner
          </button>
        </>
      )}
    </div>
  );
}