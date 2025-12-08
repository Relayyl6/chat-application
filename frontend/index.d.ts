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
  id?: string,
  title: string,
  firstLine: string,
  message: MessageProps[]
}

declare interface MessageProps {
  alais?: user,
  timestamp: string,
  text: string | undefined
}

type user = "me" | "you";