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
  isChannel?: boolean
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

  members: string[],
  setMembers: React.Dispatch<React.SetStateAction<string[]>>,

  closeModal?: () => void;
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
  members: string[],
  setMembers: React.Dispatch<React.SetStateAction<string[]>>,
  onClick: () => void,
  closeModal?: () => void
}

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
  lastMessage?: string;
  date: Date | string | number;
}

declare interface Props {
  title: string | undefined,
  subTitle: string | undefined,
  id: string | undefined
}

declare interface SidebarItem {
  id: number,
  title: string,
  expandedTitle: string,
  ref: string
}

declare interface User {
  id: string;
  username: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline' | 'away';
}

declare interface Message {
  _id: string;
  channelId: string;
  senderId: User;
  content: string;
  type: 'text' | 'image' | 'file' | 'system';
  autoId: number;
  readBy: string[];
  deliveredTo: string[];
  replyTo?: Message;
  createdAt: string;
  updatedAt: string;
  status?: 'sending' | 'sent' | 'failed';
  tempId?: number;
}

declare interface Channel {
  _id: string;
  name?: string;
  type: 'direct' | 'group';
  avatar?: string;
  description?: string;
  users: {
    userId: User;
    role: 'admin' | 'member';
    joinedAt: string;
    lastRead: number;
    unreadCount: number;
  }[];
  lastMessage?: {
    content: string;
    senderId: User;
    sentAt: string;
    autoId: number;
  };
  messageAutoId: number;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

declare module 'jsonwebtoken';