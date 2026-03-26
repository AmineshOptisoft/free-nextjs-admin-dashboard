export type SavedAddress = {
  id: string;
  label: "Home" | "Work" | "Other";
  address: string;
  isDefault?: boolean;
};

export type UserProfile = {
  fullName: string;
  email: string;
  phone: string;
  avatarUrl: string;
  addresses: SavedAddress[];
};

export const userProfile: UserProfile = {
  fullName: "Alex Johnson",
  email: "alex.johnson@example.com",
  phone: "+1 222 333 4444",
  avatarUrl: "/images/user/owner.jpg",
  addresses: [
    {
      id: "ADDR-1",
      label: "Home",
      address: "A-21, Green Park, New Delhi",
      isDefault: true,
    },
    {
      id: "ADDR-2",
      label: "Work",
      address: "9th Floor, Business Tower, Connaught Place",
    },
  ],
};
