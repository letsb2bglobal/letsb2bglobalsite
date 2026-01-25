'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute, { useAuth } from '@/components/ProtectedRoute';
import { fetchUserConversations, fetchMessages, sendMessage, type Conversation, type Message } from '@/lib/messages';
import { getAllUserProfiles, type UserProfile } from '@/lib/profile';

export default function MessagesPage() {
  const router = useRouter();
  const user = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [profiles, setProfiles] = useState<Record<number, UserProfile>>({});
  const [activeConv, setActiveConv] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const fetchData = async () => {
      if (user?.id) {
        try {
          const convResponse = await fetchUserConversations(user.id);
          setConversations(convResponse.data || []);

          const profileResponse = await getAllUserProfiles();
          if (profileResponse?.data) {
            const profileMap: Record<number, UserProfile> = {};
            profileResponse.data.forEach(p => {
              profileMap[p.userId] = p;
            });
            setProfiles(profileMap);
          }
        } catch (error) {
          console.error("Error loading initial messaging data:", error);
        } finally {
          setLoading(false);
        }
      }
    };
    fetchData();
  }, [user]);

  useEffect(() => {
    const loadMessages = async () => {
      if (activeConv) {
        setMessagesLoading(true);
        try {
          const response = await fetchMessages(activeConv.id);
          setMessages(response.data || []);
        } catch (error) {
          console.error("Error loading messages:", error);
        } finally {
          setMessagesLoading(false);
        }
      } else {
        setMessages([]);
      }
    };
    loadMessages();
  }, [activeConv]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !activeConv || !user?.id || sending) return;

    setSending(true);
    try {
      const data = await sendMessage(activeConv.id, user.id, newMessage);
      // Optimistically add to UI or just refetch. Let's add manually for speed.
      const sentMsg: Message = data; 
      setMessages(prev => [...prev, sentMsg]);
      setNewMessage('');
    } catch (error) {
      console.error("Error sending message:", error);
      alert("Failed to send message");
    } finally {
      setSending(false);
    }
  };

  const getOtherUser = (conv: Conversation) => {
    const otherUserId = conv.userAId === user?.id ? conv.userBId : conv.userAId;
    return profiles[otherUserId];
  };

  const otherUserProfile = activeConv ? getOtherUser(activeConv) : null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-[#f3f2ef]">
        {/* Navigation Bar */}
        <div className="h-14 w-full bg-white border-b border-gray-200 sticky top-0 z-50 flex items-center px-4 md:px-20 justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/')}>
            <span className="text-blue-600 font-bold text-2xl italic">L</span>
            <span className="font-bold text-gray-800">LET'S B2B</span>
          </div>
          <h1 className="text-lg font-bold text-gray-800 hidden md:block">Messaging</h1>
          <button onClick={() => router.push('/')} className="text-gray-600 hover:text-gray-900 text-sm font-medium">Home</button>
        </div>

        <div className="max-w-6xl mx-auto mt-6 px-4 grid grid-cols-1 md:grid-cols-3 gap-0 h-[calc(100vh-100px)] bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          
          {/* Left: Conversation List */}
          <div className="md:col-span-1 border-r border-gray-100 flex flex-col h-full bg-gray-50/30">
            <div className="p-4 border-b border-gray-100 bg-white">
              <h2 className="font-bold text-gray-900">Recent Chats</h2>
            </div>
            <div className="flex-1 overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center"><div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mx-auto"></div></div>
              ) : conversations.length > 0 ? (
                conversations.map((conv) => {
                  const other = getOtherUser(conv);
                  const isActive = activeConv?.id === conv.id;
                  return (
                    <div 
                      key={conv.id} 
                      onClick={() => setActiveConv(conv)}
                      className={`p-4 border-b border-gray-50 cursor-pointer transition-all flex gap-3 ${isActive ? 'bg-white border-l-4 border-l-blue-600 shadow-sm' : 'hover:bg-gray-100'}`}
                    >
                      <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-lg shrink-0 border border-blue-200">
                        {other?.company_name?.substring(0, 1).toUpperCase() || '?'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-baseline">
                          <h4 className={`text-sm font-bold truncate ${isActive ? 'text-blue-600' : 'text-gray-900'}`}>
                            {other?.company_name || `User ${conv.userAId === user?.id ? conv.userBId : conv.userAId}`}
                          </h4>
                        </div>
                        <p className="text-xs text-gray-500 truncate mt-0.5">Click to chat</p>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="p-12 text-center text-gray-400 text-sm">No conversations yet.</div>
              )}
            </div>
          </div>

          {/* Right: Chat Window */}
          <div className="md:col-span-2 flex flex-col h-full bg-white relative">
            {activeConv ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-100 flex items-center gap-3 bg-white z-10">
                   <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 font-bold border border-blue-100">
                      {otherUserProfile?.company_name?.substring(0, 1).toUpperCase() || '?'}
                   </div>
                   <div>
                      <h3 className="font-bold text-gray-900 text-sm">{otherUserProfile?.company_name || 'Business Partner'}</h3>
                      <p className="text-[10px] text-green-500 font-bold uppercase tracking-wider">Active Workspace</p>
                   </div>
                </div>

                {/* Messages Area */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-[#f8f9fb]">
                  {messagesLoading ? (
                    <div className="flex items-center justify-center h-full">
                       <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                    </div>
                  ) : messages.length > 0 ? (
                    messages.map((msg) => {
                      const isMe = msg.senderUserId === user?.id;
                      return (
                        <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}>
                          <div className={`max-w-[75%] px-4 py-2 rounded-2xl shadow-sm text-sm ${
                            isMe 
                              ? 'bg-blue-600 text-white rounded-tr-none' 
                              : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
                          }`}>
                            <p className="leading-relaxed">{msg.message}</p>
                            <span className={`text-[9px] mt-1 block opacity-70 ${isMe ? 'text-right' : 'text-left'}`}>
                              {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center p-8">
                       <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-3">
                          <svg className="w-8 h-8 text-blue-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path></svg>
                       </div>
                       <p className="text-gray-400 text-sm italic">Start the conversation with {otherUserProfile?.company_name || 'this business partner'}</p>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Input Area */}
                <div className="p-4 border-t border-gray-100 bg-white">
                  <form onSubmit={handleSendMessage} className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-full px-4 py-1 focus-within:border-blue-500 focus-within:bg-white transition-all shadow-inner">
                    <input 
                      type="text" 
                      placeholder="Write a message..." 
                      className="flex-1 bg-transparent border-none outline-none py-2 text-sm text-gray-800"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      disabled={sending}
                    />
                    <button 
                      type="submit"
                      disabled={!newMessage.trim() || sending}
                      className={`p-1.5 rounded-full transition-all ${!newMessage.trim() || sending ? 'text-gray-300' : 'text-blue-600 hover:bg-blue-50'}`}
                    >
                      {sending ? (
                        <div className="w-5 h-5 border-2 border-blue-600/30 border-t-blue-600 rounded-full animate-spin"></div>
                      ) : (
                        <svg className="w-6 h-6 rotate-90" fill="currentColor" viewBox="0 0 24 24"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
                      )}
                    </button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-12 h-full">
                 <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-6 text-blue-400 opacity-60">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"></path></svg>
                 </div>
                 <h3 className="text-2xl font-bold text-gray-800">Your Business Messenger</h3>
                 <p className="text-gray-500 max-w-sm mt-3 leading-relaxed">
                   Select a partner from the sidebar to view your workspace and negotiate deals in real-time.
                 </p>
                 <button onClick={() => router.push('/')} className="mt-8 px-6 py-2.5 bg-blue-600 text-white font-bold rounded-full hover:bg-blue-700 transition-all text-sm shadow-lg shadow-blue-100">
                    Discover New Partners
                 </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
