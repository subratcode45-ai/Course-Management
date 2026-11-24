export interface User {
  id: string;
  name: string;
  email: string;
  role: 'user' | 'admin';
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Module {
  title: string;
  lessons: string[];
}

export interface Course {
  _id: string;
  title: string;
  description: string;
  thumbnail: string;
  price: number;
  instructor: string;
  duration: string;
  level: string;
  mode: string;
  whatYouWillLearn: string[];
  curriculum: Module[];
  createdAt: string;
}

export interface CreateOrderResponse {
  success: boolean;
  keyId: string;
  orderId: string;
  amount: number;  
  currency: string;
  courseTitle: string;
}