import { Types } from "./sql/types.ts";
import { EntityManagerClass } from "./core/entityManager.ts";
import { Mandarine } from "../mod.ts";

export namespace MandarineORM {

    export namespace Dialect {

        export enum Dialects {
            POSTGRESQL = "postgres"
        };

        export interface Dialect {
            getDefaultSchema(): string;
            getTableMetadata(table: Entity.Table): Entity.TableMetadata;
            getColumnTypeSyntax(column: Entity.Decorators.Column): string;
            createTable(tableMetadata: Entity.TableMetadata, colums: Array<Entity.Decorators.Column>, ifNotExist: boolean): string;
            addPrimaryKey(tableMetadata: Entity.TableMetadata, primaryKeyCol: Entity.Decorators.Column): string
            addUniqueConstraint(tableMetadata: Entity.TableMetadata, uniqueCol: Entity.Decorators.Column): string;
            addColumn(tableMetadata: Entity.TableMetadata, column: Entity.Column): string;
            mqlSelectStatement(): string;
            mqlSelectCountStatement(): string;
            mpqlDeleteStatement(): string;
            mpqlSelectColumnSyntax(colName: string): string;
            mpqlInsertStatement(columns: Array<string>, values: object): string;
            mpqlSelectAllStatement(): string;
            mpqlDeleteAllStatement(): string;
        }
    }

    export namespace Entity {

        export interface TableMetadata {
            name?: string;
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
            findEntityByInstanceType(initializedInstance): Entity.Table;
        }

        export interface Column extends Entity.Decorators.Column {
        }

        export interface Table {
            tableName: string;
            schema: string;
            columns: Column[];
            uniqueConstraints: Column[];
            primaryKey: Column;
            instance: any;
            className: string;
        }

        export class EntityManager extends EntityManagerClass {}

        export namespace Repository {
            export interface RepositoryRegistry {
                getAllRepositories(): Array<Mandarine.MandarineCore.ComponentRegistryContext>;
                connectRepositoriesToProxy(): void;
                getRepositoryByHandlerType(classType: any): Mandarine.MandarineCore.ComponentRegistryContext;
            }

            export interface Repository {
                table: string;
                schema: string;
                instance: any;
            }
        }
    }

    export namespace Connector {
        export interface Connector {
            client: any;
            options: ConnectorOptions;
            connected: boolean;
            makeConnection(callback?: () => void): void;
            query(...args): Promise<any[]>;
            transaction?(...args): Promise<any[]>;
            close(callback?: (error, result) => void): void;
            initializeEssentials(connectorOptions: Connector.ConnectorOptions): void;
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