// import type { IUser } from "./user.type";

export interface IBlog {
  _id: string;
  title: string;
  content: string;
  description: string;
  thumbnail?: string;
  status: 'draft' | 'published';
  author: any; // Có thể là string hoặc user object
  tags: string[];
  views?: number;
  isDeleted?: boolean;
  deletedAt?: string | null;
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface ICreateBlog {
  title: string
  description: string
  content: string
  thumbnail?: string
  status: 'draft' | 'published'
  tags: string[]
}

export interface IBlogPayload {
  title: string;
  content: string;
  description: string;
  thumbnail: string;
  status: 'draft' | 'published';
  tags: string[];
}

export interface IUpdateBlog extends Partial<ICreateBlog> { } 