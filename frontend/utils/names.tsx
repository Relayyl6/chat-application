import { nanoid } from "nanoid";

export const initialPeople: MessageContainerProp[] = [
  { id: "Leonard", title: "Leonard Oseghale", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensionscan absolutely constrain content layouts per route to account for sidebar/navbar dimensions"},
  { id: "Sarah", title: "Sarah Thompson", firstLine:"you can absolutely constrain content layouts"},
  { id: "Michael", title: "Michael Harrington", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: "Aisha", title: "Aisha Bello", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: "Daniel", title: "Daniel Rodriguez", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: "Emily", title: "Emily Park", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: "Grant", title: "Christopher Grant", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: "Nadia", title: "Nadia Suleiman", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: "James", title: "James Whitaker", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: "kai", title: "Kai Nakamura", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: "Carter", title: "Olivia Carter", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: "Marcus", title: "Marcus Bennett", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: "Sophia", title: "Sophia Alvarez", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: "John", title: "Adekunle Johnson", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: "Maya", title: "Maya Chen", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: "Gabriel", title: "Gabriel Martins", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: "Rossi", title: "Isabella Rossi", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: "Samuel", title: "Samuel Peterson", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: "Zara", title: "Zara Mahmoud", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" },
  { id: "Victor", title: "Victor Mensah", firstLine:"you can absolutely constrain content layouts per route to account for sidebar/navbar dimensions" }
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

// TODO: custom function the converts the name to valid uuid