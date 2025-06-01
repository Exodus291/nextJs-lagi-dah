'use client'

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { User, Calendar, Mail, Edit3, Save, XCircle, UploadCloud, Camera, Building, UserCheck, Gift, Share2, Info } from 'lucide-react';
import { useUser } from '@/context/userContext'; // 1. Impor useUser
import api from '@/lib/api'; // Pastikan path ini benar


const ASSET_SERVER_URL = process.env.NEXT_PUBLIC_ASSET_SERVER_URL;

export default function ProfilePage() {
  // 2. Gunakan data dari context
  const { userData: contextProfileData, isLoading: contextIsLoading, error: contextError, refetchUserProfile } = useUser();
  // State lokal untuk profileData agar bisa diupdate optimistik atau jika ada perbedaan struktur, dan untuk form
  const [profileData, setProfileData] = useState(contextProfileData); // Inisialisasi dengan data context

  const [isEditingText, setIsEditingText] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    bio: '',
  });

  // State untuk loading dan error yang lebih granular
  const [textUpdateLoading, setTextUpdateLoading] = useState(false);
  const [textUpdateError, setTextUpdateError] = useState('');
  const [profilePicUpdateLoading, setProfilePicUpdateLoading] = useState(false);
  const [profilePicUpdateError, setProfilePicUpdateError] = useState('');
  const [coverUpdateLoading, setCoverUpdateLoading] = useState(false);
  const [coverUpdateError, setCoverUpdateError] = useState('');

  const [selectedFile, setSelectedFile] = useState(null); // Untuk menyimpan file yang dipilih sebelum diunggah
  const [imagePreview, setImagePreview] = useState(null);
  const [selectedCoverFile, setSelectedCoverFile] = useState(null); // Untuk menyimpan file cover yang dipilih
  const [coverImagePreview, setCoverImagePreview] = useState(null);

  const [showProfilePicOptions, setShowProfilePicOptions] = useState(false);
  // profilePictureMarkedForDeletion tidak lagi digunakan untuk menandai, aksi terjadi langsung
  const profilePicOptionsRef = useRef(null);

  useEffect(() => {
    // 3. Sinkronkan profileData lokal dengan data dari context ketika context berubah
    // Ini juga akan menangani pembaruan setelah refetchUserProfile dipanggil
    if (contextProfileData) {
      setProfileData(contextProfileData);
      if (!isEditingText) { // Hanya update form jika tidak sedang diedit, untuk menghindari kehilangan input pengguna
        setEditForm({
          name: contextProfileData.name || '',
          bio: contextProfileData.bio || '',
        });
      }
    }
  }, [contextProfileData, isEditingText]);

  const loading = contextIsLoading; // 4. Gunakan status loading dari context
  const error = contextError; // 4. Gunakan status error dari context

  const handleStartEditText = () => {
    if (profileData) {
      setEditForm({
        name: profileData.name || '',
        bio: profileData.bio || '',
      });
    }
    setIsEditingText(true);
    setTextUpdateError('');
    setProfilePicUpdateError('');
    setCoverUpdateError('');
  };

  const handleCancelAllChanges = () => {
    setIsEditingText(false);
    setTextUpdateError('');
    setProfilePicUpdateError('');
    setCoverUpdateError('');
    if (profileData) {
        setEditForm({
            name: profileData.name || '',
            bio: profileData.bio || '',
        });
    }
    setSelectedFile(null);
    setImagePreview(profileData?.profilePictureUrl ? resolvedProfilePictureUrl : "https://images.unsplash.com/photo-1494790108355-2616b612b786?w=150&h=150&fit=crop&crop=face"); // Kembalikan ke gambar server atau default
    setSelectedCoverFile(null);
    setCoverImagePreview(profileData?.backgroundProfilePictureUrl ? resolvedCoverImageUrl : "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&h=300&fit=crop"); // Kembalikan ke gambar server atau default
    setShowProfilePicOptions(false);
  };

  const autoSaveProfilePicture = async (fileToUpload) => {
    if (!fileToUpload) return;
    setProfilePicUpdateLoading(true);
    setProfilePicUpdateError('');
    const formData = new FormData();
    formData.append('profilePicture', fileToUpload);
    try {
      const response = await api.put('/auth/profile/picture', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data && response.data.user) {
        // setProfileData(prev => ({ ...prev, ...response.data.user })); // Tidak perlu lagi, context akan handle
        refetchUserProfile(); // 5. Panggil refetch dari context
        // Pratinjau sudah diatur oleh handleEditFormChange
      }
      setSelectedFile(null); // Kosongkan setelah berhasil diunggah
    } catch (err) {
      setProfilePicUpdateError(err.response?.data?.message || "Gagal unggah foto profil.");
      // Kembalikan pratinjau ke gambar sebelumnya jika gagal
      setImagePreview(profileData?.profilePictureUrl ? resolvedProfilePictureUrl : "https://images.unsplash.com/photo-1494790108355-2616b612b786?w=150&h=150&fit=crop&crop=face");
      setSelectedFile(null);
    } finally {
      setProfilePicUpdateLoading(false);
    }
  };

  const autoSaveCoverPicture = async (fileToUpload) => {
    if (!fileToUpload) return;
    setCoverUpdateLoading(true);
    setCoverUpdateError('');
    const formData = new FormData();
    formData.append('backgroundProfilePicture', fileToUpload);
    try {
      const response = await api.put('/auth/profile/background-cover', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      if (response.data && response.data.user) {
        // setProfileData(prev => ({ ...prev, ...response.data.user })); // Tidak perlu lagi
        refetchUserProfile(); // 5. Panggil refetch dari context
      }
      setSelectedCoverFile(null); // Kosongkan setelah berhasil diunggah
    } catch (err) {
      setCoverUpdateError(err.response?.data?.message || "Gagal unggah foto sampul.");
      setCoverImagePreview(profileData?.backgroundProfilePictureUrl ? resolvedCoverImageUrl : "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&h=300&fit=crop");
      setSelectedCoverFile(null);
    } finally {
      setCoverUpdateLoading(false);
    }
  };

  const handleEditFormChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "profilePictureFile") {
      if (files && files[0]) {
        const file = files[0];
        // setSelectedFile(file); // Tidak perlu set di sini, langsung kirim ke autoSave
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result); // Set pratinjau dulu
          autoSaveProfilePicture(file);   // Kemudian auto-save
        };
        reader.readAsDataURL(file);
      } else {
        // Jika pengguna membatalkan pemilihan file dari dialog
        // Tidak perlu melakukan apa-apa karena tidak ada file yang dipilih
      }
    } else if (name === "coverImageFile") {
      if (files && files[0]) {
        const file = files[0];
        // setSelectedCoverFile(file); // Tidak perlu set di sini
        const reader = new FileReader();
        reader.onloadend = () => {
          setCoverImagePreview(reader.result); // Set pratinjau dulu
          autoSaveCoverPicture(file);      // Kemudian auto-save
        };
        reader.readAsDataURL(file);
      } else {
        // Jika pengguna membatalkan pemilihan file dari dialog
      }
    } else {
      setEditForm(prev => ({ ...prev, [name]: value }));
    }
  };

  const toggleProfilePicOptions = (e) => {
    e.stopPropagation();
    setShowProfilePicOptions(prev => !prev);
  };

  const handleTriggerProfilePicUpload = () => {
    document.getElementById('profilePictureFile').click();
    setShowProfilePicOptions(false);
  };

  const handleDeleteOrClearProfilePic = async () => {
    // Jika ada imagePreview dari file yang baru dipilih tapi belum di-auto-save (seharusnya tidak terjadi jika auto-save instan)
    // atau jika pengguna ingin menghapus gambar yang ada di server.
    if (imagePreview && selectedFile) { // Ini berarti ada file lokal yang dipilih, tapi belum di-auto-save (jarang terjadi)
      setSelectedFile(null);
      setImagePreview(profileData?.profilePictureUrl ? resolvedProfilePictureUrl : "https://images.unsplash.com/photo-1494790108355-2616b612b786?w=150&h=150&fit=crop&crop=face");
    } else if (profileData?.profilePictureUrl && profileData.profilePictureUrl !== "https://images.unsplash.com/photo-1494790108355-2616b612b786?w=150&h=150&fit=crop&crop=face") {
      // Langsung hapus dari server
      setProfilePicUpdateLoading(true);
      setProfilePicUpdateError('');
      const deleteFormData = new FormData();
      deleteFormData.append('deleteProfilePicture', 'true');
      try {
        const response = await api.put('/auth/profile/picture', deleteFormData);
        if (response.data && response.data.user) {
          // setProfileData(prev => ({ ...prev, ...response.data.user })); // Tidak perlu lagi
          refetchUserProfile(); // 5. Panggil refetch dari context
           // Jika backend mengembalikan URL null atau tidak ada, frontend akan menampilkan default
          if (!response.data.user.profilePictureUrl) {
            setImagePreview("https://images.unsplash.com/photo-1494790108355-2616b612b786?w=150&h=150&fit=crop&crop=face");
          } else {
            setImagePreview(null); // Biarkan resolvedProfilePictureUrl yang menghandle dari profileData
          }
        }
      } catch (err) {
        setProfilePicUpdateError(err.response?.data?.message || "Gagal menghapus foto profil.");
      } finally {
        setProfilePicUpdateLoading(false);
      }
    }
    setShowProfilePicOptions(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      const toggleButton = document.getElementById('profile-pic-toggle-button');
      if (
        profilePicOptionsRef.current &&
        !profilePicOptionsRef.current.contains(event.target) &&
        toggleButton && !toggleButton.contains(event.target)
      ) {
        setShowProfilePicOptions(false);
      }
    };
    if (showProfilePicOptions) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfilePicOptions]);

  const handleSaveProfile = async () => {
    // Fungsi ini sekarang hanya untuk menyimpan data teks (nama, bio)
    setTextUpdateLoading(true);
    setTextUpdateError('');

    let anyTextChangesMade = false;
    const textPayload = {};

    if (isEditingText) {
      if (editForm.name !== (profileData?.name || '')) {
        textPayload.name = editForm.name;
        anyTextChangesMade = true;
      }
      if (editForm.bio !== (profileData?.bio || '')) {
        textPayload.bio = editForm.bio;
        anyTextChangesMade = true;
      }

      if (anyTextChangesMade) {
        try {
          const response = await api.put('/auth/profile', textPayload);
          if (response.data && response.data.user) {
            // setProfileData(prev => ({ ...prev, ...response.data.user })); // Tidak perlu lagi
            refetchUserProfile(); // 5. Panggil refetch dari context
          }
          setIsEditingText(false);
        } catch (err) {
          setTextUpdateError(err.response?.data?.message || "Gagal memperbarui info teks.");
        }
      } else {
        // Tidak ada perubahan teks, matikan mode edit
        setIsEditingText(false);
      }
    }

    if (!anyTextChangesMade && isEditingText) {
        // Jika mode edit aktif tapi tidak ada perubahan, cukup matikan mode edit
        setIsEditingText(false);
    } else if (!anyTextChangesMade && !isEditingText) {
        // Jika tidak dalam mode edit dan tidak ada perubahan (misalnya tombol diklik secara tidak sengaja)
        setTextUpdateError("Tidak ada perubahan teks untuk disimpan.");
    }
    
    setTextUpdateLoading(false);
  };
  
  const hasPendingTextChanges = useMemo(() => 
    isEditingText && profileData && (editForm.name !== (profileData.name || '') || editForm.bio !== (profileData.bio || '')),
  [isEditingText, editForm.name, editForm.bio, profileData]);

  const isCurrentProfilePicDefault = useMemo(() => {
    if (!profileData?.profilePictureUrl) return true;
    // Bandingkan dengan URL default yang Anda gunakan
    return profileData.profilePictureUrl === "https://images.unsplash.com/photo-1494790108355-2616b612b786?w=150&h=150&fit=crop&crop=face" || profileData.profilePictureUrl === null;
  }, [profileData?.profilePictureUrl]);

  const resolvedProfilePictureUrl = useMemo(() => {
    const defaultImageUrl = "https://images.unsplash.com/photo-1494790108355-2616b612b786?w=150&h=150&fit=crop&crop=face";
    
    if (imagePreview) return imagePreview; // Pratinjau dari file lokal yang baru dipilih (atau setelah gagal unggah)

    const path = profileData?.profilePictureUrl;
    if (!path || path === defaultImageUrl) { // Jika path null, undefined, atau sudah default
      return defaultImageUrl;
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    if (path.startsWith('/')) {
      let serverOrigin = '';
      if (ASSET_SERVER_URL) {
        serverOrigin = ASSET_SERVER_URL.replace(/\/$/, '');
      } else if (api?.defaults?.baseURL) {
        try {
          const apiUrlObject = new URL(api.defaults.baseURL);
          serverOrigin = apiUrlObject.origin;
        } catch (e) {
          console.warn("Could not parse api.defaults.baseURL to get origin:", api.defaults.baseURL, e);
          return path;
        }
      }
      if (serverOrigin) {
        return `${serverOrigin}${path}`;
      }
      return path;
    }
    return defaultImageUrl;
  }, [profileData?.profilePictureUrl, ASSET_SERVER_URL, imagePreview]);

  const resolvedCoverImageUrl = useMemo(() => {
    const defaultCoverUrl = "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&h=300&fit=crop";
    
    if (coverImagePreview) return coverImagePreview; // Pratinjau dari file lokal

    const path = profileData?.backgroundProfilePictureUrl;
    if (!path) {
      return defaultCoverUrl;
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    if (path.startsWith('/')) {
      let serverOrigin = '';
      if (ASSET_SERVER_URL) {
        serverOrigin = ASSET_SERVER_URL.replace(/\/$/, '');
      } else if (api?.defaults?.baseURL) {
        try {
          const apiUrlObject = new URL(api.defaults.baseURL);
          serverOrigin = apiUrlObject.origin;
        } catch (e) {
          console.warn("Could not parse api.defaults.baseURL for cover image:", api.defaults.baseURL, e);
          return path;
        }
      }
      if (serverOrigin) {
        return `${serverOrigin}${path}`;
      }
      return path;
    }
    return defaultCoverUrl;
  }, [profileData?.backgroundProfilePictureUrl, ASSET_SERVER_URL, coverImagePreview]);


return (
  <div className="min-h-screen bg-gradient-to-br from-rose-50 via-pink-50 to-purple-100 py-10 px-4 sm:px-6 lg:px-8">
    {loading && (
      <div className="flex justify-center items-center min-h-[calc(100vh-150px)]">
        <div className="text-center">
          <svg className="animate-spin h-10 w-10 text-pink-500 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="text-pink-600 text-lg mt-4">Memuat profil Anda...</p>
        </div>
      </div>
    )}

    {error && !loading && (
      <div className="max-w-2xl mx-auto p-6 text-center">
        <div className="bg-red-50 p-6 rounded-xl shadow-md border border-red-200">
          <XCircle className="w-12 h-12 text-red-400 mx-auto mb-3" />
          <p className="text-red-600 font-semibold text-lg">Oops! Terjadi Kesalahan</p>
          <p className="text-red-500 mt-1">{error}</p>
        </div>
      </div>
    )}

    {!loading && !error && profileData && (
      <div className="max-w-3xl mx-auto">
        {/* Profile Header Section */}
        <div className="relative rounded-t-2xl shadow-xl overflow-hidden">
          {/* Cover Image */}
          <div className="relative group h-52 md:h-64">
          <img
            src={coverImagePreview || resolvedCoverImageUrl}
            alt="Cover"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          {coverUpdateLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
            </div>
          )}
          <label
            htmlFor="coverImageFile"
            className={`absolute inset-0 flex flex-col items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-all duration-300 cursor-pointer ${coverUpdateLoading ? '!opacity-100' : ''}`}
            aria-label="Ganti foto sampul"
          >
            {!coverUpdateLoading && <UploadCloud className="w-10 h-10 text-white mb-2" />}
            {!coverUpdateLoading && <span className="text-md font-semibold text-white">Ganti Sampul</span>}
            <input
              id="coverImageFile"
              type="file"
              name="coverImageFile"
              accept="image/png, image/jpeg, image/gif"
              onChange={handleEditFormChange}
              className="hidden"
              disabled={coverUpdateLoading}
            />
          </label>
          </div>

          {/* Avatar, Name, Role - Positioned below cover, slightly overlapping */}
          <div className="relative px-6 pb-6 bg-white rounded-b-2xl shadow-md">
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 sm:-mt-20">
            {/* Avatar */}
            <div className="relative mb-4 sm:mb-0 sm:mr-6 flex-shrink-0">
                <img
                  src={resolvedProfilePictureUrl}
                  alt={profileData.name || "Foto Profil"}
                  className="w-28 h-28 md:w-32 md:h-32 rounded-full border-4 border-white object-cover shadow-xl"
                />
                {profilePicUpdateLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 rounded-full">
                        <svg className="animate-spin h-8 w-8 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                    </div>
                )}
                <input
                  id="profilePictureFile"
                  type="file"
                  name="profilePictureFile"
                  accept="image/png, image/jpeg, image/gif"
                  onChange={handleEditFormChange}
                  className="hidden"
                  disabled={profilePicUpdateLoading}
                />
                <button
                  onClick={toggleProfilePicOptions}
                  id="profile-pic-toggle-button"
                  className="absolute bottom-1 right-1 bg-pink-500 text-white p-2.5 rounded-full shadow-md hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-300 focus:ring-offset-2 focus:ring-offset-white transition-colors"
                  aria-label="Ubah foto profil"
                  disabled={profilePicUpdateLoading}
                >
                  <Camera className="w-4 h-4" />
                </button>
                {showProfilePicOptions && (
                  <div ref={profilePicOptionsRef} className="absolute bottom-full right-0 mb-2 w-48 bg-white rounded-md shadow-xl z-20 border border-gray-200 origin-bottom-right">
                    <button
                      onClick={handleTriggerProfilePicUpload}
                      className="w-full text-left px-4 py-2.5 text-sm text-gray-700 hover:bg-pink-50 hover:text-pink-600 flex items-center rounded-t-md"
                      disabled={profilePicUpdateLoading}
                    >
                      <UploadCloud className="w-4 h-4 mr-2" /> Ganti Foto
                    </button>
                    {(!isCurrentProfilePicDefault || imagePreview !== resolvedProfilePictureUrl) && ( // Tampilkan jika bukan default ATAU ada pratinjau lokal yang berbeda
                      <button
                        onClick={handleDeleteOrClearProfilePic}
                        className="w-full text-left px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 flex items-center rounded-b-md"
                        disabled={profilePicUpdateLoading}
                      >
                        <XCircle className="w-4 h-4 mr-2" /> 
                        {selectedFile ? "Batalkan Pilihan Lokal" : "Hapus Foto"}
                      </button>
                    )}
                  </div>
                )}
            </div>
            {/* Name, Role, and Edit Button */}
            <div className="flex-grow text-center sm:text-left">
              <h1 className="text-2xl sm:text-3xl font-bold text-pink-700">{profileData.name || "Nama Belum Diatur"}</h1>
              <p className="text-sm text-gray-500 capitalize">{profileData.role || "Pengguna"}</p>
            </div>
          </div>
        </div>
        </div>

        <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-xl border border-pink-200/60 mt-8">
          {/* Edit Name & Bio Section */}
          <div className="mb-8 pb-8 border-b border-pink-100">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-pink-700">Detail Profil</h2>
              {!isEditingText && (
                <button
                  onClick={handleStartEditText}
                  className="flex items-center gap-1.5 text-sm text-pink-600 hover:text-pink-800 font-medium py-1 px-3 rounded-md hover:bg-pink-100 transition-colors"
                  disabled={profilePicUpdateLoading || coverUpdateLoading} // Disable jika gambar sedang diunggah
                >
                  <Edit3 className="w-4 h-4" /> Edit
                </button>
              )}
            </div>
            {isEditingText ? (
              <div className="space-y-4">
                <div>
                  <label htmlFor="name-edit" className="block text-sm font-medium text-pink-700 mb-1">Nama</label>
                  <input
                    id="name-edit"
                    type="text"
                    name="name"
                    value={editForm.name}
                    onChange={handleEditFormChange}
                    className="w-full text-lg border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                    placeholder="Nama Anda"
                  />
                </div>
                <div>
                  <label htmlFor="bio-edit" className="block text-sm font-medium text-pink-700 mb-1">Tentang Saya</label>
                  <textarea
                    id="bio-edit"
                    name="bio"
                    value={editForm.bio}
                    onChange={handleEditFormChange}
                    rows={4}
                    className="w-full text-sm border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-pink-500 focus:border-pink-500 transition-colors"
                    placeholder="Ceritakan sedikit tentang diri Anda..."
                  />
                </div>
                <div className="flex justify-end gap-3 pt-2">
                  <button
                    onClick={handleSaveProfile}
                    className="flex items-center justify-center gap-2 bg-pink-500 text-white px-6 py-2.5 rounded-lg shadow-md hover:bg-pink-600 disabled:opacity-70 transition-colors"
                    disabled={textUpdateLoading || profilePicUpdateLoading || coverUpdateLoading || !hasPendingTextChanges}
                  >
                    <Save className="w-5 h-5" /> {textUpdateLoading ? "Menyimpan..." : "Simpan Teks"}
                  </button>
                  <button
                    onClick={handleCancelAllChanges}
                    className="flex items-center justify-center gap-2 bg-gray-200 text-gray-700 px-6 py-2.5 rounded-lg hover:bg-gray-300 transition-colors"
                    disabled={textUpdateLoading || profilePicUpdateLoading || coverUpdateLoading}
                  >
                    <XCircle className="w-5 h-5" /> Batal
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-pink-600 font-medium">Nama</p>
                  <p className="text-md text-gray-800">{profileData.name || "-"}</p>
                </div>
                <div>
                  <p className="text-xs text-pink-600 font-medium">Tentang Saya</p>
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {profileData.bio || "Belum ada bio."}
                  </p>
                </div>
              </div>
            )}
          </div>

          {(textUpdateError || profilePicUpdateError || coverUpdateError) && (
            <div className="space-y-2 mb-6">
              {textUpdateError && <p className="text-red-600 bg-red-100 p-3 rounded-lg text-sm border border-red-300 flex items-center gap-2"><Info className="w-5 h-5"/>{textUpdateError}</p>}
              {profilePicUpdateError && <p className="text-red-600 bg-red-100 p-3 rounded-lg text-sm border border-red-300 flex items-center gap-2"><Info className="w-5 h-5"/>{profilePicUpdateError}</p>}
              {coverUpdateError && <p className="text-red-600 bg-red-100 p-3 rounded-lg text-sm border border-red-300 flex items-center gap-2"><Info className="w-5 h-5"/>{coverUpdateError}</p>}
            </div>
          )}

          {/* Additional Profile Details */}
          <div>
            <h2 className="text-xl font-semibold text-pink-700 mb-4">Informasi Akun & Referral</h2>
            <div className="space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                {/* Kolom Kiri Info Akun */}
                <div className="space-y-4">
                  <div className="flex items-start">
                    <Mail className="w-5 h-5 text-pink-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-pink-600 font-medium">Email</p>
                      <span className="text-gray-700">{profileData.email}</span>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <UserCheck className="w-5 h-5 text-pink-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-pink-600 font-medium">Peran</p>
                      <span className="text-gray-700 capitalize">{profileData.role || "Peran tidak diketahui"}</span>
                    </div>
                  </div>
                </div>
                {/* Kolom Kanan Info Akun & Referral */}
                <div className="space-y-4">
                  {profileData.store && (
                     <div className="flex items-start">
                      <Building className="w-5 h-5 text-pink-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-xs text-pink-600 font-medium">Toko</p>
                        <span className="text-gray-700">{profileData.store}</span>
                      </div>
                    </div>
                  )}
                  <div className="flex items-start">
                    <Calendar className="w-5 h-5 text-pink-500 mr-3 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-pink-600 font-medium">Bergabung</p>
                      <span className="text-gray-700">{new Date(profileData.createdAt).toLocaleDateString('id-ID', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </div>
                  </div>
                </div>
              </div>
              {/* Info Referral di bawah jika ada */}
              {(profileData.referralCode || profileData.referredByCode) && (
                <div className="pt-4 mt-4 border-t border-pink-100">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4">
                    {profileData.referralCode && (
                      <div className="flex items-start">
                        <Share2 className="w-5 h-5 text-pink-500 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-pink-600 font-medium">Kode Referral Anda</p>
                          <strong className="text-gray-700">{profileData.referralCode}</strong>
                        </div>
                      </div>
                    )}
                    {profileData.referredByCode && (
                      <div className="flex items-start">
                        <Gift className="w-5 h-5 text-pink-500 mr-3 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-xs text-pink-600 font-medium">Direferensikan oleh</p>
                          <span className="text-gray-700">{profileData.referredByCode}</span>
                        </div>
                      </div>
                    )}
                  </div>
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
