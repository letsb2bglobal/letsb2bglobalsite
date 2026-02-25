'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProtectedRoute, { useAuth } from '@/components/ProtectedRoute';
import { 
  fetchEnquiryThreads, 
  fetchEnquiryMessages, 
  sendEnquiryMessage, 
  markThreadAsRead,
  uploadEnquiryMedia,
  fetchEnquiryThreadById,
  type EnquiryThread, 
  type EnquiryMessage 
} from '@/lib/enquiry';
import { useToast } from '@/components/Toast';
import Image from 'next/image';

function EnquiriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuth();
  const { showToast } = useToast();
  
  const [threads, setThreads] = useState<EnquiryThread[]>([]);
  const [activeThread, setActiveThread] = useState<EnquiryThread | null>(null);
  const [messages, setMessages] = useState<EnquiryMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [myProfile, setMyProfile] = useState<any>(null);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ url: string; name: string; type: string }[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial Data Fetch
  useEffect(() => {
    const loadStaticData = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      try {
        const { checkUserProfile } = await import("@/lib/profile");
        const threadList = await fetchEnquiryThreads();
        setThreads(threadList || []);
        
        const profile = await checkUserProfile(user.id);
        setMyProfile(profile);

        // URL context
        const threadIdParam = searchParams.get('threadId');
        if (threadIdParam) {
           const found = threadList.find(t => t.documentId === threadIdParam);
           if (found) setActiveThread(found);
           else {
             const t = await fetchEnquiryThreadById(threadIdParam);
             if (t) {
               setActiveThread(t);
               setThreads(prev => [t, ...prev]);
             }
           }
        }
      } catch (error) {
        console.error("Enquiry sync failed:", error);
      } finally {
        setLoading(false);
      }
    };
    loadStaticData();
  }, [user?.id, searchParams]); // Added searchParams to deps

  // Load messages when thread changes
  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (!activeThread) {
      setMessages([]);
      return;
    }

    const loadHistory = async () => {
        setMessagesLoading(true);
        try {
          const msgList = await fetchEnquiryMessages(activeThread.documentId);
          setMessages(msgList);
          if (user?.id) await markThreadAsRead(activeThread.documentId, user.id);
          
          /* Polling removed per user request */
        } catch (error) {
          console.error("Error loading enquiry messages:", error);
        } finally {
          setMessagesLoading(false);
        }
    };

    loadHistory();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeThread, user]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && selectedFiles.length === 0) || sending || uploading || !activeThread) return;

    setSending(true);
    try {
      if (selectedFiles.length > 0) {
        setUploading(true);
        const result = await uploadEnquiryMedia(
            activeThread.documentId, 
            newMessage.trim() || "Sent an attachment", 
            selectedFiles
        );
        setMessages(prev => [...prev, result.data]);
        setSelectedFiles([]);
        setFilePreviews([]);
      } else {
        const result = await sendEnquiryMessage(activeThread.documentId, newMessage);
        setMessages(prev => [...prev, result.data]);
      }
      setNewMessage('');
    } catch (error: any) {
      showToast(error.message || "Failed to send message", "error");
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setSelectedFiles(prev => [...prev, ...newFiles]);

    newFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFilePreviews(prev => [...prev, { 
            url: e.target?.result as string, 
            name: file.name, 
            type: 'image' 
          }]);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreviews(prev => [...prev, { 
          url: '', 
          name: file.name, 
          type: 'file' 
        }]);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const getOtherParticipant = (thread: EnquiryThread) => {
    if (!user?.id || !thread) return null;
    if (Number(thread.from_company?.userId) === Number(user.id)) return thread.to_company;
    return thread.from_company;
  };

  return (
    <ProtectedRoute>
      <div className="bg-[#f1f3f6] overflow-hidden">
        <div className="max-w-7xl mx-auto md:px-4 h-[calc(100dvh-64px)] flex flex-col">
          <div className="mt-0 md:mt-4 flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 bg-white md:rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            
            <div className={`md:col-span-4 border-r border-gray-100 flex flex-col h-full bg-slate-50 min-h-0 ${activeThread ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-8 pb-4 bg-white shrink-0">
                <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-6">Enquiries</h1>
                <div className="relative">
                   <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                   <input type="text" placeholder="Search enquiries..." className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm outline-none" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                   <div className="p-12 text-center text-slate-400"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>
                ) : threads.length > 0 ? (
                  threads.map((thread) => {
                    const isActive = activeThread?.documentId === thread.documentId;
                    const otherCompany = getOtherParticipant(thread);
                    return (
                      <div key={thread.documentId} onClick={() => setActiveThread(thread)} className={`p-6 border-b border-gray-100/50 cursor-pointer transition-all flex gap-4 ${isActive ? 'bg-white shadow-2xl z-10 border-l-4 border-l-blue-600 scale-[1.02]' : 'hover:bg-white/80'}`}>
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${isActive ? 'from-blue-600 to-indigo-700' : 'from-slate-700 to-slate-900'} flex items-center justify-center text-white font-black shrink-0 shadow-xl text-xl`}>
                           {otherCompany?.company_name?.substring(0, 1).toUpperCase() || 'E'}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className={`text-[12px] font-black uppercase tracking-tight truncate ${isActive ? 'text-blue-600' : 'text-slate-900'}`}>{otherCompany?.company_name || 'ENQUIRY'}</h4>
                            <span className="text-[9px] text-slate-400 font-bold tabular-nums">{new Date(thread.last_message_at || thread.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-[11px] text-slate-800 font-black truncate mb-1 uppercase tracking-tighter">{thread.title}</p>
                          <p className={`text-[10px] truncate uppercase tracking-widest font-bold ${isActive ? 'text-blue-600' : 'text-slate-400'}`}>
                             {isActive ? 'Active Now' : 'Tap to view'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <EmptyInbox message="No Enquiries Found" />
                )}
              </div>
            </div>

            <div className={`md:col-span-8 flex flex-col h-full bg-white relative min-h-0 ${activeThread ? 'flex' : 'hidden md:flex'}`}>
              {activeThread ? (
                <>
                  <div className="p-3 md:p-5 border-b border-gray-100 flex items-center justify-between bg-white/90 backdrop-blur-xl shrink-0 z-50">
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                       <button 
                         onClick={() => setActiveThread(null)}
                         className="p-2 -ml-2 text-slate-400 hover:text-slate-600 md:hidden"
                       >
                         <ChevronLeftIcon className="w-6 h-6" />
                       </button>
                       <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-lg bg-blue-600 ring-4 ring-blue-50 shrink-0">
                          {getOtherParticipant(activeThread)?.company_name?.substring(0, 1).toUpperCase() || 'E'}
                       </div>
                       <div className="truncate">
                          <h3 className="font-black text-slate-900 text-xs md:text-sm tracking-tighter uppercase italic truncate">{getOtherParticipant(activeThread)?.company_name || 'ENQUIRY'}</h3>
                          <div className="flex items-center gap-2">
                             <span className="flex h-2 w-2 rounded-full bg-blue-500 animate-pulse"></span>
                             <span className="text-[9px] text-blue-600 font-black uppercase tracking-widest truncate">{activeThread.title}</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed min-h-0" style={{ scrollBehavior: 'smooth' }}>
                    {messagesLoading ? (
                      <div className="flex flex-col items-center justify-center h-full gap-4">
                         <div className="w-16 h-16 border-8 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div>
                         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Loading Records</p>
                      </div>
                    ) : messages.length > 0 ? (
                      messages.map((msg: any) => {
                        const isMe = Number(msg.sender_profile?.userId) === Number(user?.id);
                        return (
                          <div key={msg.documentId} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-2`}>
                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
                              <div className={`px-4 py-3 rounded-2xl shadow-sm text-[13px] font-medium leading-relaxed relative ${
                                isMe 
                                ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none' 
                                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                              }`}>
                                <p className="whitespace-pre-wrap">{msg.message_body}</p>
                                
                                {(() => {
                                  const attachments = msg.custom_attachments || msg.media;
                                  if (!attachments) return null;
                                  const attList = Array.isArray(attachments) ? attachments : [attachments];
                                  if (attList.length === 0) return null;

                                  return (
                                    <div className={`mt-3 pt-3 border-t ${isMe ? 'border-white/20' : 'border-slate-100'} flex flex-col gap-2`}>
                                      {attList.map((m: any, i: number) => {
                                        const isImg = m.url?.toLowerCase().match(/\.(jpg|jpeg|png|webp|gif)$/);
                                        const isVid = m.type === 'videos' || m.url?.toLowerCase().match(/\.(mp4|webm|ogg|mov|m4v)$/);
                                        const isDoc = m.type === 'documents' || m.type === 'files' || m.url?.toLowerCase().match(/\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|csv)$/);

                                        return (
                                          <div key={i} className={`rounded-xl overflow-hidden border ${isMe ? 'border-white/10 bg-black/5' : 'border-slate-100 bg-slate-50'} shadow-sm`}>
                                            {isImg ? (
                                              <img src={m.url} alt="Shared" className="max-w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition" onClick={() => window.open(m.url, '_blank')} />
                                            ) : isVid ? (
                                              <video src={m.url} className="max-w-full max-h-64 cursor-pointer" controls />
                                            ) : (
                                              <a 
                                                href={m.url} 
                                                download 
                                                target="_blank" 
                                                className={`p-3 flex items-center gap-3 transition-colors ${isMe ? 'hover:bg-black/10' : 'hover:bg-slate-100'}`}
                                              >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${isMe ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                                                  <PaperclipIcon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <p className={`text-[10px] font-black truncate uppercase tracking-tighter ${isMe ? 'text-white' : 'text-slate-900'}`}>{m.name || `Attachment ${i + 1}`}</p>
                                                  <p className={`text-[8px] font-bold uppercase opacity-60 ${isMe ? 'text-white/80' : 'text-slate-400'}`}>Download File</p>
                                                </div>
                                              </a>
                                            )}
                                          </div>
                                        );
                                      })}
                                    </div>
                                  );
                                })()}
                              </div>
                              <span className="mt-1.5 px-2 text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                                {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full opacity-50"><p className="text-xs font-black uppercase tracking-widest">Start the Conversation</p></div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-4 md:p-8 bg-white/90 backdrop-blur-md border-t border-gray-100 shrink-0 z-40">
                    <form onSubmit={handleSendMessage} className="space-y-4">
                      {/* File Previews */}
                      {filePreviews.length > 0 && (
                        <div className="flex flex-wrap gap-3 pb-2 max-h-32 overflow-y-auto custom-scrollbar">
                           {filePreviews.map((preview, idx) => (
                             <div key={idx} className="relative group/preview w-20 h-20 rounded-2xl bg-slate-100 border border-slate-200 overflow-hidden shadow-sm">
                                {preview.type === 'image' ? (
                                  <img src={preview.url} alt="upload" className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex flex-col items-center justify-center p-2 text-center">
                                    <PaperclipIcon className="w-6 h-6 text-slate-400 mb-1" />
                                    <span className="text-[8px] font-black text-slate-600 truncate w-full uppercase">{preview.name}</span>
                                  </div>
                                )}
                                <button 
                                  type="button" 
                                  onClick={() => removeSelectedFile(idx)}
                                  className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-100 md:opacity-0 group-hover/preview:opacity-100 transition-all hover:bg-red-500 shadow-xl"
                                >
                                  <XIcon className="w-3 h-3" />
                                </button>
                             </div>
                           ))}
                        </div>
                      )}

                      <div className="flex items-end gap-3 bg-slate-50 border-2 border-slate-100 rounded-3xl p-2 pl-6 pr-2 focus-within:border-blue-400 focus-within:bg-white focus-within:shadow-xl transition-all duration-300">
                        <textarea 
                          rows={1}
                          placeholder="Type your response..." 
                          className="flex-1 bg-transparent border-none outline-none py-3 text-sm text-slate-900 font-medium placeholder:text-slate-400 resize-none max-h-40 overflow-y-auto custom-scrollbar"
                          value={newMessage}
                          onChange={(e) => {
                            setNewMessage(e.target.value);
                            e.target.style.height = 'auto';
                            e.target.style.height = `${e.target.scrollHeight}px`;
                          }}
                          onKeyDown={(e) => { 
                            if (e.key === 'Enter' && !e.shiftKey) { 
                              e.preventDefault(); 
                              handleSendMessage(e as any); 
                              const target = e.target as HTMLTextAreaElement;
                              target.style.height = 'auto';
                            } 
                          }}
                          disabled={sending || uploading}
                        />
                        <div className="flex items-center gap-1.5 pb-1">
                           <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileSelect} multiple />
                           <button 
                             type="button" 
                             onClick={() => fileInputRef.current?.click()} 
                             className="p-3 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all" 
                             disabled={uploading}
                           >
                             <PaperclipIcon className="w-6 h-6" />
                           </button>
                           <button 
                             type="submit" 
                             disabled={(!newMessage.trim() && selectedFiles.length === 0) || sending || uploading} 
                             className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${(!newMessage.trim() && selectedFiles.length === 0) || sending || uploading ? 'bg-gray-100 text-gray-300' : 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:scale-110 active:scale-95'}`}
                           >
                             {sending || uploading ? (
                               <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin"></div>
                             ) : (
                               <SendIcon className="w-6 h-6" />
                             )}
                           </button>
                        </div>
                      </div>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center p-12 h-full"><h3 className="text-2xl font-black text-slate-900 mb-2">SELECT AN ENQUIRY</h3><p className="text-slate-500 max-w-sm">Pick a thread from the list to view negotiation history and shared files.</p></div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function EnquiriesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div></div>}>
      <EnquiriesContent />
    </Suspense>
  );
}

function ChevronLeftIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>; }
function SearchIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>; }
function PaperclipIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L20.5 13"/></svg>; }
function SendIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>; }
function XIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>; }

function EmptyInbox({ message }: { message: string }) {
  return (
    <div className="p-12 text-center opacity-50">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg></div>
      <p className="text-xs font-black uppercase tracking-widest">{message}</p>
    </div>
  );
}
