/**
 * useEnquirySocket – custom React hook
 *
 * Wraps socket.io-client to provide real-time messaging for enquiry threads.
 * Text messages use the socket (saves to DB + broadcasts in one step).
 * Binary file uploads still use the REST endpoint (uploadEnquiryMedia).
 *
 * Usage:
 *   const { connected, joinThread, leaveThread, sendMessage, setTyping } = useEnquirySocket({ token, onNewMessage });
 */

'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { EnquiryMessage } from '@/lib/enquiry';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.letsb2b.com';

interface UseEnquirySocketOptions {
  /** JWT token for authentication */
  token: string | null;
  /** Called every time a new message arrives from the server */
  onNewMessage: (message: EnquiryMessage) => void;
  /** Called when socket connects / disconnects */
  onConnectionChange?: (connected: boolean) => void;
  /** Called when a socket-level error occurs */
  onError?: (event: string, message: string) => void;
}

interface UseEnquirySocketReturn {
  /** True when the socket is connected and authenticated */
  connected: boolean;
  /** Join a thread room (call when user opens a thread) */
  joinThread: (threadId: string) => void;
  /** Leave a thread room (call when user closes a thread) */
  leaveThread: (threadId: string) => void;
  /** Send a plain-text message via socket */
  sendMessage: (threadId: string, body: string, attachments?: any[]) => void;
  /** Emit typing indicator */
  setTyping: (threadId: string, isTyping: boolean) => void;
}

export function useEnquirySocket({
  token,
  onNewMessage,
  onConnectionChange,
  onError,
}: UseEnquirySocketOptions): UseEnquirySocketReturn {
  const socketRef = useRef<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  // Keep latest callbacks in refs to avoid stale closure issues
  const onNewMessageRef = useRef(onNewMessage);
  onNewMessageRef.current = onNewMessage;

  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  useEffect(() => {
    if (!token) return;

    // Connect with JWT auth
    const socket = io(SOCKET_URL, {
      auth: { token },
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      reconnectionAttempts: 5,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on('connect', () => {
      console.log('[Socket] Connected:', socket.id);
      setConnected(true);
      onConnectionChange?.(true);
    });

    socket.on('disconnect', (reason) => {
      console.log('[Socket] Disconnected:', reason);
      setConnected(false);
      onConnectionChange?.(false);
    });

    socket.on('connect_error', (err) => {
      console.error('[Socket] Connection error:', err.message);
      setConnected(false);
      onConnectionChange?.(false);
    });

    // ── Real-time message received ────────────────────────────────────────────
    socket.on('new_message', (message: EnquiryMessage) => {
      console.log(`[Socket:IN] 📥 'new_message' received for thread ${message.documentId || 'unknown'}:`, message);
      onNewMessageRef.current(message);
    });

    // ── Thread join confirmation ──────────────────────────────────────────────
    socket.on('joined_thread', ({ threadId }: { threadId: string }) => {
      console.log('[Socket] Joined thread room:', threadId);
    });

    // ── Server-side error ─────────────────────────────────────────────────────
    socket.on('error', (err: { event: string; message: string }) => {
      console.error(`[Socket] Error on event "${err.event}":`, err.message);
      onErrorRef.current?.(err.event, err.message);
    });

    // ── Global debugging ──────────────────────────────────────────────────────
    socket.onAny((eventName, ...args) => {
      if (eventName !== 'new_message' && eventName !== 'joined_thread') {
         console.log(`[Socket:IN] 📡 Event Received: '${eventName}'`, args);
      }
    });

    return () => {
      socket.disconnect();
      socketRef.current = null;
      setConnected(false);
    };
  }, [token]); // only reconnects if token changes

  // ── Public API ──────────────────────────────────────────────────────────────

  const joinThread = useCallback((threadId: string) => {
    console.log(`[Socket:OUT] 🚪 Emitting 'join_thread' for: ${threadId}`);
    socketRef.current?.emit('join_thread', { threadId });
  }, []);

  const leaveThread = useCallback((threadId: string) => {
    console.log(`[Socket:OUT] 🔙 Emitting 'leave_thread' for: ${threadId}`);
    socketRef.current?.emit('leave_thread', { threadId });
  }, []);

  const sendMessage = useCallback(
    (threadId: string, body: string, attachments: any[] = []) => {
      console.log(`[Socket:OUT] Preparing to send message to thread ${threadId}:`, { body, attachments });
      if (!socketRef.current?.connected) {
        console.warn(`[Socket:OUT] ❌ Not connected – cannot send message to ${threadId}`);
        return;
      }
      
      const payload = {
        threadId,
        message_body: body,
        custom_attachments: attachments,
      };
      
      console.log(`[Socket:OUT] 🚀 Emitting 'send_message' event:`, payload);
      
      socketRef.current.emit('send_message', payload);
    },
    []
  );

  const setTyping = useCallback((threadId: string, isTyping: boolean) => {
    socketRef.current?.emit('typing', { threadId, isTyping });
  }, []);

  return {
    connected,
    joinThread,
    leaveThread,
    sendMessage,
    setTyping,
  };
}
