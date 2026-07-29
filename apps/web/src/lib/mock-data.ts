export type Need = {
  id: string;
  title: string;
  quantity: number;
  committed: number;
  contributor?: string;
  kind: "lend" | "give" | "help" | "advice" | "recommendation" | "alternative";
};

export type Ask = {
  id: string;
  status?:
    | "draft"
    | "open"
    | "partially_fulfilled"
    | "ready"
    | "in_progress"
    | "completed"
    | "cancelled"
    | "archived"
    | "expired";
  title: string;
  description: string;
  label: "Need help" | "Offering" | "Event";
  dateLabel: string;
  neededBy?: string;
  generalLocation: string;
  progress: number;
  image?: string;
  needs: Need[];
};

export type Offer = {
  id: string;
  askId: string;
  needId: string;
  name: string;
  avatar?: string;
  message: string;
  detail: string;
  itemName?: string;
  quantity?: number;
  availability: string;
  generalLocation: string;
  completedShares: number;
  receivedLabel: string;
  status?: string;
  neededBy?: string;
  submittedAt?: string;
};

export const currentCircle = {
  id: "b0b08438-1234-4a2d-9ea2-2a88f3f47001",
  name: "Paseos Community Sharing",
  generalArea: "Paseos · Boca Raton, Florida",
  memberName: "Emily",
};

export const asks: Ask[] = [
  {
    id: "birthday-party",
    title: "Hosting a birthday party 🎉",
    description: "Need a few things for our backyard party.",
    label: "Need help",
    dateLabel: "Sat, May 25 · 2:00 PM",
    generalLocation: "Paseos clubhouse area",
    progress: 75,
    image: "/assets/birthday-party.jpg",
    needs: [
      {
        id: "tables",
        title: "Folding tables",
        quantity: 2,
        committed: 2,
        contributor: "Janet",
        kind: "lend",
      },
      {
        id: "cooler",
        title: "Large cooler",
        quantity: 1,
        committed: 1,
        contributor: "Mark",
        kind: "lend",
      },
      {
        id: "canopy",
        title: "Pop-up canopy",
        quantity: 1,
        committed: 0,
        kind: "lend",
      },
      {
        id: "setup",
        title: "Help setting up",
        quantity: 1,
        committed: 1,
        contributor: "Alex",
        kind: "help",
      },
    ],
  },
  {
    id: "pressure-washer",
    title: "I have a pressure washer",
    description: "Available this weekend.",
    label: "Offering",
    dateLabel: "This weekend",
    generalLocation: "North side of Paseos",
    progress: 0,
    image: "/assets/pressure-washer.jpg",
    needs: [],
  },
  {
    id: "garage-sale",
    title: "Neighborhood garage sale",
    description: "Bring clean items, tables and price labels.",
    label: "Event",
    dateLabel: "Sun, May 26 · 8:00 AM",
    generalLocation: "Paseos clubhouse",
    progress: 0,
    needs: [],
  },
];

export const offers: Offer[] = [
  {
    id: "janet-tables",
    askId: "birthday-party",
    needId: "tables",
    name: "Janet",
    avatar: "/assets/avatar-lisa.png",
    message: "I can lend 2 folding tables.",
    detail: "Two 6-foot plastic folding tables in good condition.",
    itemName: "2 folding tables",
    quantity: 2,
    availability: "Friday after 6 PM or Saturday before noon",
    generalLocation: "North side of Paseos",
    completedShares: 12,
    receivedLabel: "Just now",
  },
  {
    id: "mark-cooler",
    askId: "birthday-party",
    needId: "cooler",
    name: "Mark",
    avatar: "/assets/avatar-mike.png",
    message: "I have a large cooler that works great.",
    detail: "Hard-side 48-quart cooler.",
    itemName: "Large cooler",
    quantity: 1,
    availability: "Friday evening",
    generalLocation: "West side of Paseos",
    completedShares: 8,
    receivedLabel: "5m",
  },
  {
    id: "alex-setup",
    askId: "birthday-party",
    needId: "setup",
    name: "Alex",
    avatar: "/assets/avatar-mike.png",
    message: "I can help set up around 1:00 PM.",
    detail: "Happy to help move tables and set up the canopy.",
    availability: "Saturday 1:00–1:45 PM",
    generalLocation: "Paseos",
    completedShares: 5,
    receivedLabel: "18m",
  },
  {
    id: "priya-canopy",
    askId: "birthday-party",
    needId: "canopy",
    name: "Priya",
    avatar: "/assets/avatar-lisa.png",
    message: "I have a canopy you can borrow.",
    detail: "A 10×10 pop-up canopy with stakes.",
    itemName: "10×10 pop-up canopy",
    quantity: 1,
    availability: "Saturday morning",
    generalLocation: "South side of Paseos",
    completedShares: 9,
    receivedLabel: "25m",
  },
];

export const messages = [
  {
    id: "m1",
    name: "Janet",
    avatar: "/assets/avatar-lisa.png",
    preview: "Pickup confirmed for Fri, May 24 at 7 PM.",
    time: "Just now",
    unread: true,
  },
  {
    id: "m2",
    name: "Mark",
    avatar: "/assets/avatar-mike.png",
    preview: "Thanks again! The cooler was perfect.",
    time: "1d",
    unread: false,
  },
  {
    id: "m3",
    name: "Call On",
    avatar: "/assets/call-on-logo-mark.svg",
    preview: "Reminder: return items by Sun, May 26.",
    time: "2d",
    unread: false,
  },
  {
    id: "m4",
    name: "Priya",
    avatar: "/assets/avatar-lisa.png",
    preview: "Can you send the pickup details?",
    time: "3d",
    unread: false,
  },
];

export const savedResources = [
  {
    id: "tables",
    title: "2 folding tables",
    saved: "Saved May 10",
    image: "/assets/folding-table.jpg",
    category: "Party & events",
  },
  {
    id: "cooler",
    title: "Large cooler",
    saved: "Saved Apr 28",
    image: "/assets/cooler.jpg",
    category: "Party & events",
  },
  {
    id: "canopy",
    title: "Pop-up canopy",
    saved: "Saved Apr 15",
    image: "/assets/birthday-party.jpg",
    category: "Outdoors",
  },
];

export function getAsk(id: string) {
  return asks.find((ask) => ask.id === id) ?? asks[0];
}

export function getOffer(id: string) {
  return offers.find((offer) => offer.id === id) ?? offers[0];
}
