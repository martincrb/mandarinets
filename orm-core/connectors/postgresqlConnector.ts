import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { PostgresClient } from "../deps.ts";
import { QueryConfig } from "https://deno.land/x/postgres/query.ts";

export class PostgreSQLConnector implements Mandarine.ORM.Connector.Connector {

    public client: PostgresClient;
    public options: Mandarine.ORM.Connector.ConnectorOptions;
    public connected: boolean = false;

    constructor(connectorOptions: Mandarine.ORM.Connector.ConnectorOptions) {
        this.initializeEssentials(connectorOptions);
    }

    public initializeEssentials(connectorOptions: Mandarine.ORM.Connector.ConnectorOptions) {
        this.options = connectorOptions;
        this.client = new PostgresClient({
            hostname: this.options.host,
            user: this.options.username,
            password: this.options.password,
            database: this.options.database,
            port: this.options.port
        });
    }

    transaction?(...args: any[]): Promise<any[]> {
        throw new Error("Method not implemented.");
    }

    public async makeConnection(callback?: () => void): Promise<void> {
        if(this.connected) return;
        await this.client.connect();

        if(callback != (undefined || null)) {
            callback();
        }

        this.connected = true;
    }

    public async query(query: string | QueryConfig): Promise<any[]> {
        try {
        await this.makeConnection();
        const results = await this.client.query(query);
        return await results.rowsOfObjects();
        } catch(error) {
            console.log(error, query);
        }
    }

    public async close(callback?: (error, result) => void): Promise<void> {
        if(!this.connected) {
            return;
        }

        await this.client.end();
        this.connected = false;
    }
}