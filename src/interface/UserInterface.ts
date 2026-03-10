import type { Position } from "./PositionInterface";

export interface User {
  position?: Position;
  phone_number?: string;
  photo_url?: string;
  name?: string;
  email?: string;
  userId?: string;
  role?: string;
  id?: string;
}