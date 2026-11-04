import { useEffect, useRef, useState, useCallback } from 'react';
import { User, BoardFrame, BoardElement } from '../types/board';

interface UsePurrBoardSocketProps {
  roomId: string;
  currentUser: User;
  onInitState?: (state: {
    roomId: string;
    name: string;
    frames: BoardFrame[];
    activeFrameId: string;
    users: User[];
  }) => void;
  onUserJoined?: (user: User, users: User[]) => void;
  onUserLeft?: (userId: string, users: User[]) => void;
  onRemoteCursor?: (userId: string, cursor: { x: number; y: number } | null) => void;
  onRemoteLaser?: (userId: string, point: { x: number; y: number }, authorColor: string) => void;
  onRemoteElementCreated?: (frameId: string, element: BoardElement) => void;
  onRemoteElementUpdated?: (frameId: string, elementId: string, updates: Partial<BoardElement>) => void;
  onRemoteElementDeleted?: (frameId: string, elementId: string) => void;
  onRemoteFrameCreated?: (frame: BoardFrame, activeFrameId: string) => void;
  onRemoteFrameSwitched?: (activeFrameId: string) => void;
  onRemoteFrameBgUpdated?: (frameId: string, bg: any, bgColor: string) => void;
  onRemoteFrameDeleted?: (deletedFrameId: string, frames: BoardFrame[], activeFrameId: string) => void;
  onRemoteFrameCleared?: (frameId: string) => void;
  onRemoteBoardRenamed?: (name: string) => void;
}

export function usePurrBoardSocket({
  roomId,
  currentUser,
  onInitState,
  onUserJoined,
  onUserLeft,
  onRemoteCursor,
  onRemoteLaser,
  onRemoteElementCreated,
  onRemoteElementUpdated,
  onRemoteElementDeleted,
  onRemoteFrameCreated,
  onRemoteFrameSwitched,
  onRemoteFrameBgUpdated,
  onRemoteFrameDeleted,
  onRemoteFrameCleared,
  onRemoteBoardRenamed,
}: UsePurrBoardSocketProps) {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Keep latest callbacks in refs to avoid reconnection loops
  const callbacksRef = useRef({
    onInitState,
    onUserJoined,
    onUserLeft,
    onRemoteCursor,
    onRemoteLaser,
    onRemoteElementCreated,
    onRemoteElementUpdated,
    onRemoteElementDeleted,
    onRemoteFrameCreated,
    onRemoteFrameSwitched,
    onRemoteFrameBgUpdated,
    onRemoteFrameDeleted,
    onRemoteFrameCleared,
    onRemoteBoardRenamed,
  });

  useEffect(() => {
    callbacksRef.current = {
      onInitState,
      onUserJoined,
      onUserLeft,
      onRemoteCursor,
      onRemoteLaser,
      onRemoteElementCreated,
      onRemoteElementUpdated,
      onRemoteElementDeleted,
      onRemoteFrameCreated,
      onRemoteFrameSwitched,
      onRemoteFrameBgUpdated,
      onRemoteFrameDeleted,
      onRemoteFrameCleared,
      onRemoteBoardRenamed,
    };
  });

  const connect = useCallback(() => {
    if (typeof window === 'undefined') return;

    try {
      const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
      const wsUrl = `${protocol}//${window.location.host}/api/ws`;

      const ws = new WebSocket(wsUrl);
      wsRef.current = ws;

      ws.onopen = () => {
        setIsConnected(true);
        setIsReconnecting(false);

        // Send join payload
        ws.send(
          JSON.stringify({
            type: 'join',
            roomId,
            payload: { user: currentUser },
          })
        );
      };

      ws.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          const { type, payload } = msg;

          switch (type) {
            case 'init':
              callbacksRef.current.onInitState?.(payload);
              break;
            case 'user:joined':
              callbacksRef.current.onUserJoined?.(payload.user, payload.users);
              break;
            case 'user:left':
              callbacksRef.current.onUserLeft?.(payload.userId, payload.users);
              break;
            case 'cursor:moved':
              callbacksRef.current.onRemoteCursor?.(payload.userId, payload.cursor);
              break;
            case 'laser:point':
              callbacksRef.current.onRemoteLaser?.(payload.userId, payload.point, payload.authorColor);
              break;
            case 'element:created':
              callbacksRef.current.onRemoteElementCreated?.(payload.frameId, payload.element);
              break;
            case 'element:updated':
              callbacksRef.current.onRemoteElementUpdated?.(
                payload.frameId,
                payload.elementId,
                payload.updates
              );
              break;
            case 'element:deleted':
              callbacksRef.current.onRemoteElementDeleted?.(payload.frameId, payload.elementId);
              break;
            case 'frame:created':
              callbacksRef.current.onRemoteFrameCreated?.(payload.frame, payload.activeFrameId);
              break;
            case 'frame:switched':
              callbacksRef.current.onRemoteFrameSwitched?.(payload.activeFrameId);
              break;
            case 'frame:bg_updated':
              callbacksRef.current.onRemoteFrameBgUpdated?.(
                payload.frameId,
                payload.background,
                payload.backgroundColor
              );
              break;
            case 'frame:deleted':
              callbacksRef.current.onRemoteFrameDeleted?.(
                payload.deletedFrameId,
                payload.frames,
                payload.activeFrameId
              );
              break;
            case 'frame:cleared':
              callbacksRef.current.onRemoteFrameCleared?.(payload.frameId);
              break;
            case 'board:renamed':
              callbacksRef.current.onRemoteBoardRenamed?.(payload.name);
              break;
          }
        } catch (err) {
          console.error('Error handling WebSocket message:', err);
        }
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Attempt reconnect after delay
        if (!reconnectTimeoutRef.current) {
          setIsReconnecting(true);
          reconnectTimeoutRef.current = setTimeout(() => {
            reconnectTimeoutRef.current = null;
            connect();
          }, 2500);
        }
      };

      ws.onerror = () => {
        // Will trigger onclose
      };
    } catch (err) {
      console.warn('WebSocket connection attempt failed, will retry:', err);
    }
  }, [roomId, currentUser.id]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  // Emit helper
  const emit = useCallback(
    (type: string, payload: any) => {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type,
            roomId,
            payload,
          })
        );
      }
    },
    [roomId]
  );

  // Send methods
  const sendCursor = useCallback(
    (cursor: { x: number; y: number } | null) => {
      emit('cursor', { cursor });
    },
    [emit]
  );

  const sendLaser = useCallback(
    (point: { x: number; y: number }, authorColor: string) => {
      emit('laser', { point, authorColor });
    },
    [emit]
  );

  const sendCreateElement = useCallback(
    (frameId: string, element: BoardElement) => {
      emit('element:create', { frameId, element });
    },
    [emit]
  );

  const sendUpdateElement = useCallback(
    (frameId: string, elementId: string, updates: Partial<BoardElement>) => {
      emit('element:update', { frameId, elementId, updates });
    },
    [emit]
  );

  const sendDeleteElement = useCallback(
    (frameId: string, elementId: string) => {
      emit('element:delete', { frameId, elementId });
    },
    [emit]
  );

  const sendCreateFrame = useCallback(
    (frame: BoardFrame) => {
      emit('frame:create', { frame });
    },
    [emit]
  );

  const sendSwitchFrame = useCallback(
    (frameId: string) => {
      emit('frame:switch', { frameId });
    },
    [emit]
  );

  const sendUpdateFrameBg = useCallback(
    (frameId: string, background: any, backgroundColor: string) => {
      emit('frame:update_bg', { frameId, background, backgroundColor });
    },
    [emit]
  );

  const sendDeleteFrame = useCallback(
    (frameId: string) => {
      emit('frame:delete', { frameId });
    },
    [emit]
  );

  const sendClearFrame = useCallback(
    (frameId: string) => {
      emit('frame:clear', { frameId });
    },
    [emit]
  );

  const sendRenameBoard = useCallback(
    (name: string) => {
      emit('board:rename', { name });
    },
    [emit]
  );

  return {
    isConnected,
    isReconnecting,
    sendCursor,
    sendLaser,
    sendCreateElement,
    sendUpdateElement,
    sendDeleteElement,
    sendCreateFrame,
    sendSwitchFrame,
    sendUpdateFrameBg,
    sendDeleteFrame,
    sendClearFrame,
    sendRenameBoard,
  };
}
