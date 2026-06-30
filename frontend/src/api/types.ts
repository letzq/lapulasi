export interface LoginRequest { email: string; password: string }
export interface LoginResponse { user: any; token: string }
export interface CreateSessionRequest { model?: string; title?: string }
export interface SendMessageRequest { sessionId: string; content: string }
