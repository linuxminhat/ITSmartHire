import axios from '@/config/axios-customize';
import { IBlog } from '@/types/blog.type';

class BlogService {
  private readonly baseUrl = '/api/v1/blogs';

  async getAll(query = '') {
    const response = await axios.get(this.baseUrl + (query ? `?${query}` : ''));
    return response;
  }

  async getById(id: string) {
    const response = await axios.get(`${this.baseUrl}/${id}`);
    return response;
  }

  async create(data: Partial<IBlog>) {
    const response = await axios.post(this.baseUrl, data);
    return response;
  }

  async update(id: string, data: Partial<IBlog>) {
    const response = await axios.put(`${this.baseUrl}/${id}`, data);
    return response;
  }

  async delete(id: string) {
    const response = await axios.delete(`${this.baseUrl}/${id}`);
    return response;
  }

  async search(keyword: string) {
    const response = await axios.get(`${this.baseUrl}/search?q=${encodeURIComponent(keyword)}`);
    return response;
  }

  async getByTag(tag: string) {
    const response = await axios.get(`${this.baseUrl}/tag/${encodeURIComponent(tag)}`);
    return response;
  }

  async getRelated(blogId: string) {
    const response = await axios.get(`${this.baseUrl}/${blogId}/related`);
    return response;
  }
}

export const blogService = new BlogService(); 