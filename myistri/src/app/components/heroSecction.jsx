'use client'

import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Briefcase, User } from 'lucide-react';

const LOGIN_MODE = 'login';
const REGISTER_OWNER_MODE = 'register_owner';
const REGISTER_STAFF_MODE = 'register_staff';

export default function HeroSection({ mode }) {
  return (
    <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
      {/* Background Image */}
      <img 
        src="/91108963_1.jpg" 
        alt="Background" 
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-11/12 h-11/12 object-cover opacity-75 rounded-2xl shadow-lg" 
      />
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-pink-300/20 to-rose-200/20 z-1"></div>
      
      {/* Decorative Elements */}
      <DecorativeElements />
      
      {/* Content */}
      <div className="relative z-20 flex flex-col justify-center items-start p-16 text-gray-800 max-w-lg">
        <AnimatePresence mode="wait">
          {mode === LOGIN_MODE && (
            <HeroContent
              key="login"
              icon={Heart}
              title="Kenapa Harus Elaina?"
              description="Karena Elaina itu wanita yang Cantik dan Wangyyy 😘😘😘😍😍"
            />
          )}
          {mode === REGISTER_OWNER_MODE && (
            <HeroContent
              key="register_owner"
              icon={Briefcase}
              title="Become an Owner"
              description="Start managing your business with Elaina POS. Register as an owner today!"
            />
          )}
          {mode === REGISTER_STAFF_MODE && (
            <HeroContent
              key="register_staff"
              icon={User}
              title="Join Elaina's World!"
              description="Register as staff and be part of the amazing team powered by Elaina."
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function HeroContent({ icon: Icon, title, description }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: 'blur(5px)' }}
      animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: -20, filter: 'blur(5px)' }}
      transition={{ duration: 0.4, ease: "easeInOut" }}
    >
      <div className="w-16 h-16 bg-gradient-to-r from-pink-400 to-rose-400 rounded-2xl flex items-center justify-center mb-6 shadow-lg">
        <Icon className="w-8 h-8 text-white" />
      </div>
      <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-gray-800 to-pink-600 bg-clip-text text-transparent">
        {title}
      </h1>
      <p className="text-xl text-gray-600 leading-relaxed">
        {description}
      </p>
    </motion.div>
  );
}

function DecorativeElements() {
  return (
    <>
      <div className="absolute top-20 left-20 w-32 h-32 bg-pink-200/40 rounded-full blur-xl animate-pulse z-5"></div>
      <div className="absolute bottom-40 right-32 w-24 h-24 bg-rose-200/50 rounded-full blur-lg animate-bounce z-5"></div>
      <div className="absolute top-1/2 left-1/3 w-16 h-16 bg-pink-300/40 rounded-full blur-md animate-pulse delay-1000 z-5"></div>
      <div className="absolute top-10 right-16 w-12 h-12 bg-purple-300/30 rounded-full blur-md animate-pulse [animation-duration:1.8s] z-5"></div>
      <div className="absolute bottom-16 left-1/4 w-20 h-20 bg-pink-200/20 rounded-xl blur-lg animate-ping opacity-60 z-5"></div>
      <div className="absolute top-2/3 right-1/2 w-14 h-14 bg-rose-100/40 rounded-full blur-sm animate-bounce [animation-duration:3.5s] z-5"></div>
    </>
  );
}