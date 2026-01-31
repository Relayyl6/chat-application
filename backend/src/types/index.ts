export interface IUser {
  username: string;
  email: string;
  password: string;
  status: "online" | "offline" | "away";
  lastSeen: Date;
  avatar?: string | null;
}

export interface IUserMethods {
  comparePassword(candidatePassword: string): Promise<boolean>;
}