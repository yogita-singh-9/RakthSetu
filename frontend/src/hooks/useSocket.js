import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';
import useAuthStore from '../store/useAuthStore';

/**
 * Dynamic socket URL — same hostname as the page, port 5000.
 * Works on any network without hardcoding IPs.
 */
const SOCKET_URL =
  import.meta.env.VITE_API_BASE_URL ||
  `${window.location.protocol}//${window.location.hostname}:5000`;

/**
 * Singleton socket instance so all components share one connection.
 * The first consumer to call useSocket() creates it; subsequent
 * consumers reuse the same connection.
 */
let socketInstance = null;
let consumerCount = 0;

function getSocket() {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      autoConnect: false,
    });
  }
  return socketInstance;
}

/**
 * useSocket — centralized Socket.IO hook
 *
 * Features:
 *  - Shared singleton connection across all components
 *  - Auto-registers user identity (userId + role) on connect
 *  - Supports queue room join/leave
 *  - Accepts event listeners for 'queue_updated' and 'notification'
 *  - Cleans up when last consumer unmounts
 *
 * @param {Object} options
 * @param {string}   [options.doctorId]      - Join this doctor's queue room
 * @param {function} [options.onQueueUpdate] - Callback for 'queue_updated' events
 * @param {function} [options.onNotification]- Callback for 'notification' events
 *
 * @returns {{ socket, joinQueue, leaveQueue }}
 */
export const useSocket = ({
  doctorId = null,
  onQueueUpdate = null,
  onNotification = null,
} = {}) => {
  const user = useAuthStore((state) => state.user);
  const socket = getSocket();

  // Keep latest callbacks in refs so event listeners don't go stale
  const onQueueUpdateRef = useRef(onQueueUpdate);
  const onNotificationRef = useRef(onNotification);

  useEffect(() => {
    onQueueUpdateRef.current = onQueueUpdate;
  }, [onQueueUpdate]);

  useEffect(() => {
    onNotificationRef.current = onNotification;
  }, [onNotification]);

  // ── Connect + register ────────────────────────────────────
  useEffect(() => {
    consumerCount++;

    const handleConnect = () => {
      console.log('[Socket] Connected to server');
      if (user?.uid && user?.role) {
        socket.emit('register', {
          userId: user.uid,
          role: user.role,
        });
        console.log(`[Socket] Registered as ${user.role} — ${user.uid}`);
      }
    };

    const handleDisconnect = (reason) => {
      console.log('[Socket] Disconnected:', reason);
    };

    const handleError = (err) => {
      console.error('[Socket] Error:', err);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('connect_error', handleError);

    // Connect if not already connected
    if (!socket.connected) {
      socket.connect();
    } else {
      // Already connected — register immediately
      handleConnect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('connect_error', handleError);

      consumerCount--;
      if (consumerCount <= 0) {
        consumerCount = 0;
        socket.disconnect();
        socketInstance = null;
      }
    };
  }, [user?.uid, user?.role]);

  // ── Queue room management ─────────────────────────────────
  useEffect(() => {
    if (!doctorId || !socket.connected) return;

    socket.emit('join_queue', { doctorId });

    return () => {
      socket.emit('leave_queue', { doctorId });
    };
  }, [doctorId, socket.connected]);

  // Re-join queue room after reconnection
  useEffect(() => {
    if (!doctorId) return;

    const handleReconnect = () => {
      socket.emit('join_queue', { doctorId });
    };

    socket.on('connect', handleReconnect);
    return () => socket.off('connect', handleReconnect);
  }, [doctorId]);

  // ── Event listeners ───────────────────────────────────────
  useEffect(() => {
    const handleQueueUpdate = (data) => {
      console.log('[Socket] queue_updated:', data);
      onQueueUpdateRef.current?.(data);
    };

    socket.on('queue_updated', handleQueueUpdate);
    return () => socket.off('queue_updated', handleQueueUpdate);
  }, []);

  useEffect(() => {
    const handleNotification = (data) => {
      console.log('[Socket] notification:', data);
      onNotificationRef.current?.(data);
    };

    socket.on('notification', handleNotification);
    return () => socket.off('notification', handleNotification);
  }, []);

  // ── Exposed helpers ───────────────────────────────────────
  const joinQueue = useCallback(
    (id) => socket.emit('join_queue', { doctorId: id }),
    []
  );

  const leaveQueue = useCallback(
    (id) => socket.emit('leave_queue', { doctorId: id }),
    []
  );

  return { socket, joinQueue, leaveQueue };
};

export default useSocket;
