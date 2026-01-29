import axios from 'axios';
import { API_BASE_URL } from '../utils/constants';
import { TopicData } from '../types';

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export const fetchTopics = async (): Promise<TopicData[]> => {
  try {
    const response = await axios.get<ApiResponse<TopicData[]>>(
      `${API_BASE_URL}/api/topics`
    );
    if (response.data.success) {
      return response.data.data;
    }
    throw new Error(response.data.message || 'Failed to fetch topics');
  } catch (error) {
    console.error('Error fetching topics:', error);
    throw error;
  }
};
