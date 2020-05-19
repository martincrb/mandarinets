import { Types } from "./sql/types.ts";
import { Column } from "https://deno.land/x/postgres/connection.ts";
import { QueryBuilder } from "./query-builder/queryBuilder.ts";
import { PostgreSQLDialect } from "./dialect/postgresqlDialect.ts";
import { EntitiesRegistry } from "./entities-registry/entities-registry.ts";

export namespace MandarineORM {

    export namespace Dialect {

        export enum Dialects {
            POSTGRESQL = "postgres"
        };

        export interface Dialect {
            getDefaultSchema(): string;
            getColumnTypeSyntax(column: Entity.Decorators.Column): string;
            createTable(tableMetadata: Entity.TableMetadata, colums: Array<Entity.Decorators.Column>, ifNotExist: boolean): string;
            addPrimaryKey(tableMetadata: Entity.TableMetadata, primaryKeyCol: Entity.Decorators.Column): string
            addUniqueConstraint(tableMetadata: Entity.TableMetadata, uniqueCol: Entity.Decorators.Column): string;
        }
    }

    export namespace Entity {

        export interface TableMetadata {
            name: string;
            schema: string;
        }

        export namespace Decorators {

            export interface Table extends TableMetadata {
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

        export class EntityManager {
            private databaseConnector: Connector.Connector;
            entityRegistry: EntitiesRegistry;
            public queryBuilder: QueryBuilder<any>;

            constructor() {
                this.entityRegistry = new EntitiesRegistry();
            }

            public initialize(dbConnector: Connector.Connector, dialect: Dialect.Dialects) {
                this.databaseConnector = dbConnector;
                switch(dialect) {
                    case Dialect.Dialects.POSTGRESQL:
                        this.queryBuilder = new QueryBuilder<PostgreSQLDialect>(PostgreSQLDialect);
                    break;
                }
            }

            public initializeAllEntities() {
                this.entityRegistry.getAllEntities().forEach((table) => {
                    // TO DO
                    console.log(this.queryBuilder.query().createTable({
                        name: table.tableName,
                        schema: table.schema
                    }, table.columns, true));
                });
            }
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