import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const fheMessages = pgTable("fhe_messages", {
  id: serial("id").primaryKey(),
  messageType: text("message_type").notNull(), // "A1" or "A2"
  encryptedData: text("encrypted_data").notNull(),
  processingResult: boolean("processing_result"), // true for A1, false for A2
  serverATimestamp: timestamp("server_a_timestamp").notNull(),
  serverBTimestamp: timestamp("server_b_timestamp"),
  processingTimeMs: integer("processing_time_ms"),
});

export const serverStatus = pgTable("server_status", {
  id: serial("id").primaryKey(),
  serverId: text("server_id").notNull(), // "A" or "B"
  status: text("status").notNull(), // "online", "offline", "processing"
  lastHeartbeat: timestamp("last_heartbeat").notNull(),
  port: integer("port").notNull(),
});

export const insertFheMessageSchema = createInsertSchema(fheMessages).omit({
  id: true,
  serverBTimestamp: true,
  processingTimeMs: true,
});

export const insertServerStatusSchema = createInsertSchema(serverStatus).omit({
  id: true,
});

export type InsertFheMessage = z.infer<typeof insertFheMessageSchema>;
export type FheMessage = typeof fheMessages.$inferSelect;
export type InsertServerStatus = z.infer<typeof insertServerStatusSchema>;
export type ServerStatus = typeof serverStatus.$inferSelect;

// WebSocket message types
export const wsMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("encrypt_message"),
    payload: z.object({
      messageType: z.enum(["A1", "A2"]),
    }),
  }),
  z.object({
    type: z.literal("encrypted_message"),
    payload: z.object({
      messageType: z.string(),
      encryptedData: z.string(),
      timestamp: z.string(),
    }),
  }),
  z.object({
    type: z.literal("processing_result"),
    payload: z.object({
      result: z.boolean(),
      processingTimeMs: z.number(),
      timestamp: z.string(),
    }),
  }),
  z.object({
    type: z.literal("server_status"),
    payload: z.object({
      serverId: z.string(),
      status: z.string(),
      port: z.number(),
    }),
  }),
  z.object({
    type: z.literal("log_entry"),
    payload: z.object({
      serverId: z.string(),
      message: z.string(),
      timestamp: z.string(),
      level: z.enum(["info", "warning", "error", "success"]),
    }),
  }),
]);

export type WsMessage = z.infer<typeof wsMessageSchema>;
