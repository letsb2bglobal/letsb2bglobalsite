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
    if (!newMessage.trim() || sending || !activeThread) return;

    setSending(true);
    try {
      const result = await sendEnquiryMessage(activeThread.documentId, newMessage);
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
    if (!files || files.length === 0 || sending || uploading || !activeThread) return;

    setUploading(true);
    try {
      const result = await uploadEnquiryMedia(activeThread.documentId, newMessage || "Sent an attachment", Array.from(files));
      setMessages(prev => [...prev, result.data]);
      setNewMessage('');
      if (fileInputRef.current) fileInputRef.current.value = '';
    } catch (error: any) {
      showToast(error.message || "Failed to upload files", "error");
    } finally {
      setUploading(false);
    }
  };

  const getOtherParticipant = (thread: EnquiryThread) => {
    if (!user?.id || !thread) return null;
    if (Number(thread.from_company?.userId) === Number(user.id)) return thread.to_company;
    return thread.from_company;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f8f9fb]">
        <div className="max-w-7xl mx-auto md:mt-6 md:px-4 h-[calc(100vh-100px)]">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-0 h-full bg-white md:rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            
            <div className="md:col-span-4 border-r border-gray-100 flex flex-col h-full bg-gray-50/50">
              <div className="p-6 border-b border-gray-100 bg-white">
                <h1 className="text-xl font-black text-slate-900 tracking-tight uppercase mb-6">Enquiries</h1>
                <div className="relative">
                   <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                   <input type="text" placeholder="Search enquiries..." className="w-full pl-9 pr-4 py-2 bg-gray-100 border-none rounded-xl text-sm outline-none" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto">
                {loading ? (
                   <div className="p-12 text-center text-slate-400"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div></div>
                ) : threads.length > 0 ? (
                  threads.map((thread) => {
                    const isActive = activeThread?.documentId === thread.documentId;
                    const otherCompany = getOtherParticipant(thread);
                    return (
                      <div key={thread.documentId} onClick={() => setActiveThread(thread)} className={`p-5 border-b border-gray-100/50 cursor-pointer transition-all flex gap-4 ${isActive ? 'bg-white shadow-xl border-l-4 border-l-blue-600' : 'hover:bg-white/80'}`}>
                        <div className={`w-12 h-12 rounded-[1.25rem] bg-gradient-to-br ${isActive ? 'from-blue-600 to-indigo-700' : 'from-slate-700 to-slate-900'} flex items-center justify-center text-white font-black shrink-0 shadow-lg text-lg`}>
                           {otherCompany?.company_name?.substring(0, 1).toUpperCase() || 'E'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-baseline mb-1">
                            <h4 className={`text-xs font-black uppercase truncate ${isActive ? 'text-blue-600' : 'text-slate-900'}`}>{otherCompany?.company_name || 'ENQUIRY'}</h4>
                            <span className="text-[9px] text-slate-400 font-bold">{new Date(thread.last_message_at || thread.updatedAt).toLocaleDateString([], { month: '2-digit', day: '2-digit' })}</span>
                          </div>
                          <p className="text-[11px] text-slate-800 font-black truncate mb-1 uppercase tracking-tighter">{thread.title}</p>
                          <p className={`text-[10px] truncate ${isActive ? 'text-slate-500' : 'text-slate-400'}`}>{thread.last_message_preview || "System: Awaiting response..."}</p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <EmptyInbox message="No Enquiries Found" />
                )}
              </div>
            </div>

            <div className="md:col-span-8 flex flex-col h-full bg-white">
              {activeThread ? (
                <>
                  <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                    <div className="flex items-center gap-4">
                       <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black shadow-lg bg-slate-900">
                          {getOtherParticipant(activeThread)?.company_name?.substring(0, 1).toUpperCase() || 'E'}
                       </div>
                       <div>
                          <h3 className="font-black text-slate-900 text-sm tracking-tight uppercase">{getOtherParticipant(activeThread)?.company_name || 'ENQUIRY'}</h3>
                          <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest">{activeThread.title}</p>
                       </div>
                    </div>
                  </div>

                  <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-[#fcfdfe]">
                    {messagesLoading ? (
                      <div className="flex flex-col items-center justify-center h-full"><div className="w-12 h-12 border-4 border-blue-600/10 border-t-blue-600 rounded-full animate-spin"></div></div>
                    ) : messages.length > 0 ? (
                      messages.map((msg: any) => {
                        const isMe = Number(msg.sender_profile?.userId) === Number(user?.id);
                        return (
                          <div key={msg.documentId} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group max-w-full`}>
                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%]`}>
                              <div className="flex items-center gap-2 mb-1 px-1">
                                 <span className="text-[9px] font-black text-slate-400 uppercase">{msg.sender_profile?.full_name || 'Partner'}</span>
                                 <span className="text-[8px] text-slate-300 font-bold">{new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <div className={`px-4 py-3 rounded-2xl shadow-sm text-sm ${isMe ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'}`}>
                                <p className="leading-relaxed font-medium whitespace-pre-wrap">{msg.message_body}</p>
                                {msg.custom_attachments?.map((att: any, idx: number) => (
                                    <a key={idx} href={att.url} target="_blank" className={`p-2 rounded-xl flex items-center gap-2 border mt-2 ${isMe ? 'bg-blue-700/50 border-blue-500' : 'bg-gray-50 border-gray-100'}`}>
                                       <div className="w-6 h-6 rounded bg-blue-500 text-white flex items-center justify-center italic font-bold">D</div>
                                       <div className="text-[10px] font-black truncate max-w-[100px]">Doc-{idx+1}</div>
                                    </a>
                                ))}
                              </div>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full opacity-50"><p className="text-xs font-black uppercase tracking-widest">Start the Conversation</p></div>
                    )}
                    <div ref={messagesEndRef} />
                  </div>

                  <div className="p-6 bg-white border-t border-gray-100">
                    <form onSubmit={handleSendMessage} className="relative group">
                      <div className="flex items-end gap-3 bg-gray-50 border border-gray-200 rounded-[2rem] p-2 pl-6 pr-2 focus-within:border-blue-500 focus-within:bg-white focus-within:shadow-xl transition-all">
                        <textarea 
                          rows={1}
                          placeholder="Type your message..." 
                          className="flex-1 bg-transparent border-none outline-none py-3 text-sm text-slate-800 font-medium resize-none max-h-32"
                          value={newMessage}
                          onChange={(e) => setNewMessage(e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSendMessage(e as any); } }}
                          disabled={sending || uploading}
                        />
                        <div className="flex items-center gap-1">
                           <input type="file" className="hidden" ref={fileInputRef} onChange={handleFileUpload} multiple />
                           <button type="button" onClick={() => fileInputRef.current?.click()} className="p-2.5 text-slate-400 hover:text-blue-600" disabled={uploading}>
                             {uploading ? <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div> : <PaperclipIcon className="w-6 h-6" />}
                           </button>
                           <button type="submit" disabled={!newMessage.trim() || sending} className={`w-12 h-12 flex items-center justify-center rounded-full transition-all ${!newMessage.trim() || sending ? 'bg-gray-100 text-gray-300' : 'bg-blue-600 text-white shadow-lg shadow-blue-200 hover:scale-105'}`}>
                            {sending ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : <SendIcon className="w-6 h-6 rotate-45" />}
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

function SearchIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/></svg>; }
function PaperclipIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L20.5 13"/></svg>; }
function SendIcon(props: any) { return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path></svg>; }

function EmptyInbox({ message }: { message: string }) {
  return (
    <div className="p-12 text-center opacity-50">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4"><svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"/></svg></div>
      <p className="text-xs font-black uppercase tracking-widest">{message}</p>
    </div>
  );
}
