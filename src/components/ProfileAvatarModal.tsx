import React, { useState, useRef, useEffect } from 'react';
import { Modal } from './Modal';
import { UserProfile } from '../types';
import { dbService } from '../services/dbService';
import { Camera, Upload, Trash2, Check, RefreshCw, AlertCircle, Image as ImageIcon } from 'lucide-react';

interface ProfileAvatarModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserProfile;
  onUpdate: (updatedUser: UserProfile) => void;
}

export const ProfileAvatarModal: React.FC<ProfileAvatarModalProps> = ({
  isOpen,
  onClose,
  user,
  onUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'upload' | 'camera'>('upload');
  const [previewImage, setPreviewImage] = useState<string | null>(user.avatar || null);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Stop camera stream on unmount or tab switch
  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  useEffect(() => {
    if (!isOpen) {
      stopCamera();
      setPreviewImage(user.avatar || null);
      setCameraError(null);
      setActiveTab('upload');
    }
  }, [isOpen, user.avatar]);

  useEffect(() => {
    if (activeTab === 'camera' && isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => {
      stopCamera();
    };
  }, [activeTab, isOpen]);

  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera access is not supported in this browser environment.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 640 }, height: { ideal: 640 }, facingMode: 'user' },
        audio: false
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err: any) {
      console.error('Camera error:', err);
      setIsCameraActive(false);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setCameraError('Camera permission was denied. Please allow camera access in your browser or select an image file instead.');
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        setCameraError('No camera device found on your system. Please upload a profile photo from your device.');
      } else {
        setCameraError(err.message || 'Unable to start camera video stream.');
      }
    }
  };

  const handleCapturePhoto = () => {
    if (!videoRef.current) return;
    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 400;
    canvas.height = video.videoHeight || 400;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      // Mirror horizontal for selfie camera feel
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
      setPreviewImage(dataUrl);
      stopCamera();
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setPreviewImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const compressAndResize = (src: string): Promise<string> => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.src = src;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 300;
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(src);
          return;
        }

        // Center square crop
        const minDim = Math.min(img.width, img.height);
        const sx = (img.width - minDim) / 2;
        const sy = (img.height - minDim) / 2;

        ctx.drawImage(img, sx, sy, minDim, minDim, 0, 0, size, size);
        resolve(canvas.toDataURL('image/jpeg', 0.85));
      };
      img.onerror = () => resolve(src);
    });
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      let finalAvatar = '';
      if (previewImage) {
        finalAvatar = await compressAndResize(previewImage);
      }

      const updated = await dbService.updateProfile(user.uid, { avatar: finalAvatar });
      onUpdate(updated);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to update profile picture');
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAvatar = async () => {
    if (!confirm('Are you sure you want to remove your profile picture?')) return;
    setIsSaving(true);
    try {
      const updated = await dbService.updateProfile(user.uid, { avatar: '' });
      onUpdate(updated);
      setPreviewImage(null);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Failed to remove profile picture');
    } finally {
      setIsSaving(false);
    }
  };

  const userInitials = user.name
    ? user.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    : 'U';

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Update Profile Picture" maxWidth="max-w-lg">
      <div className="space-y-6">
        {/* Navigation Tabs */}
        <div className="flex border-b border-gray-100 dark:border-gray-800">
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'upload'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload File
          </button>
          <button
            onClick={() => setActiveTab('camera')}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer ${
              activeTab === 'camera'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-gray-500 hover:text-gray-800 dark:hover:text-gray-300'
            }`}
          >
            <Camera className="w-4 h-4" />
            Take Photo
          </button>
        </div>

        {/* Tab 1: Upload File */}
        {activeTab === 'upload' && (
          <div className="space-y-4">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept="image/*"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className="border-2 border-dashed border-gray-200 dark:border-gray-800 hover:border-indigo-500 dark:hover:border-indigo-500 rounded-2xl p-8 text-center cursor-pointer bg-gray-50/50 dark:bg-slate-900/50 transition-colors group"
            >
              <div className="w-12 h-12 bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 rounded-full flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
                <ImageIcon className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-gray-800 dark:text-gray-200">
                Click to browse or drag & drop photo
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Supports JPG, PNG, WEBP files
              </p>
            </div>
          </div>
        )}

        {/* Tab 2: Camera Capture */}
        {activeTab === 'camera' && (
          <div className="space-y-4">
            {cameraError ? (
              <div className="p-4 bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/40 text-rose-700 dark:text-rose-400 text-xs rounded-xl flex items-start gap-3">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div className="space-y-2">
                  <p className="font-semibold">{cameraError}</p>
                  <button
                    onClick={startCamera}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-lg text-xs cursor-pointer"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Retry Camera
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden bg-black aspect-square max-w-xs mx-auto shadow-inner flex items-center justify-center">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className="w-full h-full object-cover transform -scale-x-100"
                />
                {!isCameraActive && (
                  <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 text-white text-xs font-semibold gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Starting camera stream...
                  </div>
                )}
                {isCameraActive && (
                  <button
                    type="button"
                    onClick={handleCapturePhoto}
                    className="absolute bottom-4 left-1/2 -translate-x-1/2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-full text-xs shadow-lg flex items-center gap-2 active:scale-95 transition-transform cursor-pointer"
                  >
                    <Camera className="w-4 h-4" /> Capture Photo
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* Selected Image Avatar Preview Box */}
        <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex flex-col items-center">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-3">
            Avatar Preview
          </span>
          <div className="relative group">
            <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-indigo-500/20 dark:border-indigo-500/30 shadow-md bg-gray-100 dark:bg-slate-800 flex items-center justify-center text-gray-400 dark:text-gray-500 font-extrabold text-2xl">
              {previewImage ? (
                <img
                  src={previewImage}
                  alt="Avatar Preview"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-3xl font-black text-indigo-600 dark:text-indigo-400">
                  {userInitials}
                </span>
              )}
            </div>
            {previewImage && (
              <button
                type="button"
                onClick={() => setPreviewImage(null)}
                title="Clear current photo"
                className="absolute -top-1 -right-1 p-1.5 bg-rose-500 text-white rounded-full shadow-md hover:bg-rose-600 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Modal Action Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
          <div>
            {user.avatar && (
              <button
                type="button"
                onClick={handleRemoveAvatar}
                disabled={isSaving}
                className="w-full sm:w-auto px-4 py-2 text-xs font-bold text-rose-600 hover:text-rose-700 dark:text-rose-400 dark:hover:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/30 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Remove Current Photo
              </button>
            )}
          </div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="px-4 py-2.5 text-xs font-bold text-gray-500 hover:text-gray-800 dark:hover:text-gray-200 transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isSaving || (!previewImage && !user.avatar)}
              className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-xs shadow-xs transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> Saving...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4" /> Save Profile Picture
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
