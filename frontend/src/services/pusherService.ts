import Pusher from 'pusher-js';

const PUSHER_KEY = (import.meta as any).env?.VITE_PUSHER_APP_KEY || (import.meta as any).env?.VITE_PUSHER_KEY || '90d62d83f3f63ace0173';
const PUSHER_CLUSTER = (import.meta as any).env?.VITE_PUSHER_APP_CLUSTER || (import.meta as any).env?.VITE_PUSHER_CLUSTER || 'eu';

export interface PusherMessagePayload {
  id?: string;
  senderId: string;
  recipientId: string;
  text?: string;
  images?: string[];
  audioUrl?: string;
  audioDuration?: string;
  timestamp?: string;
}

export interface PusherPostPayload {
  id?: string;
  name: string;
  username: string;
  avatar: string;
  content: string;
  religion: 'Chrétienne' | 'Musulmane' | 'Mixte';
  likes?: number;
  likedByMe?: boolean;
  time?: string;
  images?: string[];
  videoUrl?: string;
  verse_reference?: string;
  verse_text?: string;
}

export interface PusherCallPayload {
  senderId: number;
  recipientId: number;
  type: string;
  signal: any;
}

export const pusherService = {
  initialize(
    onNewMessage: (msg: PusherMessagePayload) => void,
    onNewPost: (post: PusherPostPayload) => void,
    onFriendTyping: (friendId: string, isTyping: boolean, recipientId: string) => void,
    onCallSignal?: (payload: PusherCallPayload) => void
  ) {
    console.log('🔔 Initializing real-time synchronization with Pusher...', { key: PUSHER_KEY, cluster: PUSHER_CLUSTER });
    
    try {
      const pusher = new Pusher(PUSHER_KEY, {
        cluster: PUSHER_CLUSTER,
        forceTLS: true,
      });

      // 1. Subscribe to Community channel
      const communityChannel = pusher.subscribe('spirittalk-community');
      
      communityChannel.bind('new-post', (data: any) => {
        console.log('🌍 [Pusher] New community post received:', data);
        onNewPost({
          id: data.id || `post_pusher_${Date.now()}`,
          name: data.name || 'Anonyme',
          username: data.username || 'anonymous',
          avatar: data.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=150',
          content: data.content || '',
          religion: data.religion || 'Mixte',
          likes: data.likes || 0,
          likedByMe: false,
          time: data.time || "À l'instant",
          images: data.images,
          videoUrl: data.videoUrl,
          verse_reference: data.verse_reference,
          verse_text: data.verse_text,
        });
      });

      // 2. Subscribe to shared messaging channel
      const chatChannel = pusher.subscribe('spirittalk-chat');

      chatChannel.bind('new-message', (data: any) => {
        console.log('💬 [Pusher] New direct message received:', data);
        onNewMessage({
          id: data.id || `dm_pusher_${Date.now()}`,
          senderId: data.senderId,
          recipientId: data.recipientId,
          text: data.text,
          images: data.images,
          audioUrl: data.audioUrl,
          audioDuration: data.audioDuration,
          timestamp: data.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      });

      chatChannel.bind('typing-status', (data: any) => {
        console.log('✍️ [Pusher] Typing status received:', data);
        const senderId = data.senderId || data.userId;
        const recipientId = data.recipientId ?? data.recipient_id;
        if (senderId && recipientId) {
          onFriendTyping(String(senderId), !!data.isTyping, String(recipientId));
        }
      });

      const callChannel = pusher.subscribe('spirittalk-calls');
      callChannel.bind('call-signal', (data: any) => {
        console.log('📞 [Pusher] Call signal received:', data);
        if (!data || !data.recipientId) {
          onCallSignal?.(data);
          return;
        }
        onCallSignal?.({
          senderId: data.senderId,
          recipientId: data.recipientId,
          type: data.type,
          signal: data.signal,
        });
      });

      pusher.connection.bind('state_change', (states: { current: string }) => {
        console.log(`🔌 [Pusher] Connection status changed to: ${states.current}`);
      });

      return pusher;
    } catch (error) {
      console.warn('⚠️ Pusher failed to initialize. Running in simulated real-time mode.', error);
      return null;
    }
  }
};
