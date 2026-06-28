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
    // 3ème arg = liveText (texte en cours de frappe, lettre par lettre)
    onFriendTyping: (friendId: string, isTyping: boolean, liveText?: string) => void,
    onCallSignal?: (payload: PusherCallPayload) => void
  ) {
    console.log('🔔 Initializing Pusher...', { key: PUSHER_KEY, cluster: PUSHER_CLUSTER });

    try {
      const pusher = new Pusher(PUSHER_KEY, {
        cluster: PUSHER_CLUSTER,
        forceTLS: true,
      });

      // 1. Canal communauté
      const communityChannel = pusher.subscribe('spirittalk-community');
      communityChannel.bind('new-post', (data: any) => {
        console.log('🌍 [Pusher] New post:', data);
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

      // 2. Canal messagerie
      const chatChannel = pusher.subscribe('spirittalk-chat');

      chatChannel.bind('new-message', (data: any) => {
        console.log('💬 [Pusher] New message:', data);
        // Le backend broadcast envoie { message: { senderId, recipientId, ... } }
        // On supporte les deux formats
        const msg = data.message || data;
        onNewMessage({
          id: msg.id || `dm_pusher_${Date.now()}`,
          senderId: String(msg.senderId),
          recipientId: String(msg.recipientId),
          text: msg.text,
          images: msg.images,
          audioUrl: msg.audioUrl,
          audioDuration: msg.audioDuration,
          timestamp: msg.timestamp || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        });
      });

      chatChannel.bind('typing-status', (data: any) => {
        console.log('✍️ [Pusher] Typing:', data);
        const senderId = data.senderId || data.userId;
        if (!senderId) return;

        // liveText = texte en cours de frappe envoyé lettre par lettre
        const liveText: string | undefined = data.liveText ?? data.live_text ?? undefined;

        onFriendTyping(String(senderId), !!data.isTyping, liveText);
      });

      // 3. Canal appels
      const callChannel = pusher.subscribe('spirittalk-calls');
      callChannel.bind('call-signal', (data: any) => {
        console.log('📞 [Pusher] Call signal:', data);
        onCallSignal?.({
          senderId: data.senderId,
          recipientId: data.recipientId,
          type: data.type,
          signal: data.signal,
        });
      });

      pusher.connection.bind('state_change', (states: { current: string }) => {
        console.log(`🔌 [Pusher] ${states.current}`);
      });

      return pusher;
    } catch (error) {
      console.warn('⚠️ Pusher failed to initialize.', error);
      return null;
    }
  }
};