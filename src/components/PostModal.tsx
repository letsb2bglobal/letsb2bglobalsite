'use client';

import React, { useState } from 'react';
import { useAuth } from '@/components/ProtectedRoute';
import { createPost, type CreatePostData } from '@/lib/posts';
import { useToast } from '@/components/Toast';

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

export default function PostModal({ isOpen, onClose, onPostCreated }: PostModalProps) {
  const user = useAuth();
  const { showToast } = useToast();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    destinationCity: '',
    roleType: 'seller' as 'seller' | 'buyer',
    intentType: 'demand' as 'demand' | 'offer',
  });
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    setSubmitting(true);

    try {
      const postData: CreatePostData = {
        userId: user.id,
        roleType: formData.roleType,
        intentType: formData.intentType,
        title: formData.title,
        content: [
          {
            type: "paragraph",
            children: [
              {
                type: "text",
                text: formData.description
              }
            ]
          }
        ],
        destinationCity: formData.destinationCity,
      };

      await createPost(postData);
      
      showToast("Post created successfully!");
      if (onPostCreated) onPostCreated();
      onClose();
      // Reset form
      setFormData({
        title: '',
        description: '',
        destinationCity: '',
        roleType: 'seller',
        intentType: 'demand',
      });
    } catch (error) {
      console.error("Error creating post:", error);
      showToast("Failed to create post. Please try again.", 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold">
               <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path></svg>
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 leading-tight">Create Post</h2>
              <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider">Share your requirement or offer</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            disabled={submitting}
          >
            <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Role Type</label>
              <select 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm"
                value={formData.roleType}
                onChange={(e) => setFormData({...formData, roleType: e.target.value as any})}
              >
                <option value="seller">Seller</option>
                <option value="buyer">Buyer</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Intent Type</label>
              <select 
                className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm"
                value={formData.intentType}
                onChange={(e) => setFormData({...formData, intentType: e.target.value as any})}
              >
                <option value="demand">demand</option>
                <option value="offer">offer</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Post Title</label>
            <input 
              required
              type="text" 
              placeholder="e.g. 10 Star Hotel in Dubai – Special Rates"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Destination City</label>
            <input 
              required
              type="text" 
              placeholder="e.g. Dubai"
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm"
              value={formData.destinationCity}
              onChange={(e) => setFormData({...formData, destinationCity: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-1.5">Content / Description</label>
            <textarea 
              required
              rows={4}
              placeholder="Describe your offer or requirement in detail..."
              className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm resize-none"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="pt-2 flex gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="flex-1 py-3 text-gray-600 font-bold text-sm bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
              disabled={submitting}
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={submitting}
              className="flex-[2] py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Posting...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>
                  Create Post
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
