import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const projects = pgTable("projects", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  name: text("name").notNull(),
  type: text("type").notNull(), // 'code', 'music', 'codebeat'
  content: jsonb("content").notNull(),
  isPublic: boolean("is_public").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const codeTranslations = pgTable("code_translations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  sourceLanguage: text("source_language").notNull(),
  targetLanguage: text("target_language").notNull(),
  sourceCode: text("source_code").notNull(),
  translatedCode: text("translated_code").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const musicGenerations = pgTable("music_generations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").references(() => users.id),
  type: text("type").notNull(), // 'lyrics', 'beat', 'melody', 'codebeat'
  prompt: text("prompt").notNull(),
  result: jsonb("result").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertProjectSchema = createInsertSchema(projects).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCodeTranslationSchema = createInsertSchema(codeTranslations).omit({
  id: true,
  createdAt: true,
});

export const insertMusicGenerationSchema = createInsertSchema(musicGenerations).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type CodeTranslation = typeof codeTranslations.$inferSelect;
export type InsertCodeTranslation = z.infer<typeof insertCodeTranslationSchema>;

export type MusicGeneration = typeof musicGenerations.$inferSelect;
export type InsertMusicGeneration = z.infer<typeof insertMusicGenerationSchema>;
