export interface User {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline';
}

export interface AuthResponse {
  _id: string;
  username: string;
  email: string;
  avatar?: string;
  status: 'online' | 'offline';
  token: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterCredentials {
  username: string;
  email: string;
  password: string;
}
