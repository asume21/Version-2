import { 
  type User, 
  type InsertUser,
  type Project,
  type InsertProject,
  type CodeTranslation,
  type InsertCodeTranslation,
  type MusicGeneration,
  type InsertMusicGeneration
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Project operations
  getProject(id: string): Promise<Project | undefined>;
  getUserProjects(userId: string): Promise<Project[]>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: string, project: Partial<Project>): Promise<Project | undefined>;
  deleteProject(id: string): Promise<boolean>;

  // Code translation operations
  getCodeTranslation(id: string): Promise<CodeTranslation | undefined>;
  getUserCodeTranslations(userId: string): Promise<CodeTranslation[]>;
  createCodeTranslation(translation: InsertCodeTranslation): Promise<CodeTranslation>;

  // Music generation operations
  getMusicGeneration(id: string): Promise<MusicGeneration | undefined>;
  getUserMusicGenerations(userId: string): Promise<MusicGeneration[]>;
  createMusicGeneration(generation: InsertMusicGeneration): Promise<MusicGeneration>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User> = new Map();
  private projects: Map<string, Project> = new Map();
  private codeTranslations: Map<string, CodeTranslation> = new Map();
  private musicGenerations: Map<string, MusicGeneration> = new Map();

  // User operations
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date() 
    };
    this.users.set(id, user);
    return user;
  }

  // Project operations
  async getProject(id: string): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(project => project.userId === userId);
  }

  async createProject(insertProject: InsertProject): Promise<Project> {
    const id = randomUUID();
    const project: Project = { 
      ...insertProject, 
      id, 
      createdAt: new Date(),
      updatedAt: new Date(),
      isPublic: insertProject.isPublic ?? null
    };
    this.projects.set(id, project);
    return project;
  }

  async updateProject(id: string, updates: Partial<Project>): Promise<Project | undefined> {
    const project = this.projects.get(id);
    if (!project) return undefined;
    
    const updatedProject = { 
      ...project, 
      ...updates, 
      updatedAt: new Date() 
    };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: string): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Code translation operations
  async getCodeTranslation(id: string): Promise<CodeTranslation | undefined> {
    return this.codeTranslations.get(id);
  }

  async getUserCodeTranslations(userId: string): Promise<CodeTranslation[]> {
    return Array.from(this.codeTranslations.values()).filter(
      translation => translation.userId === userId
    );
  }

  async createCodeTranslation(insertTranslation: InsertCodeTranslation): Promise<CodeTranslation> {
    const id = randomUUID();
    const translation: CodeTranslation = { 
      ...insertTranslation, 
      id, 
      createdAt: new Date(),
      userId: insertTranslation.userId ?? null
    };
    this.codeTranslations.set(id, translation);
    return translation;
  }

  // Music generation operations
  async getMusicGeneration(id: string): Promise<MusicGeneration | undefined> {
    return this.musicGenerations.get(id);
  }

  async getUserMusicGenerations(userId: string): Promise<MusicGeneration[]> {
    return Array.from(this.musicGenerations.values()).filter(
      generation => generation.userId === userId
    );
  }

  async createMusicGeneration(insertGeneration: InsertMusicGeneration): Promise<MusicGeneration> {
    const id = randomUUID();
    const generation: MusicGeneration = { 
      ...insertGeneration, 
      id, 
      createdAt: new Date(),
      userId: insertGeneration.userId ?? null
    };
    this.musicGenerations.set(id, generation);
    return generation;
  }
}

export const storage = new MemStorage();
