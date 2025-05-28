import Database from 'sqlite3';

export interface CustomAgent {
  id: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  color: string;
  systemPrompt: string;
  model: string;
  temperature: number;
  maxTokens: number;
  createdAt: string;
  updatedAt: string;
}

export interface StoredResource {
  id: string;
  title: string;
  description: string;
  type: 'pdf' | 'md' | 'text';
  fileSize: number;
  fileName: string;
  originalContent: string; // 原始文件内容（Base64编码）
  parsedContent: string;   // 解析后的纯文本内容
  createdAt: string;
  updatedAt: string;
}

class DatabaseManager {
  private db: Database.Database | null = null;

  async initialize() {
    return new Promise<void>((resolve, reject) => {
      this.db = new Database.Database('./agents.db', (err) => {
        if (err) {
          console.error('Error opening database:', err);
          reject(err);
        } else {
          console.log('Database connected successfully');
          this.createTables().then(resolve).catch(reject);
        }
      });
    });
  }

  private async createTables() {
    const createAgentsTable = `
      CREATE TABLE IF NOT EXISTS agents (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        category TEXT NOT NULL,
        color TEXT NOT NULL,
        system_prompt TEXT NOT NULL,
        model TEXT NOT NULL,
        temperature REAL DEFAULT 0.7,
        max_tokens INTEGER DEFAULT 1000,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    const createResourcesTable = `
      CREATE TABLE IF NOT EXISTS resources (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        type TEXT NOT NULL CHECK (type IN ('pdf', 'md', 'text')),
        file_size INTEGER NOT NULL,
        file_name TEXT NOT NULL,
        original_content TEXT NOT NULL,
        parsed_content TEXT NOT NULL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `;

    return new Promise<void>((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(createAgentsTable, (err) => {
        if (err) {
          console.error('Error creating agents table:', err);
          reject(err);
        } else {
          console.log('Agents table created successfully');
          
          // Create resources table
          this.db!.run(createResourcesTable, (err) => {
            if (err) {
              console.error('Error creating resources table:', err);
              reject(err);
            } else {
              console.log('Resources table created successfully');
              resolve();
            }
          });
        }
      });
    });
  }

  async getAllAgents(): Promise<CustomAgent[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.all(
        `SELECT 
          id, name, description, icon, category, color,
          system_prompt as systemPrompt, model, temperature, max_tokens as maxTokens,
          created_at as createdAt, updated_at as updatedAt
         FROM agents 
         ORDER BY created_at DESC`,
        (err, rows: unknown[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as CustomAgent[]);
          }
        }
      );
    });
  }

  async getAgentById(id: string): Promise<CustomAgent | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.get(
        `SELECT 
          id, name, description, icon, category, color,
          system_prompt as systemPrompt, model, temperature, max_tokens as maxTokens,
          created_at as createdAt, updated_at as updatedAt
         FROM agents 
         WHERE id = ?`,
        [id],
        (err, row: unknown) => {
          if (err) {
            reject(err);
          } else {
            resolve(row as CustomAgent || null);
          }
        }
      );
    });
  }

  async createAgent(agent: Omit<CustomAgent, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `agent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(
        `INSERT INTO agents (
          id, name, description, icon, category, color,
          system_prompt, model, temperature, max_tokens
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          agent.name,
          agent.description,
          agent.icon,
          agent.category,
          agent.color,
          agent.systemPrompt,
          agent.model,
          agent.temperature,
          agent.maxTokens
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(id);
          }
        }
      );
    });
  }

  async updateAgent(id: string, agent: Partial<Omit<CustomAgent, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(agent)) {
      if (value !== undefined) {
        // Convert camelCase to snake_case for database
        const dbKey = key === 'systemPrompt' ? 'system_prompt' : 
                     key === 'maxTokens' ? 'max_tokens' : key;
        fields.push(`${dbKey} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return Promise.resolve();
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(
        `UPDATE agents SET ${fields.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async deleteAgent(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run('DELETE FROM agents WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  // Resource management methods
  async getAllResources(): Promise<StoredResource[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.all(
        `SELECT 
          id, title, description, type, file_size as fileSize, file_name as fileName,
          original_content as originalContent, parsed_content as parsedContent,
          created_at as createdAt, updated_at as updatedAt
         FROM resources 
         ORDER BY created_at DESC`,
        (err, rows: unknown[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as StoredResource[]);
          }
        }
      );
    });
  }

  async getResourceById(id: string): Promise<StoredResource | null> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.get(
        `SELECT 
          id, title, description, type, file_size as fileSize, file_name as fileName,
          original_content as originalContent, parsed_content as parsedContent,
          created_at as createdAt, updated_at as updatedAt
         FROM resources 
         WHERE id = ?`,
        [id],
        (err, row: unknown) => {
          if (err) {
            reject(err);
          } else {
            resolve(row as StoredResource || null);
          }
        }
      );
    });
  }

  async createResource(resource: Omit<StoredResource, 'id' | 'createdAt' | 'updatedAt'>): Promise<string> {
    const id = `resource_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(
        `INSERT INTO resources (
          id, title, description, type, file_size, file_name,
          original_content, parsed_content
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          resource.title,
          resource.description,
          resource.type,
          resource.fileSize,
          resource.fileName,
          resource.originalContent,
          resource.parsedContent
        ],
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve(id);
          }
        }
      );
    });
  }

  async updateResource(id: string, resource: Partial<Omit<StoredResource, 'id' | 'createdAt' | 'updatedAt'>>): Promise<void> {
    const fields: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(resource)) {
      if (value !== undefined) {
        // Convert camelCase to snake_case for database
        const dbKey = key === 'fileSize' ? 'file_size' : 
                     key === 'fileName' ? 'file_name' :
                     key === 'originalContent' ? 'original_content' :
                     key === 'parsedContent' ? 'parsed_content' : key;
        fields.push(`${dbKey} = ?`);
        values.push(value);
      }
    }

    if (fields.length === 0) {
      return Promise.resolve();
    }

    fields.push('updated_at = CURRENT_TIMESTAMP');
    values.push(id);

    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run(
        `UPDATE resources SET ${fields.join(', ')} WHERE id = ?`,
        values,
        function(err) {
          if (err) {
            reject(err);
          } else {
            resolve();
          }
        }
      );
    });
  }

  async deleteResource(id: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.run('DELETE FROM resources WHERE id = ?', [id], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }

  async searchResources(query: string): Promise<StoredResource[]> {
    return new Promise((resolve, reject) => {
      if (!this.db) {
        reject(new Error('Database not initialized'));
        return;
      }

      this.db.all(
        `SELECT 
          id, title, description, type, file_size as fileSize, file_name as fileName,
          original_content as originalContent, parsed_content as parsedContent,
          created_at as createdAt, updated_at as updatedAt
         FROM resources 
         WHERE title LIKE ? OR description LIKE ? OR parsed_content LIKE ?
         ORDER BY created_at DESC`,
        [`%${query}%`, `%${query}%`, `%${query}%`],
        (err, rows: unknown[]) => {
          if (err) {
            reject(err);
          } else {
            resolve(rows as StoredResource[]);
          }
        }
      );
    });
  }

  async close() {
    return new Promise<void>((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            reject(err);
          } else {
            console.log('Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

export const dbManager = new DatabaseManager(); 