import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { PostgresClient } from "../deps.ts";

export class PostgreSQLConnector implements Mandarine.ORM.Connector.Connector {

    public client: PostgresClient;
    public options: Mandarine.ORM.Connector.ConnectorOptions;
    public connected: boolean = false;

    constructor(options: Mandarine.ORM.Connector.ConnectorOptions) {
        this.options = options;

        this.client = new PostgresClient({
            hostname: this.options.host,
            user: this.options.username,
            password: this.options.password,
            database: this.options.database,
            port: this.options.port
        });
    }

    public async makeConnection(callback?: () => void): Promise<void> {
        if(this.connected) return;
        await this.client.connect();

        if(callback != (undefined || null)) {
            callback();
        }

        this.connected = true;
    }

    public async query(query: string): Promise<any[]> {
        await this.makeConnection();

        const results = await this.client.query(query);
        return results.rowsOfObjects();
    }

    public async close(callback?: (error, result) => void): Promise<void> {
        if(!this.connected) {
            return;
        }

        await this.client.end();
        this.connected = false;
    }
}