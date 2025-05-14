import { apiService } from './api';
import { User, PaginatedResponse } from '../types';

export interface UpdateUserData {
  first_name?: string;
  last_name?: string;
  email?: string;
  phone_number?: string;
  company_name?: string;
  address?: string;
  role?: string;
}

class UserService {
  async getUsers(): Promise<User[] | PaginatedResponse<User>> {
    try {
      const response = await apiService.get<any>('/users/');
      
      // Log the response to understand its structure
      console.log('Raw user service response:', response);
      
      // Return the response, component will handle whether it's paginated or a direct array
      return response;
    } catch (error) {
      console.error('Error in UserService.getUsers:', error);
      throw error;
    }
  }

  async getUserById(id: number): Promise<User> {
    return apiService.get<User>(`/users/${id}/`);
  }

  async getCurrentUser(): Promise<User> {
    return apiService.get<User>('/users/me/');
  }

  async updateUser(id: number, data: UpdateUserData): Promise<User> {
    return apiService.patch<User>(`/users/${id}/`, data);
  }

  async updateCurrentUser(data: UpdateUserData): Promise<User> {
    return apiService.patch<User>('/users/me/', data);
  }

  async deleteUser(id: number): Promise<void> {
    return apiService.delete(`/users/${id}/`);
  }

  async changePassword(oldPassword: string, newPassword: string): Promise<void> {
    await apiService.post('/users/change-password/', {
      old_password: oldPassword,
      new_password: newPassword
    });
  }

  async resetPassword(email: string): Promise<void> {
    await apiService.post('/users/reset-password/', { email });
  }
}

export const userService = new UserService(); 