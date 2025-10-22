import type { ChatService } from '@/types';
import type {
  Conversation,
  CreateConversationRequest,
  UpdateConversationRequest,
  Message,
  SendMessageRequest,
  ExpertProfile,
  ExpertQueue,
  ExpertAssignment,
  UpdateExpertProfileRequest,
} from '@/types';
import TokenManager from '@/services/TokenManager';

interface ApiChatServiceConfig {
  baseUrl: string;
  timeout: number;
  retryAttempts: number;
}

/**
 * API implementation of ChatService for production use
 * Uses fetch for HTTP requests
 */
export class ApiChatService implements ChatService {
  private baseUrl: string;
  private tokenManager: TokenManager;

  constructor(config: ApiChatServiceConfig) {
    this.baseUrl = config.baseUrl;
    this.tokenManager = TokenManager.getInstance();
  }

  private async makeRequest<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // 1. Construct the full URL using this.baseUrl and endpoint
    const url = `${this.baseUrl}${endpoint}`;

    // 2. Get the token using this.tokenManager.getToken()
    const token = this.tokenManager.getToken()

    // 3. Set up default headers including 'Content-Type': 'application/json'
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
    };

    // 4. Add Authorization header with Bearer token if token exists
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // 5. Make the fetch request with the provided options
    const fetchOptions: RequestInit = {
      ...options,
      headers,
      credentials: 'include',
    };
    const response = await fetch(url, fetchOptions);

    // 6. Handle non-ok responses by throwing an error with status and message
    if (!response.ok) {
      const text = await response.text();
      throw new Error(`Request failed with status ${response.status}: ${text}`);
    }

    // 7. Return the parsed JSON response
    const data: T = await response.json();
    return data;
  }

  // Conversations
  async getConversations(): Promise<Conversation[]> {
    // 1. Make a request to the appropriate endpoint
    const endpoint = '/conversations'
    const options: RequestInit = {
      method: 'GET'
    }
    const response = await this.makeRequest<Conversation[]>(endpoint, options);

    // 2. Return the array of conversations
    return response;
  }

  async getConversation(_id: string): Promise<Conversation> {
    // 1. Make a request to the appropriate endpoint
    const endpoint = `/conversations/${_id}`;
    const options: RequestInit = {
      method: 'GET'
    }
    const response = await this.makeRequest<Conversation>(endpoint, options);

    // 2. Return the conversation object
    return response;
  }

  async createConversation(
    request: CreateConversationRequest
  ): Promise<Conversation> {
    // 1. Make a request to the appropriate endpoint
    const endpoint = '/conversations'
    const options: RequestInit = {
      method: 'POST',
      body: JSON.stringify({
        title: request.title
      })
    }
    const response = await this.makeRequest<Conversation>(endpoint, options);
    // 2. Return the created conversation object
    return response
  }

  async updateConversation(
    id: string,
    request: UpdateConversationRequest
  ): Promise<Conversation> {
    // SKIP, not currently used by application

    throw new Error('updateConversation method not implemented');
  }

  async deleteConversation(id: string): Promise<void> {
    // SKIP, not currently used by application

    throw new Error('deleteConversation method not implemented');
  }

  // Messages
  async getMessages(conversationId: string): Promise<Message[]> {
    // 1. Make a request to the appropriate endpoint
    const endpoint = `/conversations/${conversationId}/messages`;
    const options: RequestInit = {
      method: 'GET'
    }
    const response = await this.makeRequest<Message[]>(endpoint, options);
    // 2. Return the array of messages
    return response
  }

  async sendMessage(request: SendMessageRequest): Promise<Message> {
    // 1. Make a request to the appropriate endpoint
    const endpoint = `/messages`;
    const options: RequestInit = {
      method: 'POST',
      body: JSON.stringify({
        conversationId: request.conversationId,
        content: request.content
      })
    }
    const response = await this.makeRequest<Message>(endpoint, options);

    // 2. Return the created message object
    return response
  }

  async markMessageAsRead(messageId: string): Promise<void> {
    // SKIP, not currently used by application

    throw new Error('markMessageAsRead method not implemented');
  }

  // Expert-specific operations
  async getExpertQueue(): Promise<ExpertQueue> {
    // 1. Make a request to the appropriate endpoint
    const endpoint = `/expert/queue`;
    const options: RequestInit = {
      method: 'GET'
    }
    const response = await this.makeRequest<ExpertQueue>(endpoint, options);
    // 2. Return the expert queue object with waitingConversations and assignedConversations
    return response
  }

  async claimConversation(conversationId: string): Promise<void> {
    // 1. Make a request to the appropriate endpoint
    const endpoint = `/expert/conversations/${conversationId}/claim`;
    const options: RequestInit = {
      method: 'POST'
    }
    const response = await this.makeRequest<void>(endpoint, options);

    // 2. Return void (no response body expected)
    return response
  }

  async unclaimConversation(conversationId: string): Promise<void> {
    // 1. Make a request to the appropriate endpoint
    const endpoint = `/expert/conversations/${conversationId}/unclaim`;
    const options: RequestInit = {
      method: 'POST'
    }
    const response = await this.makeRequest<void>(endpoint, options);

    // 2. Return void (no response body expected)
    return response
  }

  async getExpertProfile(): Promise<ExpertProfile> {
    // 1. Make a request to the appropriate endpoint
    const endpoint = `/expert/profile`;
    const options: RequestInit = {
      method: 'GET'
    }
    const response = await this.makeRequest<ExpertProfile>(endpoint, options);

    // 2. Return the expert profile object
    return response
  }

  async updateExpertProfile(
    request: UpdateExpertProfileRequest
  ): Promise<ExpertProfile> {
    // 1. Make a request to the appropriate endpoint
    const endpoint = `/expert/profile`;
    const options: RequestInit = {
      method: 'PUT',
      body: JSON.stringify({
        bio: request.bio,
        knowledgeBaseLinks: request.knowledgeBaseLinks
      })
    }
    const response = await this.makeRequest<ExpertProfile>(endpoint, options);

    // 2. Return the updated expert profile object
    return response
  }

  async getExpertAssignmentHistory(): Promise<ExpertAssignment[]> {
    // 1. Make a request to the appropriate endpoint
    const endpoint = `/expert/assignments/history`;
    const options: RequestInit = {
      method: 'GET'
    }
    const response = await this.makeRequest<ExpertAssignment[]>(endpoint, options);

    // 2. Return the array of expert assignments
    return response
  }
}
