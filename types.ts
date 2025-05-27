import { ObjectId } from "mongodb";

export interface Clothing {
  id: number;
  name: string;
  description: string;
  price: number;
  seasonDate: string;
  imageUrl: string;
  category: string;
  sizes: string[];
  store: Store;
  isAvailable: boolean;
}

export interface Store {
  id: number;
  name: string;
  location: string;
  rating: number;
  imageUrl: string;
  description: string;
}

export interface User {
  _id?: ObjectId;
  username: string;
  password?: string;
  role: "ADMIN" | "USER";
}
