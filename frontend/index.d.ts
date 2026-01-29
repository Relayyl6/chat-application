declare interface Props {
    params: {
        [id: string]: string
    },
    searchParams: {
        [key: string]: string | string[] | undefined
    }
}

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

declare interface HeaderProps {
  text: string,
  onClick: () => void,
  onPress: () => void,
  searchValue: string,
  handleChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  something: boolean,
  title: string,
  firstLine: string,
  setName: React.Dispatch<React.SetStateAction<string>>
  setFirstLine: React.Dispatch<React.SetStateAction<string>>
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