import { nanoid } from "nanoid";

export const initialPeople: MessageContainerProp[] = [
  { id: nanoid(), title: "Leonard Oseghale", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensionscan absolutely constrain content layouts per route to account for sidebar/navbar dimensions"},
  { id: nanoid(), title: "Sarah Thompson", firstLine:"you can absolutely constrain content layouts"},
  { id: nanoid(), title: "Michael Harrington", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: nanoid(), title: "Aisha Bello", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: nanoid(), title: "Daniel Rodriguez", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: nanoid(), title: "Emily Park", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: nanoid(), title: "Christopher Grant", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: nanoid(), title: "Nadia Suleiman", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: nanoid(), title: "James Whitaker", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: nanoid(), title: "Kai Nakamura", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: nanoid(), title: "Olivia Carter", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: nanoid(), title: "Marcus Bennett", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: nanoid(), title: "Sophia Alvarez", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: nanoid(), title: "Adekunle Johnson", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: nanoid(), title: "Maya Chen", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: nanoid(), title: "Gabriel Martins", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: nanoid(), title: "Isabella Rossi", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: nanoid(), title: "Samuel Peterson", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: nanoid(), title: "Zara Mahmoud", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: nanoid(), title: "Victor Mensah", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" }
];

export function normalizePeople(
  people: MessageContainerProp[]
): PeopleState {
  const byId: Record<string, MessageContainerProp> = {};
  const order: string[] = [];

  for (const person of people) {
    byId[person.id as string] = person;
    order.push(person.id as string);
  }

  return { byId, order };
}

