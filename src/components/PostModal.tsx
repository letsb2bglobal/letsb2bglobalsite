'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/components/ProtectedRoute';
import { createPost, type CreatePostData } from '@/lib/posts';
import { useToast } from '@/components/Toast';
import { getToken } from '@/lib/auth';

interface Category {
  id: number;
  documentId: string;
  name: string;
}

interface PostModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPostCreated?: () => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.letsb2b.com';

// Static fallback — used when API categories are empty or unavailable
const STATIC_CATEGORIES: Category[] = [
  { id: 1, documentId: 'travel_agency', name: 'Travel Agency' },
  { id: 2, documentId: 'tour_operator', name: 'Tour Operator' },
  { id: 3, documentId: 'dmc', name: 'DMC' },
  { id: 4, documentId: 'hotel_resort_stay', name: 'Hotel / Resort / Stay' },
  { id: 5, documentId: 'transport_provider', name: 'Transport Provider' },
  { id: 6, documentId: 'event_mice', name: 'Event / MICE Company' },
  { id: 7, documentId: 'wellness_medical', name: 'Wellness / Medical Tourism' },
  { id: 8, documentId: 'travel_tech', name: 'Travel Tech Company' },
];

export default function PostModal({ isOpen, onClose, onPostCreated }: PostModalProps) {
  const user = useAuth();
  const { showToast } = useToast();

  const [formData, setFormData] = useState({
    description: '',
    destination: '',
    category: '',
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Fetch categories on open; fallback to static list if API returns nothing
  useEffect(() => {
    if (!isOpen) return;
    const fetchCategories = async () => {
      setCategoriesLoading(true);
      try {
        const token = getToken();
        const res = await fetch(`${API_URL}/api/categories?filters[active][$eq]=true`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const result = await res.json();
          const apiCategories: Category[] = result.data || [];
          // Use API results if available, otherwise fall back to static list
          setCategories(apiCategories.length > 0 ? apiCategories : STATIC_CATEGORIES);
        } else {
          setCategories(STATIC_CATEGORIES);
        }
      } catch (err) {
        console.error('Failed to load categories, using static list:', err);
        setCategories(STATIC_CATEGORIES);
      } finally {
        setCategoriesLoading(false);
      }
    };
    fetchCategories();
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    if (!formData.category) {
      showToast('Please select a category.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      const postData: CreatePostData = {
        userId: user.id,
        description: formData.description,
        destination: formData.destination,
        category: formData.category,
      };

      await createPost(postData);

      showToast('Post published to TradeWall!', 'success');
      if (onPostCreated) onPostCreated();
      onClose();
      setFormData({ description: '', destination: '', category: '' });
    } catch (error: any) {
      console.error('Error creating post:', error);
      showToast(error?.message || 'Failed to create post. Please try again.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const descLen = formData.description.length;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">

        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-indigo-50 to-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <div>
              <h2 className="text-lg font-black text-gray-900 leading-tight">Post to TradeWall</h2>
              <p className="text-[10px] text-indigo-600 font-bold uppercase tracking-widest">Share your requirement or offer</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">

          {/* Description */}
          <div>
            <div className="flex justify-between items-center mb-1.5">
              <label className="text-xs font-black text-gray-500 uppercase tracking-widest">Description *</label>
              <span className={`text-[10px] font-bold ${descLen > 480 ? 'text-red-500' : 'text-gray-400'}`}>
                {descLen}/500
              </span>
            </div>
            <textarea
              required
              rows={4}
              maxLength={500}
              placeholder="e.g. Need 50 rooms in Kerala for a group tour, dates 10-14 March. Budget: ₹4,500/night per room."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm resize-none leading-relaxed"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>

          {/* Destination + Category row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Destination *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </span>
                <input
                  required
                  type="text"
                  placeholder="e.g. Kerala"
                  className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm"
                  value={formData.destination}
                  onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-black text-gray-500 uppercase tracking-widest mb-1.5">Category *</label>
              <select
                required
                className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:bg-white outline-none transition-all text-sm disabled:opacity-60"
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                disabled={categoriesLoading}
              >
                <option value="">
                  {categoriesLoading ? 'Loading...' : 'Select...'}
                </option>
                {categories.map((cat) => (
                  <option key={cat.documentId} value={cat.documentId}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Info notice */}
          <div className="flex items-start gap-2 bg-indigo-50 rounded-xl p-3 border border-indigo-100">
            <svg className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
            <p className="text-[11px] text-indigo-700 leading-relaxed font-medium">
              Your post will be matched to relevant B2B partners based on <strong>destination</strong> and <strong>category</strong>. Be specific for better matches.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 py-3 text-gray-600 font-bold text-sm bg-gray-50 hover:bg-gray-100 rounded-xl transition-all border border-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || !formData.description || !formData.destination || !formData.category}
              className="flex-[2] py-3 bg-indigo-600 text-white font-bold text-sm rounded-xl hover:bg-indigo-700 transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Publishing...
                </>
              ) : (
                <>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                  Publish to TradeWall
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
