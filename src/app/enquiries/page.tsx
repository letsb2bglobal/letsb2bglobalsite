'use client';

import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import ProtectedRoute, { useAuth } from '@/components/ProtectedRoute';
import PostCard from '@/components/home/PostCard';
import { getToken } from '@/lib/auth';
import {
  fetchEnquiryThreads,
  fetchEnquiryMessages,
  markThreadAsRead,
  uploadEnquiryMedia,
  fetchEnquiryThreadById,
  type EnquiryThread,
  type EnquiryMessage,
} from '@/lib/enquiry';
import { getPostByDocumentId, type Post } from '@/lib/posts';
import { useEnquirySocket } from '@/hooks/useEnquirySocket';
import { useToast } from '@/components/Toast';

function EnquiriesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const user = useAuth();
  const { showToast } = useToast();

  // ── Core state ──────────────────────────────────────────────────────────────
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

  // ── Socket state ────────────────────────────────────────────────────────────
  const [socketConnected, setSocketConnected] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [selectedPost, setSelectedPost] = useState<Post | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeStatus, setActiveStatus] = useState<string>('All');

  // ── Refs ────────────────────────────────────────────────────────────────────
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const activeThreadRef = useRef<EnquiryThread | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  activeThreadRef.current = activeThread;

  // ── Socket.io real-time connection ─────────────────────────────────────────
  const [token, setToken] = useState<string | null>(null);
  
  useEffect(() => {
    setToken(getToken());
  }, []);

  const { connected, joinThread, leaveThread, sendMessage: socketSend, setTyping } = useEnquirySocket({
    token,
    onNewMessage: (msg) => {
      // Only add message if it belongs to the currently open thread
      const threadDocId = (msg as any).thread?.documentId ?? (msg as any).thread;
      if (threadDocId === activeThreadRef.current?.documentId) {
        setMessages((prev) => {
          // De-duplicate: 1) by real documentId, 2) replace optimistic temp message if bodies match
          if (prev.some((m) => m.documentId === msg.documentId)) return prev;
          
          const tempIndex = prev.findIndex((m) => m.documentId.startsWith('temp-') && m.message_body === msg.message_body);
          if (tempIndex !== -1) {
             const updated = [...prev];
             updated[tempIndex] = msg;
             return updated;
          }

          return [...prev, msg];
        });
      }
      // Update thread list preview regardless
      setThreads((prev) =>
        prev.map((t) =>
          t.documentId === threadDocId
            ? { ...t, last_message_at: msg.createdAt, last_message_preview: msg.message_body }
            : t
        )
      );
    },
    onConnectionChange: setSocketConnected,
    onError: (event, message) => {
      if (event === 'send_message') {
        showToast(message || 'Failed to send message', 'error');
      } else if (event === 'join_thread') {
        console.error('[Socket] Cannot join thread:', message);
        showToast('Could not connect to thread. Please refresh.', 'error');
      } else {
        console.error(`[Socket] Error on "${event}":`, message);
      }
    },
  });

  // Keep socketConnected in sync with hook's reactive state
  useEffect(() => {
    setSocketConnected(connected);
  }, [connected]);

  // ── Scroll to bottom ────────────────────────────────────────────────────────
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  // ── Initial Data Fetch ──────────────────────────────────────────────────────
  const threadIdParam = searchParams.get('threadId');
  const postIdParam = searchParams.get('postId');

  useEffect(() => {
    const loadStaticData = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const { checkUserProfile } = await import('@/lib/profile');
        const [threadList, profile] = await Promise.all([
          fetchEnquiryThreads(),
          checkUserProfile(user.id),
        ]);
        setThreads(threadList || []);
        setMyProfile(profile);

        // URL context: open thread from query param
        if (threadIdParam) {
          const found = threadList.find((t) => t.documentId === threadIdParam);
          if (found) {
            setActiveThread(found);
          } else {
            const t = await fetchEnquiryThreadById(threadIdParam);
            if (t) {
              setActiveThread(t);
              setThreads((prev) => [t, ...prev]);
            }
          }
        }

        // Load TradeWall post context when coming from a Respond action
        if (postIdParam) {
          try {
            const post = await getPostByDocumentId(postIdParam);
            setSelectedPost(post);
          } catch (err) {
            console.error('Failed to load post for enquiry context:', err);
            setSelectedPost(null);
          }
        } else {
          setSelectedPost(null);
        }
      } catch (error) {
        console.error('Enquiry sync failed:', error);
      } finally {
        setLoading(false);
      }
    };
    loadStaticData();
  }, [user?.id, threadIdParam, postIdParam]);


  // ── Load messages + join/leave socket room when active thread changes ───────
  useEffect(() => {
    if (!activeThread) {
      setMessages([]);
      setTypingUsers([]);
      return;
    }

    // Join socket room for real-time updates
    joinThread(activeThread.documentId);

    const loadHistory = async () => {
      setMessagesLoading(true);
      try {
        const msgList = await fetchEnquiryMessages(activeThread.documentId);
        setMessages(msgList);
        if (user?.id) await markThreadAsRead(activeThread.documentId, user.id);
      } catch (error) {
        console.error('Error loading enquiry messages:', error);
      } finally {
        setMessagesLoading(false);
      }
    };

    loadHistory();

    return () => {
      leaveThread(activeThread.documentId);
      setTypingUsers([]);
    };
  }, [activeThread?.documentId, user?.id]);

  // ── Typing indicator debounce ───────────────────────────────────────────────
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setNewMessage(e.target.value);
    e.currentTarget.style.height = 'auto';
    e.currentTarget.style.height = `${e.currentTarget.scrollHeight}px`;

    if (activeThread) {
      setTyping(activeThread.documentId, true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setTyping(activeThread.documentId, false);
      }, 1500);
    }
  };

  // ── Send message ────────────────────────────────────────────────────────────
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && selectedFiles.length === 0) || sending || uploading || !activeThread) return;

    // Stop typing indicator immediately
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
    setTyping(activeThread.documentId, false);

    setSending(true);
    try {
      if (selectedFiles.length > 0) {
        // File uploads → REST (socket.io is not suited for binary data)
        setUploading(true);
        const result = await uploadEnquiryMedia(
          activeThread.documentId,
          newMessage.trim() || 'Sent an attachment',
          selectedFiles
        );
        // Optimistically add to local state (de-duplicate if socket broadcasts it later)
        setMessages((prev) => {
          if (prev.some((m) => m.documentId === result.data?.documentId)) return prev;
          return [...prev, result.data];
        });
        setSelectedFiles([]);
        setFilePreviews([]);
      } else {
        // Plain text → socket (saves to DB + broadcasts in one step)
        if (myProfile) {
          const optimisticMsg: EnquiryMessage = {
            id: Date.now(),
            documentId: `temp-${Date.now()}`,
            message_body: newMessage.trim(),
            sender_profile: myProfile,
            sender_profile_id: String(
              myProfile?.documentId ?? myProfile?.userId ?? user?.id ?? 0
            ),
            createdAt: new Date().toISOString(),
          };
          setMessages((prev) => [...prev, optimisticMsg as EnquiryMessage]);
          
          // Move the thread preview to the top optimistically as well
          setThreads((prev) => {
            const index = prev.findIndex((t) => t.documentId === activeThread.documentId);
            if (index > -1) {
              const updatedThreads = [...prev];
              updatedThreads[index] = {
                ...updatedThreads[index],
                last_message_at: optimisticMsg.createdAt,
                last_message_preview: optimisticMsg.message_body
              };
              // Sort by descending last_message_at
              return updatedThreads.sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
            }
            return prev;
          });
          
          setTimeout(() => scrollToBottom(), 50);
        }
        socketSend(activeThread.documentId, newMessage.trim());
      }
      setNewMessage('');
      // Reset textarea height
      const textarea = document.querySelector<HTMLTextAreaElement>('textarea[data-msg-input]');
      if (textarea) textarea.style.height = 'auto';
    } catch (error: any) {
      showToast(error.message || 'Failed to send message', 'error');
    } finally {
      setSending(false);
      setUploading(false);
    }
  };

  // ── File handling ───────────────────────────────────────────────────────────
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newFiles = Array.from(files);
    setSelectedFiles((prev) => [...prev, ...newFiles]);

    newFiles.forEach((file) => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (ev) => {
          setFilePreviews((prev) => [...prev, { url: ev.target?.result as string, name: file.name, type: 'image' }]);
        };
        reader.readAsDataURL(file);
      } else {
        setFilePreviews((prev) => [...prev, { url: '', name: file.name, type: 'file' }]);
      }
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setFilePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const getOtherParticipant = (thread: EnquiryThread) => {
    if (!myProfile?.documentId || !thread) return null;
    if (thread.from_company?.documentId === myProfile.documentId) return thread.to_company;
    return thread.from_company;
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <ProtectedRoute>
      <div className="bg-[#f1f3f6] overflow-hidden">
        <div className="max-w-7xl mx-auto md:px-4 flex flex-col pt-[72px]">
          <div className="mt-0 md:mt-4 flex-1 min-h-0 grid grid-cols-1 md:grid-cols-12 bg-white md:rounded-3xl border border-gray-200 shadow-xl overflow-hidden">

            {/* ── Thread List ─────────────────────────────────────────────── */}
            <div className={`md:col-span-4 border-r border-gray-100 flex flex-col h-full bg-slate-50 min-h-0 ${activeThread ? 'hidden md:flex' : 'flex'}`}>
              <div className="bg-white shrink-0">
                {/* Category tabs */}
                <div className="flex items-center gap-4 px-6 pt-4 border-b border-slate-100 overflow-x-auto scrollbar-hide">
                  {['All', 'Accommodation', 'Tours', 'Transport', 'MICE', 'Medical Tourism'].map((label) => {
                    const active = activeCategory === label;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => setActiveCategory(label)}
                        className={`relative pb-3 text-[12px] font-semibold whitespace-nowrap ${
                          active ? 'text-[#6B3FA0]' : 'text-slate-500 hover:text-slate-800'
                        }`}
                      >
                        {label}
                        {active && (
                          <span className="absolute left-0 right-0 -bottom-[1px] h-[2px] bg-[#6B3FA0] rounded-full" />
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="px-6 pt-3 pb-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <h2 className="text-[13px] font-bold text-slate-600 uppercase tracking-widest">
                      Enquiry
                    </h2>
                    <span className="text-[11px] text-slate-400 font-semibold">
                      {threads.length} connections
                    </span>
                  </div>

                  <div className="relative">
                    <SearchIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search by name"
                      className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-[12px] outline-none placeholder:text-slate-400"
                    />
                  </div>

                  {/* Status filters */}
                  <div className="flex flex-wrap items-center gap-2">
                    {['All', 'Open', 'Accepted', 'Rejected', 'Draft'].map((status) => {
                      const active = activeStatus === status;
                      return (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setActiveStatus(status)}
                          className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${
                            active
                              ? 'bg-[#6B3FA0] text-white border-[#6B3FA0]'
                              : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-[#6B3FA0]/40'
                          }`}
                        >
                          {status}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar">
                {loading ? (
                  <div className="p-12 text-center text-slate-400">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto" />
                  </div>
                ) : threads.length > 0 ? (
                    threads.map((thread) => {
                    const isActive = activeThread?.documentId === thread.documentId;
                    const otherCompany = getOtherParticipant(thread);
                      // Prefer actual company name; if missing, derive from thread title (strip "Enquiry:" prefix)
                      const derivedNameFromTitle =
                        thread.title?.replace(/^Enquiry:/i, "").trim() || undefined;
                      const companyName =
                        otherCompany?.company_name || derivedNameFromTitle || "Enquiry";
                      const initial = companyName.substring(0, 2).toUpperCase();
                      const preview =
                        thread.last_message_preview ||
                        "A private tourist vehicle with an experienced local driver is required for a family leisure trip in Kerala";
                    return (
                      <div
                        key={thread.documentId}
                        onClick={() => setActiveThread(thread)}
                          className={`px-4 py-3 border-b border-gray-100/50 cursor-pointer transition-all ${
                            isActive ? 'bg-white shadow-md z-10' : 'hover:bg-white'
                          }`}
                      >
                          <div className="flex gap-3">
                            <div className="mt-1">
                              <div className="w-9 h-9 rounded-full bg-[#f3e9ff] flex items-center justify-center text-[11px] font-bold text-[#6B3FA0] overflow-hidden">
                                {otherCompany?.profileImageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={otherCompany.profileImageUrl as string}
                                    alt={companyName}
                                    className="w-full h-full object-cover"
                                  />
                                ) : (
                                  initial
                                )}
                              </div>
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline justify-between">
                                <h4 className="text-[12px] font-semibold text-slate-900 truncate">
                                  {companyName}
                                </h4>
                                <span className="text-[10px] text-slate-400 font-medium shrink-0 ml-2">
                                  {new Date(thread.last_message_at || thread.updatedAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit',
                                  })}
                                </span>
                              </div>
                              <p className="text-[11px] font-semibold text-slate-900 truncate mt-0.5">
                                {thread.title}
                              </p>
                              <p className="text-[10px] text-slate-500 truncate mt-0.5">
                                {preview}
                              </p>
                            </div>
                          </div>
                      </div>
                    );
                  })
                ) : (
                  <EmptyInbox message="No Enquiries Found" />
                )}
              </div>
            </div>

            {/* ── Chat Panel ──────────────────────────────────────────────── */}
            <div className={`md:col-span-8 flex flex-col h-full bg-white relative min-h-0 ${activeThread ? 'flex' : 'hidden md:flex'}`}>
              {activeThread ? (
                <>
                  {/* Header */}
                  <div className="p-3 md:p-5 border-b border-gray-100 flex items-center justify-between bg-white/90 backdrop-blur-xl shrink-0 z-50">
                    <div className="flex items-center gap-3 md:gap-4 flex-1 min-w-0">
                      <button
                        onClick={() => setActiveThread(null)}
                        className="p-2 -ml-2 text-slate-400 hover:text-slate-600 md:hidden"
                      >
                        <ChevronLeftIcon className="w-6 h-6" />
                      </button>
                      <div className="w-9 h-9 md:w-10 md:h-10 rounded-full flex items-center justify-center text-white font-black shadow-md bg-[#6B3FA0] shrink-0 overflow-hidden">
                        {getOtherParticipant(activeThread)?.profileImageUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={getOtherParticipant(activeThread)?.profileImageUrl as string}
                            alt={getOtherParticipant(activeThread)?.company_name || "Partner"}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (getOtherParticipant(activeThread)?.company_name || "EN")
                            .substring(0, 2)
                            .toUpperCase()
                        )}
                      </div>
                      <div className="truncate">
                        <h3 className="font-semibold text-slate-900 text-xs md:text-sm truncate">
                          {getOtherParticipant(activeThread)?.company_name || 'Holiday Inn'}
                        </h3>
                        <div className="flex items-center gap-2">
                          <span className={`flex h-1.5 w-1.5 rounded-full ${socketConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-400'}`} />
                          <span className="text-[9px] text-slate-400 font-medium">
                            {socketConnected ? 'Live enquiry' : 'Connecting…'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Selected TradeWall post context */}
                  {selectedPost && (
                    <div className="px-4 md:px-8 pt-4 pb-2 border-b border-gray-100 bg-slate-50/60">
                      {/* Top header: logo + name + actions */}
                      {/* <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-[#f3e9ff] flex items-center justify-center overflow-hidden text-[12px] font-bold text-[#6B3FA0]">
                            {selectedPost.user_profile?.profileImageUrl ? (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={selectedPost.user_profile.profileImageUrl}
                                alt={selectedPost.user_profile.company_name || "Company"}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              (selectedPost.user_profile?.company_name || "EN")
                                .substring(0, 2)
                                .toUpperCase()
                            )}
                          </div>
                          <span className="text-[13px] font-semibold text-slate-900">
                            {selectedPost.user_profile?.company_name || "Holiday Inn"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-full text-[11px] font-semibold border border-red-500 text-red-500 hover:bg-red-50"
                          >
                            Reject
                          </button>
                          <button
                            type="button"
                            className="px-3 py-1.5 rounded-full text-[11px] font-semibold border border-emerald-500 text-white bg-emerald-500 hover:bg-emerald-600"
                          >
                            Accept
                          </button>
                        </div>
                      </div> */}

                      {/* Reuse PostCard UI for the selected TradeWall post */}
                      <PostCard
                        author={{
                          name:
                            selectedPost.user_profile?.company_name ||
                            selectedPost.title ||
                            "B2B Partner",
                          avatar: "",
                          isFollowing: false,
                        }}
                        time={new Date(selectedPost.createdAt).toLocaleDateString()}
                        title={selectedPost.title || "B2B Opportunity"}
                        description={selectedPost.description || ""}
                        type={selectedPost.type}
                        details={selectedPost.enquiry_details?.[0] || {}}
                        location={selectedPost.destination || ""}
                        date=""
                        // guests={selectedPost.guests || ""}
                        tags={selectedPost.tags || []}
                        imageUrl={
                          selectedPost.media_items?.[0]?.url ||
                          selectedPost.media?.[0]?.url ||
                          selectedPost.custom_attachments?.[0]?.url
                        }
                        budget={selectedPost.budget}
                        mediaItems={selectedPost.media_items}
                        postDocumentId={selectedPost.documentId}
                        authorProfileId={selectedPost.user_profile?.documentId}
                        authorProfileNumericId={selectedPost.user_profile?.id}
                        currentUserProfileId={undefined}
                        connectionDocumentId={undefined}
                        onFollowChange={undefined}
                        hideFooterActions
                      />
                    </div>
                  )}

                  {/* Messages */}
                  <div
                    className="flex-1 overflow-y-auto p-4 md:p-8 space-y-4 custom-scrollbar bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-fixed min-h-0"
                    style={{ scrollBehavior: 'smooth' }}
                  >
                    {messagesLoading ? (
                      <div className="flex flex-col items-center justify-center h-full gap-4">
                        <div className="w-16 h-16 border-8 border-blue-600/10 border-t-blue-600 rounded-full animate-spin" />
                        <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">Loading Records</p>
                      </div>
                    ) : messages.length > 0 ? (
                      messages.map((msg: any) => {
                        const sProfile = msg.sender_profile;
                        
                        const isMe = sProfile ? (
                          sProfile.documentId === myProfile?.documentId ||
                          sProfile === myProfile?.documentId ||
                          Number(sProfile.userId) === Number(user?.id)
                        ) : false;

                        // console.log(`[Msg Align] msg ID: ${msg.id}`, { msgSender: sProfile?.documentId, myDoc: myProfile?.documentId, isMe });

                        return (
                          <div key={msg.documentId} className={`flex ${isMe ? 'justify-end' : 'justify-start'} group mb-2`}>
                            <div className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} max-w-[85%] md:max-w-[70%]`}>
                              <div
                                className={`px-4 py-3 rounded-2xl shadow-sm text-[13px] font-medium leading-relaxed relative ${
                                  isMe
                                    ? 'bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-tr-none'
                                    : 'bg-white text-slate-800 border border-slate-100 rounded-tl-none'
                                }`}
                              >
                                <p className="whitespace-pre-wrap">{msg.message_body}</p>

                                {/* Attachments */}
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
                                        return (
                                          <div key={i} className={`rounded-xl overflow-hidden border ${isMe ? 'border-white/10 bg-black/5' : 'border-slate-100 bg-slate-50'} shadow-sm`}>
                                            {isImg ? (
                                              <img
                                                src={m.url}
                                                alt="Shared"
                                                className="max-w-full max-h-64 object-cover cursor-pointer hover:opacity-90 transition"
                                                onClick={() => window.open(m.url, '_blank')}
                                              />
                                            ) : isVid ? (
                                              <video src={m.url} className="max-w-full max-h-64 cursor-pointer" controls />
                                            ) : (
                                              <a
                                                href={m.url}
                                                download
                                                target="_blank"
                                                rel="noreferrer"
                                                className={`p-3 flex items-center gap-3 transition-colors ${isMe ? 'hover:bg-black/10' : 'hover:bg-slate-100'}`}
                                              >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shadow-sm ${isMe ? 'bg-white text-blue-600' : 'bg-blue-600 text-white'}`}>
                                                  <PaperclipIcon className="w-4 h-4" />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                  <p className={`text-[10px] font-black truncate uppercase tracking-tighter ${isMe ? 'text-white' : 'text-slate-900'}`}>
                                                    {m.name || `Attachment ${i + 1}`}
                                                  </p>
                                                  <p className={`text-[8px] font-bold uppercase opacity-60 ${isMe ? 'text-white/80' : 'text-slate-400'}`}>
                                                    Download File
                                                  </p>
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
                      <div className="flex flex-col items-center justify-center h-full opacity-50">
                        <p className="text-xs font-black uppercase tracking-widest">Start the Conversation</p>
                      </div>
                    )}

                    {/* Typing indicator */}
                    {typingUsers.length > 0 && (
                      <div className="flex justify-start">
                        <div className="bg-white border border-slate-100 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm flex items-center gap-2">
                          <span className="flex gap-1">
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </span>
                          <span className="text-[10px] text-slate-400 italic font-bold">typing…</span>
                        </div>
                      </div>
                    )}

                    <div ref={messagesEndRef} />
                  </div>

                  {/* Input bar */}
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
                          data-msg-input
                          rows={1}
                          placeholder="Type your response..."
                          className="flex-1 bg-transparent border-none outline-none py-3 text-sm text-slate-900 font-medium placeholder:text-slate-400 resize-none max-h-40 overflow-y-auto custom-scrollbar"
                          value={newMessage}
                          onChange={handleTextChange}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && !e.shiftKey) {
                              e.preventDefault();
                              handleSendMessage(e as any);
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
                            className={`w-12 h-12 flex items-center justify-center rounded-2xl transition-all ${
                              (!newMessage.trim() && selectedFiles.length === 0) || sending || uploading
                                ? 'bg-gray-100 text-gray-300'
                                : 'bg-blue-600 text-white shadow-lg shadow-blue-100 hover:scale-110 active:scale-95'
                            }`}
                          >
                            {sending || uploading ? (
                              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
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
                <div className="flex flex-col items-center justify-center text-center p-12 h-full">
                  <h3 className="text-2xl font-black text-slate-900 mb-2">SELECT AN ENQUIRY</h3>
                  <p className="text-slate-500 max-w-sm">Pick a thread from the list to view negotiation history and shared files.</p>
                </div>
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
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f8f9fb] flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
        </div>
      }
    >
      <EnquiriesContent />
    </Suspense>
  );
}

// ── Inline SVG Icons ──────────────────────────────────────────────────────────
function ChevronLeftIcon(props: any) {
  return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M15 19l-7-7 7-7" /></svg>;
}
function SearchIcon(props: any) {
  return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>;
}
function PaperclipIcon(props: any) {
  return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.414a6 6 0 108.486 8.486L20.5 13" /></svg>;
}
function SendIcon(props: any) {
  return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>;
}
function XIcon(props: any) {
  return <svg {...props} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>;
}

function EmptyInbox({ message }: { message: string }) {
  return (
    <div className="p-12 text-center opacity-50">
      <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
      </div>
      <p className="text-xs font-black uppercase tracking-widest">{message}</p>
    </div>
  );
}
