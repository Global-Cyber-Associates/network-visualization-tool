import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

class DbLogger {
    constructor() {
        this.logDir = path.join(__dirname, '..', 'logs');
        this.dbLogPath = path.join(this.logDir, 'db_operations.log');
        
        // Ensure directory exists
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir, { recursive: true });
        }

        // Initialize log file with header
        if (!fs.existsSync(this.dbLogPath)) {
            fs.writeFileSync(this.dbLogPath, '=== Database Operations Log ===\n');
        }
    }

    logOperation(operation) {
        const entry = {
            timestamp: new Date().toISOString(),
            ...operation
        };

        const line = JSON.stringify(entry, null, 2) + '\n---\n';
        
        try {
            fs.appendFileSync(this.dbLogPath, line);
            console.log(`[💾] DB ${operation.type}: ${operation.model} - ${operation.status}`);
        } catch (err) {
            console.error('[❌] Failed to write DB log:', err);
        }
    }

    success(model, type, data) {
        this.logOperation({
            type,
            model,
            status: 'success',
            agentId: data?.agent_id || data?.agentId || 'unknown',
            data: data
        });
    }

    error(model, type, error, data) {
        this.logOperation({
            type,
            model,
            status: 'error',
            error: error.message || String(error),
            agentId: data?.agent_id || data?.agentId || 'unknown',
            data: data
        });
    }
}

export const dbLogger = new DbLogger();
