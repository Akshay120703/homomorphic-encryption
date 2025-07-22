import type { Express } from "express";
import { createServer, type Server } from "http";
import { WebSocketServer, WebSocket } from "ws";
import { storage } from "./storage";
import { fheService } from "./services/fhe-service";
import { wsMessageSchema, type WsMessage } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const httpServer = createServer(app);
  
  // WebSocket server for real-time communication
  const wss = new WebSocketServer({ server: httpServer, path: '/ws' });
  
  // Store active WebSocket connections
  const connections = new Set<WebSocket>();
  
  // Initialize server statuses
  await storage.createOrUpdateServerStatus({
    serverId: "A",
    status: "online",
    lastHeartbeat: new Date(),
    port: 3000
  });
  
  await storage.createOrUpdateServerStatus({
    serverId: "B", 
    status: "online",
    lastHeartbeat: new Date(),
    port: 5000
  });

  // WebSocket connection handling
  wss.on('connection', (ws: WebSocket) => {
    console.log('New WebSocket connection established');
    connections.add(ws);
    
    // Send initial server status
    broadcast({
      type: "server_status",
      payload: {
        serverId: "A",
        status: "online",
        port: 3000
      }
    });
    
    broadcast({
      type: "server_status", 
      payload: {
        serverId: "B",
        status: "online",
        port: 5000
      }
    });

    ws.on('message', async (data: Buffer) => {
      try {
        const message = JSON.parse(data.toString());
        const validatedMessage = wsMessageSchema.parse(message);
        
        await handleWebSocketMessage(validatedMessage, ws);
      } catch (error) {
        console.error('Invalid WebSocket message:', error);
        ws.send(JSON.stringify({
          type: "error",
          payload: { message: "Invalid message format" }
        }));
      }
    });

    ws.on('close', () => {
      connections.delete(ws);
      console.log('WebSocket connection closed');
    });

    ws.on('error', (error) => {
      console.error('WebSocket error:', error);
      connections.delete(ws);
    });
  });

  // Handle WebSocket messages
  async function handleWebSocketMessage(message: WsMessage, ws: WebSocket) {
    switch (message.type) {
      case "encrypt_message":
        await handleEncryptMessage(message.payload.messageType);
        break;
      
      default:
        console.log('Unhandled message type:', message.type);
    }
  }

  // Server A: Encrypt and send message
  async function handleEncryptMessage(messageType: "A1" | "A2") {
    try {
      // Log encryption start
      broadcastLog("A", `Starting FHE encryption of message "${messageType}"`, "info");
      
      // Simulate encryption delay
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Encrypt the message using FHE
      const encryptedData = fheService.encrypt(messageType);
      
      // Store in database
      const fheMessage = await storage.createFheMessage({
        messageType,
        encryptedData,
        serverATimestamp: new Date()
      });
      
      broadcastLog("A", `FHE encryption complete for message ID ${fheMessage.id}`, "success");
      broadcastLog("A", `Transmitting encrypted message to Server B`, "info");
      
      // Simulate transmission delay
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Broadcast encrypted message to Server B
      broadcast({
        type: "encrypted_message",
        payload: {
          messageType,
          encryptedData,
          timestamp: new Date().toISOString()
        }
      });
      
      broadcastLog("A", "Transmission complete", "success");
      
      // Notify Server A interface that encryption is complete
      broadcast({
        type: "log_entry",
        payload: {
          serverId: "A",
          message: "Encryption and transmission cycle complete",
          level: "success",
          timestamp: new Date().toISOString()
        }
      });
      
      // Simulate Server B processing
      setTimeout(async () => {
        await handleHomomorphicProcessing(fheMessage.id, encryptedData, messageType);
      }, 1000);
      
    } catch (error) {
      console.error('Encryption error:', error);
      broadcastLog("A", `Encryption failed: ${error}`, "error");
    }
  }

  // Server B: Process encrypted message homomorphically
  async function handleHomomorphicProcessing(messageId: number, encryptedData: string, originalMessageType: string) {
    try {
      broadcastLog("B", "Encrypted message received", "info");
      broadcastLog("B", "Starting FHE circuit evaluation", "info");
      
      // Update server B timestamp
      await storage.updateFheMessage(messageId, {
        serverBTimestamp: new Date()
      });
      
      // Perform homomorphic evaluation without decryption
      const { result, processingTimeMs } = await fheService.homomorphicEvaluate(encryptedData);
      
      // Update message with processing result
      await storage.updateFheMessage(messageId, {
        processingResult: result,
        processingTimeMs
      });
      
      broadcastLog("B", `FHE circuit evaluation complete in ${processingTimeMs}ms`, "success");
      broadcastLog("B", `Message identified without decryption: ${result}`, "success");
      
      // Broadcast processing result
      broadcast({
        type: "processing_result",
        payload: {
          result,
          processingTimeMs,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (error) {
      console.error('Processing error:', error);
      broadcastLog("B", `Processing failed: ${error}`, "error");
    }
  }

  // Broadcast message to all connected clients
  function broadcast(message: WsMessage) {
    const messageStr = JSON.stringify(message);
    connections.forEach(ws => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(messageStr);
      }
    });
  }

  // Broadcast log entry
  function broadcastLog(serverId: string, message: string, level: "info" | "warning" | "error" | "success") {
    broadcast({
      type: "log_entry",
      payload: {
        serverId,
        message,
        timestamp: new Date().toISOString(),
        level
      }
    });
  }

  // REST API endpoints
  
  // Get all FHE messages
  app.get("/api/messages", async (req, res) => {
    try {
      const messages = await storage.getAllFheMessages();
      res.json(messages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Get server statuses
  app.get("/api/server-status", async (req, res) => {
    try {
      const statuses = await storage.getAllServerStatuses();
      res.json(statuses);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch server status" });
    }
  });

  // Get FHE key information
  app.get("/api/fhe-info", (req, res) => {
    try {
      const keyInfo = fheService.getKeyInfo();
      res.json(keyInfo);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch FHE info" });
    }
  });

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ 
      status: "ok", 
      timestamp: new Date().toISOString(),
      servers: {
        A: { port: 3000, status: "online" },
        B: { port: 5000, status: "online" }
      }
    });
  });

  return httpServer;
}
