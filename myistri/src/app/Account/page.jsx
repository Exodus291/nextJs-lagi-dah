'use client'

import React, { useState, useEffect, useMemo } from 'react';
import { User, Calendar, Mail, Phone, Edit3, Briefcase, Shield, Tag, Users, Save, XCircle, Image as ImageIcon, UploadCloud } from 'lucide-react';
import api from '@/lib/api'; // Pastikan path ini benar

// Define the asset server URL from environment variables.
// This is where your images are hosted if not served directly by Next.js from the /public folder.
// Example: NEXT_PUBLIC_ASSET_SERVER_URL=http://localhost:3001 if your API on port 3001 serves /uploads/*
const ASSET_SERVER_URL = process.env.NEXT_PUBLIC_ASSET_SERVER_URL;

export default function ProfilePage() {
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
  });
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        setError('');
        const response = await api.get('/auth/profile'); // Menggunakan endpoint /profile
        const userData = response.data.user;
        setProfileData(userData);
        // Initialize edit form when profile data is fetched
        setEditForm({
          name: userData.name || '',
          bio: userData.bio || '',
        });
      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(err.response?.data?.message || "Gagal memuat data profil. Silakan coba lagi.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleStartEdit = () => {
    if (profileData) {
      setEditForm({
        name: profileData.name || '',
        bio: profileData.bio || '',
      });
    }
    setIsEditing(true);
    setSelectedFile(null);
    setImagePreview(null);
    setUpdateError('');
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUpdateError('');
    // Optionally reset editForm to profileData if changes were made but not saved
    // Also clear any selected file and its preview
    setSelectedFile(null);
    setImagePreview(null);
    if (profileData) {
        setEditForm({
            name: profileData.name || '',
            bio: profileData.bio || '',
        });
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePictureFile") {
      if (files && files[0]) {
        const file = files[0];
        setSelectedFile(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        setSelectedFile(null);
        setImagePreview(null);
      }
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveProfile = async () => {
    setUpdateLoading(true);
    setUpdateError('');
    
    const formData = new FormData();
    formData.append('name', editForm.name);
    formData.append('bio', editForm.bio);
    if (selectedFile) {
      formData.append('profilePicture', selectedFile); // Backend should expect 'profilePicture' or similar
    }

    try {
      // The API endpoint must be able to handle multipart/form-data
      const response = await api.put('/auth/profile', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setProfileData(response.data.user);
      setIsEditing(false);
      setSelectedFile(null); // Clear selected file after successful upload
      setImagePreview(null); // Clear preview
    } catch (err) {
      setUpdateError(err.response?.data?.message || "Gagal memperbarui profil.");
    } finally {
      setUpdateLoading(false);
    }
  };

  const resolvedProfilePictureUrl = useMemo(() => {
    const defaultImageUrl = "https://images.unsplash.com/photo-1494790108355-2616b612b786?w=150&h=150&fit=crop&crop=face"; // Default fallback
    if (!profileData?.profilePictureUrl) {
      return defaultImageUrl;
    }

    const path = profileData.profilePictureUrl;

    // If it's already an absolute URL (starts with http, https)
    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    // Path is relative, e.g., "/uploads/profile_pictures/image.jpg"
    // We need to prepend the backend server's origin.
    if (path.startsWith('/')) {
      let serverOrigin = '';
      if (ASSET_SERVER_URL) {
        serverOrigin = ASSET_SERVER_URL.replace(/\/$/, ''); // Remove trailing slash if any
      } else if (api?.defaults?.baseURL) {
        try {
          const apiUrlObject = new URL(api.defaults.baseURL);
          serverOrigin = apiUrlObject.origin; // e.g., "http://localhost:3001"
        } catch (e) {
          console.warn("Could not parse api.defaults.baseURL to get origin:", api.defaults.baseURL, e);
          // Fallback: if parsing fails, and ASSET_SERVER_URL is not set, the path will be treated as relative to the frontend.
          return path; // This might lead to 404s if frontend and backend are on different origins.
        }
      }

      if (serverOrigin) {
        return `${serverOrigin}${path}`;
      } else {
        console.warn("Profile picture URL cannot be fully resolved. ASSET_SERVER_URL is not set, and API base URL is unavailable or unparsable. Path being used (relative to frontend domain):", path);
        return path; // Fallback to path relative to frontend domain
      }
    }

    console.warn(`Profile picture URL is in an unexpected format: ${path}. Using default image.`);
    return defaultImageUrl; // Fallback to default if path format is strange or not starting with '/'
  }, [profileData?.profilePictureUrl, ASSET_SERVER_URL]); // Added ASSET_SERVER_URL to dependencies

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-rose-50 to-pink-100">
      {loading && (
        <div className="flex justify-center items-center h-[calc(100vh-100px)]">
          <p className="text-pink-500 text-lg">Memuat profil...</p>
        </div>
      )}

      {error && !loading && (
        <div className="max-w-4xl mx-auto p-6 text-center">
          <p className="text-red-500 bg-red-100 p-4 rounded-lg">{error}</p>
        </div>
      )}

      {!loading && !error && profileData && (
      <div className="max-w-4xl mx-auto pt-8"> {/* Added pt-8 for spacing if navbar is sticky */}
        {/* Cover Image */}
        <div className="relative h-48 md:h-64 bg-gradient-to-r from-pink-300 to-rose-300 overflow-hidden">
          <img 
            src={profileData.coverImage || "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&h=300&fit=crop"} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>

        {/* Profile Info */}
        <div className="bg-white rounded-t-3xl -mt-6 relative z-10 px-6 pt-6 pb-8 shadow-lg"> {/* Increased pb-8 for more space */}
          <div className="flex flex-col md:flex-row md:items-end md:justify-between">
            <div className="flex flex-col md:flex-row md:items-end gap-4">
              {/* Avatar */}
              <div className="relative -mt-16 md:-mt-20">
                {isEditing ? (
                  <img
                    src={imagePreview || resolvedProfilePictureUrl}
                    alt="Preview"
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                ) : (
                  <img 
                    src={resolvedProfilePictureUrl} 
                    alt={profileData.name || "Foto Profil"}
                    className="w-24 h-24 md:w-32 md:h-32 rounded-full border-4 border-white object-cover shadow-lg"
                  />
                )}
              </div>

              {/* Name and Bio */}
              <div className="flex-1">
                {isEditing ? (
                  <>
                    <input
                      type="text"
                      name="name"
                      value={editForm.name}
                      onChange={handleEditFormChange}
                      placeholder="Nama Lengkap"
                      className="text-2xl font-bold text-gray-800 bg-pink-50 border border-pink-300 rounded-md px-2 py-1 w-full mb-2"
                    />
                    <p className="text-gray-600 mb-2">{profileData.email} (Email tidak dapat diubah)</p>
                    <textarea
                      name="bio"
                      value={editForm.bio}
                      onChange={handleEditFormChange}
                      placeholder="Bio singkat tentang Anda..."
                      className="text-gray-700 whitespace-pre-line text-sm bg-pink-50 border border-pink-300 rounded-md px-2 py-1 w-full h-24 resize-none"
                    />
                    <label htmlFor="profilePictureFile" className="block text-sm font-medium text-gray-700 mt-3 mb-1">Ganti Foto Profil:</label>
                    <div className="flex items-center gap-2 p-2 border border-pink-300 rounded-md bg-pink-50 hover:border-pink-400">
                        <UploadCloud className="w-5 h-5 text-pink-500" />
                        <input
                          id="profilePictureFile"
                          type="file"
                          name="profilePictureFile"
                          accept="image/png, image/jpeg, image/gif"
                          onChange={handleEditFormChange}
                          className="text-sm text-gray-700 file:mr-2 file:py-1 file:px-2
                                    file:rounded-md file:border-0 file:text-sm file:font-semibold
                                    file:bg-pink-100 file:text-pink-700 hover:file:bg-pink-200 cursor-pointer"
                        />
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="text-2xl font-bold text-gray-800">{profileData.name}</h2>
                    <p className="text-gray-600 mb-2">{profileData.email}</p>
                    <p className="text-gray-700 whitespace-pre-line text-sm">{profileData.bio}</p>
                  </>
                )}
              </div>
            </div>
            {/* Edit/Save/Cancel Buttons */}
            <div className="mt-4 md:mt-0">
              {isEditing ? (
                <div className="flex gap-2">
                  <button onClick={handleSaveProfile} disabled={updateLoading} className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:bg-gray-300 flex items-center">
                    <Save className="w-4 h-4 mr-2"/> {updateLoading ? 'Menyimpan...' : 'Simpan'}
                  </button>
                  <button onClick={handleCancelEdit} className="px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 flex items-center">
                    <XCircle className="w-4 h-4 mr-2"/> Batal
                  </button>
                </div>
              ) : (
                <button onClick={handleStartEdit} className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 flex items-center">
                  <Edit3 className="w-4 h-4 mr-2"/> Edit Profil
                </button>
              )}
            </div>
          </div>
          {isEditing && updateError && <p className="text-red-500 text-sm mt-2">{updateError}</p>}

          {/* Profile Details */}
          <div className="flex flex-wrap gap-x-6 gap-y-3 mt-6 text-sm text-gray-600"> {/* Adjusted gap */}
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>Bergabung {new Date(profileData.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long' })}</span>
            </div>
            <div className="flex items-center gap-1">
              <Shield className="w-4 h-4" />
              <span>Peran: <span className="font-semibold">{profileData.role}</span></span>
            </div>
            {profileData.role === 'OWNER' && profileData.store && (
              <div className="flex items-center gap-1">
                <Briefcase className="w-4 h-4" />
                <span>Toko: <span className="font-semibold">{profileData.store}</span></span>
              </div>
            )}
            {profileData.referralCode && (
              <div className="flex items-center gap-1">
                <Tag className="w-4 h-4" />
                <span>Kode Referral: <span className="font-semibold">{profileData.referralCode}</span></span>
              </div>
            )}
            {profileData.referredByCode && (
              <div className="flex items-center gap-1">
                <Users className="w-4 h-4" />
                <span>Direferensikan oleh: <span className="font-semibold">{profileData.referredByCode}</span></span>
              </div>
            )}
          </div>

          {/* Contact Info */}
          <div className="mt-6 pt-6 border-t border-gray-100">
            <h3 className="font-bold text-gray-800 mb-3 text-lg">Informasi Kontak</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-pink-500" /> 
                <span className="text-gray-700">{profileData.email}</span>
              </div>
              {profileData.phone && (
                <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-pink-500" /> 
                  <span className="text-gray-700">{profileData.phone}</span>
                </div>
              )}
              {!profileData.phone && (
                 <div className="flex items-center gap-3">
                  <Phone className="w-5 h-5 text-gray-400" /> 
                  <span className="text-gray-500 italic">Nomor telepon tidak tersedia</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
