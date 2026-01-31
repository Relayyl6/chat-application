// declare interface Props {
//     params: {
//         [id: string]: string
//     },
//     searchParams: {
//         [key: string]: string | string[] | undefined
//     }
// }

declare interface Message {
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
  timestamp: string,
  text: string | undefined
}

declare type user = "me" | "you" | "ai";


declare interface GenerateResponse {
  result: string;
}

declare interface InputProps {
  message: MessageProps[],
  setMessage: Dispatch<SetStateAction<MessageProps[]>>,
  activePersonId: string
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

// Define the shape of your context
declare interface AppContextType {
  messagesByChat: Record<string, MessageProps[]>;
  setMessagesByChat: React.Dispatch<React.SetStateAction<Record<string, MessageProps[]>>>;
  aiChatMessage: boolean;
  setAiChatMessage: React.Dispatch<React.SetStateAction<boolean>>;
  people: PeopleState;
  setPeople: React.Dispatch<React.SetStateAction<PeopleState>>;
}

declare type PeopleState = {
  byId: Record<string, MessageContainerProp>;
  order: string[];
};


declare interface ChatCardProps {
  id: string;
  name: string;
  lastMessage?: string;
  date?: string;
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

declare module 'jsonwebtoken';