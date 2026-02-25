'use client';

import React, { useState, useEffect, useRef, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProtectedRoute, { useAuth } from '@/components/ProtectedRoute';
import { 
  fetchUserConversations, 
  fetchChatMessages, 
  sendChatMessage, 
  uploadChatMedia,
  fetchConversationById,
  type Conversation, 
  type Message 
} from '@/lib/messages';
import { useToast } from '@/components/Toast';
import Image from 'next/image';

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuth();
  const { showToast } = useToast();
  
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [profileNames, setProfileNames] = useState<Record<number, string>>({});
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [filePreviews, setFilePreviews] = useState<{ url: string; name: string; type: string }[]>([]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const lastMsgRef = useRef<string | null>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initial Sync
  useEffect(() => {
    const sync = async () => {
      if (!user?.id) return;
      setLoading(true);
      try {
        const convList = await fetchUserConversations();
        setConversations(convList || []);

        const convIdParam = searchParams.get('convId');
        if (convIdParam) {
           const found = convList.find(c => c.documentId === convIdParam);
           if (found) setActiveConversation(found);
           else {
             const c = await fetchConversationById(convIdParam);
             if (c) {
               setActiveConversation(c);
               setConversations(prev => [c, ...prev]);
             }
           }
        }
      } catch (err) {
        console.error("Chat sync failed:", err);
      } finally {
        setLoading(false);
      }
    };
    sync();
  }, [user?.id, searchParams]); // Added searchParams to deps

  // Message Loading & Polling
  useEffect(() => {
    if (pollingRef.current) clearInterval(pollingRef.current);
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    const loadHistory = async () => {
        setMessagesLoading(true);
        try {
          const msgList = await fetchChatMessages(activeConversation.id);
          setMessages(msgList);
          
          if (msgList.length > 0) {
            lastMsgRef.current = msgList[msgList.length - 1].createdAt;
          } else {
            lastMsgRef.current = null;
          }
          
          /* Polling removed per user request */

          const otherUserId = Number(activeConversation.userAId) === Number(user?.id) ? activeConversation.userBId : activeConversation.userAId;
          if (otherUserId && !profileNames[otherUserId]) {
            const { checkUserProfile } = await import("@/lib/profile");
            try {
              const prof = await checkUserProfile(otherUserId);
              if (prof) {
                setProfileNames(prev => ({ ...prev, [otherUserId]: prof.company_name || prof.full_name || `User ${otherUserId}` }));
              }
            } catch (e) {}
          }
        } catch (error) {
          console.error("Error loading chat messages:", error);
        } finally {
          setMessagesLoading(false);
        }
    };

    loadHistory();
    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [activeConversation, user, profileNames]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && selectedFiles.length === 0) || sending || uploading || !activeConversation) return;

    setSending(true);
    try {
      if (selectedFiles.length > 0) {
        setUploading(true);
        const result = await uploadChatMedia(
            activeConversation.id, 
            newMessage.trim() || "Sent an attachment", 
            selectedFiles
        );
        setMessages(prev => [...prev, result.data]);
        setSelectedFiles([]);
        setFilePreviews([]);
      } else {
        const result = await sendChatMessage(activeConversation.id, newMessage);
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

  return (
    <ProtectedRoute>
      <div className="bg-[#f1f3f6] overflow-hidden">
        <div className="max-w-7xl mx-auto md:px-4 h-[calc(100dvh-64px)] flex flex-col">
          <div className="mt-0 md:mt-4 flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 bg-white md:rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            
            <div className={`md:col-span-4 border-r border-gray-100 flex flex-col h-full bg-slate-50 min-h-0 ${activeConversation ? 'hidden md:flex' : 'flex'}`}>
              <div className="p-8 pb-4 bg-white shrink-0">
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-2xl font-black text-slate-900 tracking-tighter uppercase italic flex items-center gap-2">
                    <span className="w-2 h-8 bg-green-500 rounded-full"></span> Chat
                  </h1>
                </div>
                <div className="relative">
                   <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                   <input type="text" placeholder="Search direct messages..." className="w-full pl-9 pr-4 py-3 bg-gray-100 border-none rounded-2xl text-xs font-bold outline-none uppercase tracking-wider" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                   <div className="p-12 text-center text-slate-400 animate-pulse font-black uppercase tracking-widest">Waking Up...</div>
                ) : conversations.length > 0 ? (
                  conversations.map((conv) => {
                    const isActive = activeConversation?.documentId === conv.documentId;
                    const otherUserId = Number(conv.userAId) === Number(user?.id) ? conv.userBId : conv.userAId;
                    return (
                      <div key={conv.documentId} onClick={() => setActiveConversation(conv)} className={`p-6 border-b border-gray-100/50 cursor-pointer transition-all flex gap-4 ${isActive ? 'bg-white shadow-2xl z-10 border-l-4 border-l-green-600 scale-[1.02]' : 'hover:bg-white/80'}`}>
                        <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${isActive ? 'from-green-500 to-emerald-700' : 'from-slate-700 to-slate-900'} flex items-center justify-center text-white font-black shrink-0 shadow-xl text-xl`}>
                           {profileNames[otherUserId]?.substring(0, 1) || 'C'}
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className={`text-[12px] font-black uppercase tracking-tight truncate ${isActive ? 'text-green-600' : 'text-slate-900'}`}>
                              {profileNames[otherUserId] || `User ${otherUserId}`}
                            </h4>
                            <span className="text-[9px] text-slate-400 font-bold tabular-nums">
                               {new Date(conv.lastMessageAt || conv.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className={`text-[10px] mt-1 truncate uppercase tracking-widest font-bold ${isActive ? 'text-green-600' : 'text-slate-400'}`}>
                             {isActive ? 'Active Now' : 'Tap to chat'}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="p-12 text-center opacity-30 mt-20 font-black uppercase tracking-widest">Inbox Zero</div>
                )}
              </div>
            </div>

            <div className={`md:col-span-8 flex flex-col h-full bg-white relative min-h-0 ${activeConversation ? 'flex' : 'hidden md:flex'}`}>
              {activeConversation ? (
                <>
                  <div className="p-3 md:p-5 border-b border-gray-100 flex items-center justify-between bg-white/90 backdrop-blur-xl shrink-0 z-50">
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                       <button 
                         onClick={() => setActiveConversation(null)}
                         className="p-2 -ml-2 text-slate-400 hover:text-slate-600 md:hidden"
                       >
                         <ChevronLeftIcon className="w-6 h-6" />
                       </button>
                       <div className="w-10 h-10 md:w-12 md:h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-lg bg-green-600 ring-4 ring-green-50 shrink-0">
                          {profileNames[Number(activeConversation.userAId) === Number(user?.id) ? activeConversation.userBId : activeConversation.userAId]?.substring(0, 1) || 'C'}
                       </div>
                       <div className="truncate">
                          <h3 className="font-black text-slate-900 text-xs md:text-sm tracking-tighter uppercase italic truncate">
                             {profileNames[Number(activeConversation.userAId) === Number(user?.id) ? activeConversation.userBId : activeConversation.userAId] || 'Chat'}
                          </h3>
                          <div className="flex items-center gap-2">
                             <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                             <span className="text-[9px] text-green-600 font-black uppercase tracking-widest">Instant Messenger</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed min-h-0" style={{ scrollBehavior: 'smooth' }}>
                    {messagesLoading ? (
                      <div className="flex flex-col items-center justify-center h-full gap-4">
                         <div className="w-16 h-16 border-8 border-green-600/10 border-t-green-600 rounded-full animate-spin"></div>
                         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Loading Records</p>
                      </div>
                    ) : messages.length > 0 ? (
                      messages.map((msg: any) => {
                        const isMe = Number(msg.senderUserId) === Number(user?.id);
                        return (
                          <div key={msg.documentId} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-2`}>
                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
                              <div className={`px-4 py-3 rounded-2xl shadow-sm text-[13px] font-medium leading-relaxed relative ${
                                isMe 
                                ? 'bg-gradient-to-br from-green-600 to-emerald-700 text-white rounded-tr-none' 
                                : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                              }`}>
                                <p className="whitespace-pre-wrap">{msg.message}</p>
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
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${isMe ? 'bg-white text-green-600' : 'bg-green-600 text-white'}`}>
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
                      <div className="flex flex-col items-center justify-center h-full opacity-20"><p className="text-xl font-black uppercase tracking-[0.5em] italic">No Logs Yet</p></div>
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

                      <div className="flex items-end gap-3 bg-slate-50 border-2 border-slate-100 rounded-3xl p-2 pl-6 pr-2 focus-within:border-green-400 focus-within:bg-white focus-within:shadow-xl transition-all duration-300">
                        <textarea 
                          rows={1}
                          placeholder="Type an instant message..." 
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
                             className="p-3 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-2xl transition-all" 
                             disabled={uploading}
                           >
                             <PaperclipIcon className="w-6 h-6" />
                           </button>
                           <button 
                             type="submit" 
                             disabled={(!newMessage.trim() && selectedFiles.length === 0) || sending || uploading} 
                             className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${(!newMessage.trim() && selectedFiles.length === 0) || sending || uploading ? 'bg-gray-100 text-gray-300' : 'bg-green-600 text-white shadow-lg shadow-green-100 hover:scale-110 active:scale-95'}`}
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
                <div className="flex flex-col items-center justify-center text-center p-20 h-full">
                   <div className="w-32 h-32 bg-slate-50 rounded-[3rem] flex items-center justify-center text-slate-200 mb-8 border border-slate-100 italic transition-transform hover:rotate-6 hover:scale-110">
                      <MessageSquareIcon className="w-16 h-16" />
                   </div>
                   <h3 className="text-4xl font-black text-slate-900 mb-4 tracking-tighter italic">DIRECT CHAT</h3>
                   <p className="text-slate-400 max-w-sm text-xs font-bold uppercase tracking-[0.2em] leading-loose">Select a person from the list to initiate a secure 1-on-1 instant dialogue.</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#f1f3f6] flex items-center justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div></div>}>
      <MessagesContent />
    </Suspense>
  );
}

function ChevronLeftIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7"/></svg>; }
function SearchIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>; }
function PaperclipIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L20.5 13"/></svg>; }
function SendIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>; }
function XIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"/></svg>; }
function MessageSquareIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>; }
