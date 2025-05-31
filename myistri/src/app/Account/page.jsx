'use client'

import React, { useState } from 'react';
import { User, MapPin, Calendar, Mail, Phone, Camera, Edit3, Heart, MessageCircle, Share2, Settings } from 'lucide-react';

export default function ProfilePage() {
  const [isFollowing, setIsFollowing] = useState(false);
  const [activeTab, setActiveTab] = useState('posts');

  const profileData = {
    name: "Sarah Johnson",
    username: "@sarahjohnson",
    bio: "Digital Creator & UI/UX Designer 🎨\nLiving life in full color 💕\nCoffee enthusiast ☕ | Travel lover ✈️",
    joinDate: "Bergabung Maret 2022",
    posts: "324",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    coverImage: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&h=300&fit=crop",
    posisi: ''
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
      {/* Header */}
      <div className="bg-gradient-to-r from-pink-400 to-rose-400 text-white p-4 sticky top-0 z-50 backdrop-blur-sm bg-opacity-90">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <h1 className="text-xl font-bold">Profil</h1>
          <div className="flex items-center gap-4">
            <Share2 className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform" />
            <Settings className="w-5 h-5 cursor-pointer hover:scale-110 transition-transform" />
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto">
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-pink-300 to-rose-300 overflow-hidden">
          <img 
            src={profileData.coverImage} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          <button className="absolute bottom-4 right-4 bg-white/20 backdrop-blur-sm rounded-full p-2 text-white hover:bg-white/30 transition-colors">
            <Camera className="w-4 h-4" />
          </button>
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-t-3xl -mt-6 relative z-10 px-6 pt-6 pb-4 shadow-lg">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              {/* Avatar */}
              <div className="relative -mt-16 md:-mt-20">
                <img 
                  src={profileData.avatar} 
                  alt="Profile" 
                  className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white object-cover shadow-lg"
                />
                <button className="absolute bottom-0 right-0 bg-gradient-to-r from-pink-400 to-rose-400 rounded-full p-2 text-white shadow-lg hover:scale-110 transition-transform">
                  <Edit3 className="w-3 h-3" />
                </button>
              </div>

              {/* Name and Bio */}
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-800">{profileData.name}</h2>
                <p className="text-gray-600 mb-2">{profileData.username}</p>
                <p className="text-gray-700 whitespace-pre-line text-sm">{profileData.bio}</p>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-2 mt-4 md:mt-0">
              <button 
                onClick={() => setIsFollowing(!isFollowing)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  isFollowing 
                    ? 'bg-gray-200 text-gray-700 hover:bg-gray-300' 
                    : 'bg-gradient-to-r from-pink-400 to-rose-400 text-white hover:from-pink-500 hover:to-rose-500 hover:scale-105'
                }`}
              >
                {isFollowing ? 'Mengikuti' : 'Ikuti'}
              </button>
              <button className="p-2 border border-gray-300 rounded-full hover:bg-gray-50 transition-colors">
                <MessageCircle className="w-5 h-5 text-gray-600" />
              </button>
            </div>
          </div>

          {/* Profile Details */}
          <div className="flex flex-wrap gap-4 mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              <span>{profileData.location}</span>
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{profileData.joinDate}</span>
            </div>
          </div>

          {/* Stats */}
          <div className="flex gap-6 mt-4 pt-4 border-t border-gray-100">
            <div className="text-center">
              <div className="font-bold text-lg text-gray-800">{profileData.posts}</div>
              <div className="text-sm text-gray-600">Postingan</div>
            </div>
            <div className="text-center cursor-pointer hover:scale-105 transition-transform">
              <div className="font-bold text-lg text-gray-800">{profileData.followers}</div>
              <div className="text-sm text-gray-600">Pengikut</div>
            </div>
            <div className="text-center cursor-pointer hover:scale-105 transition-transform">
              <div className="font-bold text-lg text-gray-800">{profileData.following}</div>
              <div className="text-sm text-gray-600">Mengikuti</div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-t border-gray-100 sticky top-16 z-40">
          <div className="flex">
            {['posts', 'about', 'media'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 text-center font-medium transition-colors ${
                  activeTab === tab
                    ? 'text-pink-500 border-b-2 border-pink-400'
                    : 'text-gray-600 hover:text-pink-400'
                }`}
              >
                {tab === 'posts' && 'Postingan'}
                {tab === 'about' && 'Tentang'}
                {tab === 'media' && 'Media'}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="bg-white min-h-screen p-6">
          {activeTab === 'posts' && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {posts.map((post) => (
                <div key={post.id} className="relative group cursor-pointer overflow-hidden rounded-lg aspect-square">
                  <img 
                    src={post.image} 
                    alt={`Post ${post.id}`}
                    className="w-full h-full object-cover transition-transform group-hover:scale-110"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="flex items-center gap-4 text-white">
                      <div className="flex items-center gap-1">
                        <Heart className="w-5 h-5" />
                        <span>{post.likes}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <MessageCircle className="w-5 h-5" />
                        <span>{post.comments}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-pink-50 to-rose-50 p-6 rounded-xl">
                <h3 className="font-bold text-gray-800 mb-4">Informasi Kontak</h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <Mail className="w-5 h-5 text-pink-500" />
                    <span className="text-gray-700">sarah.johnson@email.com</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-5 h-5 text-pink-500" />
                    <span className="text-gray-700">+62 812-3456-7890</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-gradient-to-r from-rose-50 to-pink-50 p-6 rounded-xl">
                <h3 className="font-bold text-gray-800 mb-4">Tentang Saya</h3>
                <p className="text-gray-700 leading-relaxed">
                  Saya adalah seorang desainer UI/UX yang passionate dalam menciptakan pengalaman digital yang menarik dan fungsional. 
                  Dengan lebih dari 3 tahun pengalaman di industri kreatif, saya selalu berusaha untuk memberikan solusi desain 
                  yang inovatif dan user-friendly.
                </p>
              </div>
            </div>
          )}

          {activeTab === 'media' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {posts.slice(0, 4).map((post) => (
                <div key={post.id} className="bg-gradient-to-r from-pink-50 to-rose-50 p-4 rounded-xl">
                  <img 
                    src={post.image} 
                    alt={`Media ${post.id}`}
                    className="w-full h-48 object-cover rounded-lg mb-3"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Heart className="w-4 h-4 text-pink-500" />
                        {post.likes}
                      </span>
                      <span className="flex items-center gap-1">
                        <MessageCircle className="w-4 h-4 text-pink-500" />
                        {post.comments}
                      </span>
                    </div>
                    <span>2 hari lalu</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}