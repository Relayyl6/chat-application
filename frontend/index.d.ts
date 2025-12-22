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
  id: number,
  firstLine: string,
}

declare interface MessageContainerProp {
  id?: number,
  title: string,
  firstLine: string,
  message: MessageProps[]
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