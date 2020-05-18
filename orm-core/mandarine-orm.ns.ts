import { Types } from "./sql/types.ts";
import { Column } from "https://deno.land/x/postgres/connection.ts";
export namespace MandarineORM {

    export namespace Dialect {

        export enum Dialects {
            POSTGRESQL = "postgres"
        };
    }

    export namespace Entity {

        export namespace Decorators {
            export interface Table {
                name: string;
                schema: string;
            }

            export interface Column {
                name?: string;
                fieldName?: string;
                type?: Types;
                unique?: boolean;
                nullable?: boolean;
                length?: number;
                precision?: number;
                scale?: number;
                incrementStrategy?: boolean;
                options?: any;
            }

            export interface GeneratedValue {
                strategy: "SEQUENCE" | "MANUAL",
                manualHandler?: Function;
            }
        }

        export interface EntitiesRegistry {
            register(schemaName: string, tableName: string, instance: any): void;
            getColumnsFromEntity(entityInstance: any): Array<Entity.Decorators.Column>;
            getAllEntities(): Array<Entity.Table>;
        }

        export interface Column extends Entity.Decorators.Column {
        }

        export interface Table {
            tableName: string;
            schema: string;
            columns: Column[];
            uniqueConstraints: Column[];
            primaryKey: string;
            instance: any;
        }
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

    export namespace Defaults {
        export const ColumnDecoratorDefault: Entity.Decorators.Column = {
            name: undefined,
            unique: false,
            nullable: true,
            length: 255,
            precision: 8,
            scale: 2
        };
    }
}