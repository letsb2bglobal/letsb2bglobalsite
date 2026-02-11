'use client';

import React, { useState, useEffect } from 'react';

interface ProfileEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  fields: {
    key: string;
    label: string;
    type: 'text' | 'textarea' | 'number' | 'select' | 'chips' | 'locations' | 'categories';
    placeholder?: string;
    options?: { label: string; value: string }[];
  }[];
  initialData: any;
  onSave: (data: any) => Promise<void>;
}

export default function ProfileEditModal({
  isOpen,
  onClose,
  title,
  fields,
  initialData,
  onSave,
}: ProfileEditModalProps) {
  const [formData, setFormData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentLocation, setCurrentLocation] = useState({ city: '', country: '' });
  
  // State for complex category addition
  const [newCategory, setNewCategory] = useState({ category: '', sub_categories: [] as string[], description: '' });
  const [subCatInput, setSubCatInput] = useState('');

  useEffect(() => {
    if (isOpen) {
      setFormData(initialData || {});
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSave = async () => {
    setIsLoading(true);
    try {
      await onSave(formData);
      onClose();
    } catch (error) {
      console.error('Error saving profile section:', error);
      alert('Failed to save changes');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddChip = (key: string, value: string) => {
    if (!value.trim()) return;
    const current = formData[key] || [];
    if (!current.includes(value.trim())) {
      setFormData({ ...formData, [key]: [...current, value.trim()] });
    }
  };

  const handleRemoveChip = (key: string, value: string) => {
    setFormData((prev: any) => ({
      ...prev,
      [key]: (prev[key] || []).filter((v: string) => v !== value)
    }));
  };

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-300">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-blue-50 to-white">
          <h2 className="text-xl font-bold text-gray-900">{title}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {fields.map((field) => (
            <div key={field.key} className="space-y-1.5">
              <label className="text-sm font-bold text-gray-700">{field.label}</label>
              
              {field.type === 'text' && (
                <input
                  type="text"
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData[field.key] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                />
              )}

              {field.type === 'number' && (
                <input
                  type="number"
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  value={formData[field.key] || 0}
                  onChange={(e) => setFormData({ ...formData, [field.key]: parseInt(e.target.value) || 0 })}
                />
              )}

              {field.type === 'textarea' && (
                <textarea
                  rows={4}
                  placeholder={field.placeholder}
                  className="w-full px-4 py-2 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
                  value={formData[field.key] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                />
              )}

              {field.type === 'select' && (
                <select
                  className="w-full px-4 py-2 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all bg-white"
                  value={formData[field.key] || ''}
                  onChange={(e) => setFormData({ ...formData, [field.key]: e.target.value })}
                >
                  <option value="" disabled>{field.placeholder || 'Select option'}</option>
                  {field.options?.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              )}

              {field.type === 'chips' && (
                <div className="space-y-3">
                  <div className="flex flex-wrap gap-2">
                    {(formData[field.key] || []).map((chip: string, i: number) => (
                      <span key={i} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold border border-blue-100 flex items-center gap-1">
                        {chip}
                        <button onClick={() => handleRemoveChip(field.key, chip)} className="hover:text-red-500">
                          <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                          </svg>
                        </button>
                      </span>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      id={`chip-input-${field.key}`}
                      placeholder="Add item..."
                      className="flex-1 px-4 py-2 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          handleAddChip(field.key, (e.target as HTMLInputElement).value);
                          (e.target as HTMLInputElement).value = '';
                        }
                      }}
                    />
                    <button 
                      onClick={() => {
                        const input = document.getElementById(`chip-input-${field.key}`) as HTMLInputElement;
                        handleAddChip(field.key, input.value);
                        input.value = '';
                      }}
                      className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {field.type === 'locations' && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    {(formData[field.key] || []).map((loc: any, i: number) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="flex items-center gap-2">
                          <svg className="w-4 h-4 text-blue-500" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" /></svg>
                          <span className="text-sm font-semibold">{loc.city}, {loc.country}</span>
                        </div>
                        <button onClick={() => {
                           const updated = (formData[field.key] || []).filter((_: any, idx: number) => idx !== i);
                           setFormData({...formData, [field.key]: updated});
                        }} className="text-red-500 hover:bg-red-50 p-1 rounded-lg">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                     <input 
                       placeholder="City" 
                       className="px-4 py-2 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                       value={currentLocation.city}
                       onChange={e => setCurrentLocation({...currentLocation, city: e.target.value})}
                     />
                     <input 
                       placeholder="Country" 
                       className="px-4 py-2 text-black border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                       value={currentLocation.country}
                       onChange={e => setCurrentLocation({...currentLocation, country: e.target.value})}
                     />
                  </div>
                  <button 
                    onClick={() => {
                       if (currentLocation.city && currentLocation.country) {
                         const updated = [...(formData[field.key] || []), currentLocation];
                         setFormData({...formData, [field.key]: updated});
                         setCurrentLocation({ city: '', country: '' });
                       }
                    }}
                    className="w-full py-2 border border-blue-600 text-blue-600 rounded-xl font-bold text-sm hover:bg-blue-50 transition-all"
                  >
                    + Add New Location
                  </button>
                </div>
              )}

              {field.type === 'categories' && (
                <div className="space-y-4">
                  {/* List existing categories */}
                  <div className="space-y-2">
                    {(formData[field.key] || []).map((cat: any, i: number) => (
                      <div key={i} className="flex flex-col p-3 bg-gray-50 rounded-xl border border-gray-100 relative group">
                        <button 
                          onClick={() => {
                             setFormData((prev: any) => ({
                               ...prev,
                               [field.key]: (prev[field.key] || []).filter((_: any, idx: number) => idx !== i)
                             }));
                          }} 
                          className="absolute top-2 right-2 text-red-500 hover:bg-red-50 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <span className="text-sm font-bold text-gray-800">{cat.category}</span>
                        {cat.sub_categories && cat.sub_categories.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-1">
                            {cat.sub_categories.map((sub: string, si: number) => (
                              <span key={si} className="text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded">
                                {sub}
                              </span>
                            ))}
                          </div>
                        )}
                        {cat.description && (
                          <p className="text-xs text-gray-500 mt-1 italic">
                            {cat.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add New Category */}
                  <div className="p-4 bg-gray-50 rounded-xl border border-dashed border-gray-300 space-y-3">
                    <p className="text-xs font-bold text-gray-500 uppercase">Add New Category</p>
                    <select
                      className="w-full px-3 py-2 text-sm text-black border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                      value={newCategory.category}
                      onChange={(e) => setNewCategory({ ...newCategory, category: e.target.value })}
                    >
                      <option value="">Select Category</option>
                      {field.options?.map((opt) => (
                        <option key={opt.value} value={opt.value}>{opt.label}</option>
                      ))}
                    </select>
                    
                    <div className="space-y-2">
                        <div className="flex flex-wrap gap-2">
                            {newCategory.sub_categories.map((sub, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-50 text-blue-600 text-xs rounded-md flex items-center gap-1">
                                    {sub}
                                    <button 
                                        onClick={() => setNewCategory({
                                            ...newCategory, 
                                            sub_categories: newCategory.sub_categories.filter((_, i) => i !== idx)
                                        })}
                                        className="hover:text-red-500"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <input 
                                placeholder="Add Sub-category..."
                                className="flex-1 px-3 py-2 text-sm text-black border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                value={subCatInput}
                                onChange={e => setSubCatInput(e.target.value)}
                                onKeyPress={e => {
                                    if (e.key === 'Enter') {
                                        if (subCatInput.trim()) {
                                            setNewCategory({
                                                ...newCategory,
                                                sub_categories: [...newCategory.sub_categories, subCatInput.trim()]
                                            });
                                            setSubCatInput('');
                                        }
                                    }
                                }}
                            />
                            <button 
                                onClick={() => {
                                    if (subCatInput.trim()) {
                                        setNewCategory({
                                            ...newCategory,
                                            sub_categories: [...newCategory.sub_categories, subCatInput.trim()]
                                        });
                                        setSubCatInput('');
                                    }
                                }}
                                className="px-3 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm font-bold hover:bg-gray-200"
                            >
                                +
                            </button>
                        </div>
                    </div>
                    
                    <textarea 
                      placeholder="Description"
                      rows={2}
                      className="w-full px-3 py-2 text-sm text-black border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                      value={newCategory.description}
                      onChange={e => setNewCategory({...newCategory, description: e.target.value})}
                    />

                    <button 
                      onClick={() => {
                         if (newCategory.category) {
                           const newItem = {
                             category: newCategory.category,
                             sub_categories: newCategory.sub_categories,
                             description: newCategory.description
                           };
                           setFormData((prev: any) => ({
                             ...prev,
                             [field.key]: [...(prev[field.key] || []), newItem]
                           }));
                           setNewCategory({ category: '', sub_categories: [], description: '' });
                         }
                      }}
                      disabled={!newCategory.category}
                      className="w-full py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                      + Add Category
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="p-6 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl hover:bg-gray-100 transition-all"
          >
            Cancel
          </button>
          <button
            disabled={isLoading}
            onClick={handleSave}
            className="flex-[2] py-3 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            {isLoading ? 'Saving Changes...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
}
