declare interface MessageInit {
  alais: string,
  message: string
}

declare interface Item {
  title: string,
  id: string,
  firstLine: string,
}

declare interface MessageContainerProp {
  id?: string,
  title: string,
  firstLine: string,
  message?: MessageProps[] | []
}

declare interface MessageProps {
  alias?: user,
  timestamp: Date | string | number | undefined,
  text: string | undefined
}

declare type user = "me" | "you" | "ai";

declare interface GenerateResponse {
  result: string;
}

declare interface InputProps {
  message: MessageProps[],
  setMessage: Dispatch<SetStateAction<MessageProps[]>>,
  activePersonId: string,
  /** If true, this chat is a socket-backed channel (not a DM) */
  isChannel?: boolean,
  /** Optional function to send messages in channels */
  sendMessage?: (content: string, attachments?: any[], replyTo?: string) => void
}

interface HeaderProps {
  text: string;
  onClick: () => void;
  onPress: () => void;
  searchValue: string;
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  something: boolean;
  title: string;

  mode: "dm" | "group",
  setMode: React.Dispatch<React.SetStateAction<"dm" | "group">>,

  userId: string,
  setUserId: React.Dispatch<React.SetStateAction<string>>,

  name: string;
  setName: React.Dispatch<React.SetStateAction<string>>;

  extraInfo: string;
  setExtraInfo: React.Dispatch<React.SetStateAction<string>>;

  members: Member[],
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>,

  closeModal?: () => void;
  onChannelCreated: (channelId: string) => Promise<void>; 
}

interface ContactProp {
  name: string,
  setName: React.Dispatch<React.SetStateAction<string>>,
  userId: string,
  setUserId: React.Dispatch<React.SetStateAction<string>>,
  mode: "dm" | "group",
  setMode: React.Dispatch<React.SetStateAction<"dm" | "group">>,
  extraInfo: string,
  setExtraInfo: React.Dispatch<React.SetStateAction<string>>,
  members: Member[],
  setMembers: React.Dispatch<React.SetStateAction<Member[]>>,
  onClick: (channelId: string) => void,
  closeModal?: () => void
}


declare type Member = {
  id: string;
  value: string;
};

declare interface AppContextType {
  // --- DM state (unchanged) ---
  messagesByChat: Record<string, MessageProps[]>;
  setMessagesByChat: React.Dispatch<React.SetStateAction<Record<string, MessageProps[]>>>;
  aiChatMessage: boolean;
  setAiChatMessage: React.Dispatch<React.SetStateAction<boolean>>;
  people: PeopleState;
  setPeople: React.Dispatch<React.SetStateAction<PeopleState>>;

  // --- Channel / socket state (new) ---
  channels: Channel[];
  setChannels: React.Dispatch<React.SetStateAction<Channel[]>>;
  channelsLoading: boolean;
  activeChannelId: string | null;
  setActiveChannelId: React.Dispatch<React.SetStateAction<string | null>>;
}

declare type PeopleState = {
  byId: Record<string, MessageContainerProp>;
  order: string[];
};

declare interface ChatCardProps {
  id: string;
  name: string;
  avatar?: string | null;
  lastMessage?: string;
  unreadCount?: number;
  date: Date | string | number;
  onClick?: () => void;
}

declare interface Props {
  title: string | undefined,
  subTitle: string | undefined,
  id: string | undefined,
  onSearch?: (query: string) => void,
  isChannel?: boolean
}

declare interface SidebarItem {
  id: number,
  title: string,
  expandedTitle: string,
  ref: string
}

// ─── User ─────────────────────────────────────────────────────────────────────
declare interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string | null;
  status: 'online' | 'offline' | 'away';
  lastSeen?: string;
  createdAt?: string;
  updatedAt?: string;
}

// ─── Message Attachment ───────────────────────────────────────────────────────
declare interface MessageAttachment {
  url: string;
  type: string;
  name: string;
  size: number;
}

// ─── Message ──────────────────────────────────────────────────────────────────
declare interface Message {
  _id: string;
  channelId: string;
  senderId: User;                          // populated
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  autoId: number;
  readBy: string[];                        // array of user IDs
  deliveredTo: string[];                   // array of user IDs
  replyTo?: Message | string | null;       // populated or just ID
  attachments?: MessageAttachment[];
  reactions?: Array<{
    emoji: string;
    count: number;
    userIds: string[];
  }>;
  createdAt: string;
  updatedAt: string;
  // ─── Optimistic / client-only fields ──────────────────────────────────────
  status?: 'sending' | 'sent' | 'failed';
  tempId?: number;
}

// ─── Channel Member ───────────────────────────────────────────────────────────
declare interface ChannelMember {
  _id?: string;
  userId: User;                            // populated
  role: 'admin' | 'member';
  joinedAt: string;
  lastRead: number;
  unreadCount: number;
}

// ─── Last Message snapshot stored on Channel ──────────────────────────────────
declare interface ChannelLastMessage {
  content: string;
  senderId: User | string;                 // may or may not be populated
  sendAt: string;                          // note: backend field is 'sendAt' not 'sentAt'
  autoId: number;
}

// ─── Channel ──────────────────────────────────────────────────────────────────
declare interface Channel {
  _id: string;
  name?: string | null;                    // null for direct messages
  type: 'direct' | 'group' | 'channel';   // backend has all three
  avatar?: string | null;                  // null for DMs — derived on frontend
  description?: string | null;            // null for DMs
  members: ChannelMember[];               // renamed from 'users' to match backend
  lastMessageAt?: ChannelLastMessage | null;
  messageAutoId: number;
  createdBy: User | string;               // may or may not be populated
  createdAt: string;
  updatedAt: string;
}
declare module 'jsonwebtoken';