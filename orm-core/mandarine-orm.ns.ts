import { Types } from "./sql/types.ts";
import { TableCreationClass } from "./query-builder/tables.table-creation-context.ts";

export namespace MandarineORM {

    export namespace Dialect {

        export enum Dialects {
            POSTGRESQL = "postgres"
        };

        export interface Type {
            type: Types;
            value: string;
        }

        export interface Dialect {
            types: Map<Types, Type>;
            registerType(type: Types, value: string): void;
            getType(type: Types): Type;
            createSchemaString(name: string, ifNotExist?: boolean, authorization?: string): string;
            defaultSchema(): string;
            maximumLengthInVarchar(): number;
        }
    }

    export namespace Tables {
        
        export interface FinalType {
            type: Types;
            finalValue: string;
            options?: any;
        }

        export const TableCreationContext = TableCreationClass;
    }

    export namespace Connector {
        export interface Connector {
            client: any;
            options: ConnectorOptions;
            connected: boolean;
            makeConnection(callback?: () => void): void;
            query(query: string): Promise<any[]>;
            transaction?(queries: string[]): Promise<any[]>;
            close(callback?: (error, result) => void): void;
        }

        export interface ConnectorOptions {
            host: string;
            username: string;
            password: string;
            database: string;
            port: number;
        }
    }
}