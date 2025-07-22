import { fheMessages, serverStatus, type FheMessage, type InsertFheMessage, type ServerStatus, type InsertServerStatus } from "@shared/schema";

export interface IStorage {
  // FHE Messages
  createFheMessage(message: InsertFheMessage): Promise<FheMessage>;
  updateFheMessage(id: number, updates: Partial<FheMessage>): Promise<FheMessage | undefined>;
  getFheMessage(id: number): Promise<FheMessage | undefined>;
  getAllFheMessages(): Promise<FheMessage[]>;
  
  // Server Status
  createOrUpdateServerStatus(serverStatus: InsertServerStatus): Promise<ServerStatus>;
  getServerStatus(serverId: string): Promise<ServerStatus | undefined>;
  getAllServerStatuses(): Promise<ServerStatus[]>;
}

export class MemStorage implements IStorage {
  private fheMessages: Map<number, FheMessage>;
  private serverStatuses: Map<string, ServerStatus>;
  private currentFheMessageId: number;
  private currentServerStatusId: number;

  constructor() {
    this.fheMessages = new Map();
    this.serverStatuses = new Map();
    this.currentFheMessageId = 1;
    this.currentServerStatusId = 1;
  }

  async createFheMessage(insertMessage: InsertFheMessage): Promise<FheMessage> {
    const id = this.currentFheMessageId++;
    const message: FheMessage = {
      ...insertMessage,
      id,
      serverBTimestamp: null,
      processingTimeMs: null,
      processingResult: null,
    };
    this.fheMessages.set(id, message);
    return message;
  }

  async updateFheMessage(id: number, updates: Partial<FheMessage>): Promise<FheMessage | undefined> {
    const existing = this.fheMessages.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...updates };
    this.fheMessages.set(id, updated);
    return updated;
  }

  async getFheMessage(id: number): Promise<FheMessage | undefined> {
    return this.fheMessages.get(id);
  }

  async getAllFheMessages(): Promise<FheMessage[]> {
    return Array.from(this.fheMessages.values()).sort((a, b) => 
      new Date(b.serverATimestamp).getTime() - new Date(a.serverATimestamp).getTime()
    );
  }

  async createOrUpdateServerStatus(insertStatus: InsertServerStatus): Promise<ServerStatus> {
    const existing = this.serverStatuses.get(insertStatus.serverId);
    
    if (existing) {
      const updated = { ...existing, ...insertStatus };
      this.serverStatuses.set(insertStatus.serverId, updated);
      return updated;
    } else {
      const id = this.currentServerStatusId++;
      const status: ServerStatus = { ...insertStatus, id };
      this.serverStatuses.set(insertStatus.serverId, status);
      return status;
    }
  }

  async getServerStatus(serverId: string): Promise<ServerStatus | undefined> {
    return this.serverStatuses.get(serverId);
  }

  async getAllServerStatuses(): Promise<ServerStatus[]> {
    return Array.from(this.serverStatuses.values());
  }
}

export const storage = new MemStorage();
