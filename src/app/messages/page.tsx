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
    if (!newMessage.trim() || sending || !activeConversation) return;

    setSending(true);
    try {
      const result = await sendChatMessage(activeConversation.id, newMessage);
      setMessages(prev => [...prev, result.data]);
      setNewMessage('');
    } catch (error: any) {
      showToast(error.message || "Failed to send message", "error");
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0 || sending || uploading || !activeConversation) return;

    setUploading(true);
    try {
      const result = await uploadChatMedia(activeConversation.id, newMessage || "Sent an attachment", Array.from(files));
      setMessages(prev => [...prev, result.data]);
      setNewMessage('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      showToast(error.message || "Failed to upload files", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f1f3f6]">
        <div className="max-w-7xl mx-auto md:mt-4 md:px-4 h-[calc(100vh-80px)]">
          <div className="grid grid-cols-1 md:grid-cols-12 h-full bg-white md:rounded-3xl border border-gray-200 shadow-xl overflow-hidden">
            
            <div className="md:col-span-4 border-r border-gray-100 flex flex-col h-full bg-slate-50">
              <div className="p-8 pb-4 bg-white">
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

              <div className="flex-1 overflow-y-auto">
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

            <div className="md:col-span-8 flex flex-col h-full bg-white relative">
              {activeConversation ? (
                <>
                  <div className="p-5 border-b border-gray-100 flex items-center justify-between bg-white/90 backdrop-blur-xl sticky top-0 z-30">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white font-black shadow-lg bg-green-600 ring-4 ring-green-100">
                          {profileNames[Number(activeConversation.userAId) === Number(user?.id) ? activeConversation.userBId : activeConversation.userAId]?.substring(0, 1) || 'C'}
                       </div>
                       <div>
                          <h3 className="font-black text-slate-900 text-sm tracking-tighter uppercase italic">
                             {profileNames[Number(activeConversation.userAId) === Number(user?.id) ? activeConversation.userBId : activeConversation.userAId] || 'Chat'}
                          </h3>
                          <div className="flex items-center gap-2">
                             <span className="flex h-2 w-2 rounded-full bg-green-500 animate-pulse"></span>
                             <span className="text-[9px] text-green-600 font-black uppercase tracking-widest">Instant Messenger</span>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-8 space-y-6 bg-slate-50/30">
                    {messagesLoading ? (
                      <div className="flex flex-col items-center justify-center h-full gap-4">
                         <div className="w-16 h-16 border-8 border-green-600/10 border-t-green-600 rounded-full animate-spin"></div>
                         <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Loading Records</p>
                      </div>
                    ) : messages.length > 0 ? (
                      messages.map((msg: any) => {
                        const isMe = Number(msg.senderUserId) === Number(user?.id);
                        return (
                          <div key={msg.documentId} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group`}>
                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[75%]`}>
                              <div className={`px-5 py-3.5 rounded-3xl shadow-sm text-sm font-medium ${isMe ? 'bg-green-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'}`}>
                                <p className="leading-relaxed whitespace-pre-wrap">{msg.message}</p>
                                {msg.media && (
                                    <div className="mt-2 pt-2 border-t border-white/20">
                                       <a href={msg.media.url} target="_blank" className="text-[10px] uppercase font-black underline flex items-center gap-1">
                                          View Shared File
                                       </a>
                                    </div>
                                )}
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

                  <div className="p-8 bg-white/80 backdrop-blur-md border-t border-gray-100">
                    <form onSubmit={handleSendMessage} className="relative">
                      <div className="flex items-end gap-3 bg-slate-100 border-2 border-transparent rounded-[2.5rem] p-3 pl-8 pr-3 focus-within:border-green-400 focus-within:bg-white focus-within:shadow-2xl transition-all duration-500">
                        <textarea 
                          rows={1}
                          placeholder="WRITE AN INSTANT MESSAGE..." 
                          className="flex-1 bg-transparent border-none outline-none py-3 text-xs text-slate-900 font-black uppercase tracking-wider resize-none max-h-40 placeholder:text-gray-400"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e as any); } }}
                          disabled={sending || uploading}
                        />
                        <div className="flex items-center gap-2">
                           <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} multiple />
                           <button type="button" onClick={() => fileInputRef.current?.click()} className="p-3 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-full transition-all" disabled={uploading}>
                             {uploading ? <div className="w-6 h-6 border-4 border-green-600/30 border-t-green-600 rounded-full animate-spin"></div> : <PaperclipIcon className="w-6 h-6" />}
                           </button>
                           <button type="submit" disabled={!newMessage.trim() || sending} className={`w-14 h-14 flex items-center justify-center rounded-full transition-all ${!newMessage.trim() || sending ? 'bg-gray-200 text-gray-400' : 'bg-green-600 text-white shadow-xl shadow-green-200 hover:scale-110 hover:-rotate-12 active:scale-95'}`}>
                             {sending ? <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div> : <SendIcon className="w-7 h-7 rotate-90" />}
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

function SearchIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>; }
function PaperclipIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L20.5 13"/></svg>; }
function SendIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>; }
function MessageSquareIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg>; }
