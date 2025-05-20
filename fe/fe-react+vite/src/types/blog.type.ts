export interface IBlog {
  _id: string;
  title: string;
  content: string;
  description: string;
  thumbnail: string;
  status: 'draft' | 'published';
  author: {
    _id: string;
    name: string;
    email: string;
  };
  tags: string[];
  views: number;
  isDeleted: boolean;
  deletedAt: string | null;
  createdAt: string;
  updatedAt: string;
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
  title: string
  description: string
  content: string
  thumbnail?: string
  status: 'draft' | 'published'
  tags: string[]
}

export interface IUpdateBlog extends Partial<ICreateBlog> { } 