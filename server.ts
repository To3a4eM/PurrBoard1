import express from 'express';
import { createServer } from 'http';
import { WebSocketServer, WebSocket } from 'ws';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '20mb' }));

// In-memory Room State for real-time collaborative Whiteboard
export interface UserState {
  id: string;
  name: string;
  avatar: string;
  color: string;
  cursor?: { x: number; y: number } | null;
  lastActive: number;
}

export interface BoardFrame {
  id: string;
  title: string;
  elements: any[];
  background: 'paw' | 'dots' | 'grid' | 'blank';
  backgroundColor: string;
}

export interface RoomState {
  id: string;
  name: string;
  frames: BoardFrame[];
  activeFrameId: string;
  users: Map<string, UserState>;
  clients: Map<string, WebSocket>;
  createdAt: number;
}

const rooms = new Map<string, RoomState>();

function createDefaultFrames(): BoardFrame[] {
  return [
    {
      id: 'frame-1',
      title: 'Уютный кадр 1',
      background: 'paw',
      backgroundColor: '#faf7f2',
      elements: [
        {
          id: 'welcome-sticky-1',
          type: 'sticky',
          style: 'cat-ears',
          x: 220,
          y: 140,
          width: 220,
          height: 220,
          rotation: -2,
          zIndex: 1,
          authorId: 'system',
          authorName: 'КотоБорд',
          color: '#FEF08A', // pastel yellow
          text: '🐾 Мяу! Добро пожаловать в PurrBoard!\n\nРисуй, клей стикеры с ушками и делись идеями с друзьями в реальном времени! 🐱✨',
          fontSize: 16,
          fontFamily: 'Quicksand',
          textAlign: 'center',
        },
        {
          id: 'welcome-sticker-1',
          type: 'sticker',
          x: 480,
          y: 130,
          width: 170,
          height: 170,
          rotation: 4,
          zIndex: 2,
          authorId: 'system',
          authorName: 'КотоБорд',
          stickerId: 'loaf-cat',
          name: 'Котик-батончик',
        },
        {
          id: 'welcome-sticky-2',
          type: 'sticky',
          style: 'cat-face',
          x: 680,
          y: 170,
          width: 230,
          height: 230,
          rotation: 3,
          zIndex: 3,
          authorId: 'system',
          authorName: 'КотоБорд',
          color: '#FBCFE8', // pastel pink
          text: '🧶 Попробуй инструменты слева:\n\n• Кисть и карандаш\n• Лазерная указка\n• Фигуры-лапки и сердечки\n• Загрузка картинок и GIF!',
          fontSize: 15,
          fontFamily: 'Quicksand',
          textAlign: 'center',
        },
      ],
    },
  ];
}

function getOrCreateRoom(roomId: string): RoomState {
  if (!rooms.has(roomId)) {
    const defaultFrames = createDefaultFrames();
    rooms.set(roomId, {
      id: roomId,
      name: 'Мурчащая доска',
      frames: defaultFrames,
      activeFrameId: defaultFrames[0].id,
      users: new Map(),
      clients: new Map(),
      createdAt: Date.now(),
    });
  }
  return rooms.get(roomId)!;
}

// Attach WebSocket Server
const wss = new WebSocketServer({ server, path: '/api/ws' });

wss.on('connection', (ws: WebSocket) => {
  let currentRoomId: string | null = null;
  let currentUserId: string | null = null;

  ws.on('message', (data: string) => {
    try {
      const msg = JSON.parse(data.toString());
      const { type, roomId, payload } = msg;

      if (!roomId) return;
      const room = getOrCreateRoom(roomId);

      switch (type) {
        case 'join': {
          if (!payload?.user?.id) break;
          const userId: string = payload.user.id;
          currentRoomId = roomId;
          currentUserId = userId;

          room.users.set(userId, {
            ...payload.user,
            lastActive: Date.now(),
          });
          room.clients.set(userId, ws);

          // Send current state to newly joined client
          ws.send(
            JSON.stringify({
              type: 'init',
              payload: {
                roomId: room.id,
                name: room.name,
                frames: room.frames,
                activeFrameId: room.activeFrameId,
                users: Array.from(room.users.values()),
              },
            })
          );

          // Broadcast user joined to other clients in room
          broadcastToRoom(room, ws, {
            type: 'user:joined',
            payload: {
              user: room.users.get(userId),
              users: Array.from(room.users.values()),
            },
          });
          break;
        }

        case 'board:rename': {
          if (payload.name) {
            room.name = payload.name;
            broadcastToRoom(room, null, {
              type: 'board:renamed',
              payload: { name: room.name },
            });
          }
          break;
        }

        case 'cursor': {
          if (currentUserId && room.users.has(currentUserId)) {
            const user = room.users.get(currentUserId)!;
            user.cursor = payload.cursor;
            user.lastActive = Date.now();

            broadcastToRoom(room, ws, {
              type: 'cursor:moved',
              payload: {
                userId: currentUserId,
                cursor: payload.cursor,
              },
            });
          }
          break;
        }

        case 'laser': {
          if (currentUserId) {
            broadcastToRoom(room, ws, {
              type: 'laser:point',
              payload: {
                userId: currentUserId,
                point: payload.point,
                authorColor: payload.authorColor,
              },
            });
          }
          break;
        }

        case 'element:create': {
          const frame = room.frames.find((f) => f.id === payload.frameId);
          if (frame && payload.element) {
            // Guard duplicate id
            const existingIdx = frame.elements.findIndex((e) => e.id === payload.element.id);
            if (existingIdx === -1) {
              frame.elements.push(payload.element);
            } else {
              frame.elements[existingIdx] = payload.element;
            }

            broadcastToRoom(room, ws, {
              type: 'element:created',
              payload: {
                frameId: payload.frameId,
                element: payload.element,
              },
            });
          }
          break;
        }

        case 'element:update': {
          const frame = room.frames.find((f) => f.id === payload.frameId);
          if (frame && payload.elementId) {
            const element = frame.elements.find((e) => e.id === payload.elementId);
            if (element) {
              Object.assign(element, payload.updates);
              broadcastToRoom(room, ws, {
                type: 'element:updated',
                payload: {
                  frameId: payload.frameId,
                  elementId: payload.elementId,
                  updates: payload.updates,
                },
              });
            }
          }
          break;
        }

        case 'element:delete': {
          const frame = room.frames.find((f) => f.id === payload.frameId);
          if (frame && payload.elementId) {
            frame.elements = frame.elements.filter((e) => e.id !== payload.elementId);
            broadcastToRoom(room, ws, {
              type: 'element:deleted',
              payload: {
                frameId: payload.frameId,
                elementId: payload.elementId,
              },
            });
          }
          break;
        }

        case 'frame:create': {
          if (payload.frame) {
            room.frames.push(payload.frame);
            room.activeFrameId = payload.frame.id;
            broadcastToRoom(room, null, {
              type: 'frame:created',
              payload: {
                frame: payload.frame,
                activeFrameId: room.activeFrameId,
              },
            });
          }
          break;
        }

        case 'frame:switch': {
          if (payload.frameId) {
            room.activeFrameId = payload.frameId;
            broadcastToRoom(room, ws, {
              type: 'frame:switched',
              payload: { activeFrameId: room.activeFrameId },
            });
          }
          break;
        }

        case 'frame:update_bg': {
          const frame = room.frames.find((f) => f.id === payload.frameId);
          if (frame) {
            if (payload.background) frame.background = payload.background;
            if (payload.backgroundColor) frame.backgroundColor = payload.backgroundColor;
            broadcastToRoom(room, ws, {
              type: 'frame:bg_updated',
              payload: {
                frameId: payload.frameId,
                background: frame.background,
                backgroundColor: frame.backgroundColor,
              },
            });
          }
          break;
        }

        case 'frame:delete': {
          if (room.frames.length > 1 && payload.frameId) {
            room.frames = room.frames.filter((f) => f.id !== payload.frameId);
            if (room.activeFrameId === payload.frameId) {
              room.activeFrameId = room.frames[0].id;
            }
            broadcastToRoom(room, null, {
              type: 'frame:deleted',
              payload: {
                deletedFrameId: payload.frameId,
                frames: room.frames,
                activeFrameId: room.activeFrameId,
              },
            });
          }
          break;
        }

        case 'frame:clear': {
          const frame = room.frames.find((f) => f.id === payload.frameId);
          if (frame) {
            frame.elements = [];
            broadcastToRoom(room, null, {
              type: 'frame:cleared',
              payload: { frameId: payload.frameId },
            });
          }
          break;
        }
      }
    } catch (err) {
      console.error('WebSocket message parsing error:', err);
    }
  });

  ws.on('close', () => {
    if (currentRoomId && currentUserId) {
      const room = rooms.get(currentRoomId);
      if (room) {
        room.users.delete(currentUserId);
        room.clients.delete(currentUserId);

        broadcastToRoom(room, null, {
          type: 'user:left',
          payload: {
            userId: currentUserId,
            users: Array.from(room.users.values()),
          },
        });
      }
    }
  });
});

function broadcastToRoom(room: RoomState, senderWs: WebSocket | null, message: any) {
  const json = JSON.stringify(message);
  for (const [userId, client] of room.clients.entries()) {
    if (client !== senderWs && client.readyState === WebSocket.OPEN) {
      client.send(json);
    }
  }
}

// REST endpoints
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', catsPurring: true, activeRooms: rooms.size });
});

app.get('/api/rooms/:roomId', (req, res) => {
  const room = rooms.get(req.params.roomId);
  if (!room) {
    return res.status(404).json({ error: 'Room not found' });
  }
  res.json({
    id: room.id,
    name: room.name,
    frameCount: room.frames.length,
    usersCount: room.users.size,
  });
});

// Dev vs Prod Vite Integration
if (process.env.NODE_ENV !== 'production') {
  const { createServer: createViteServer } = await import('vite');
  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });
  app.use(vite.middlewares);
} else {
  app.use(express.static(path.resolve(__dirname, 'dist')));
  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
  });
}

server.listen(PORT, () => {
  console.log(`🐾 PurrBoard server is running on http://localhost:${PORT}`);
});
