import { EntitiesRegistry } from "../entities-registry/entities-registry.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import { QueryBuilder } from "../query-builder/queryBuilder.ts";
import { PostgreSQLDialect } from "../dialect/postgresqlDialect.ts";
import { RepositoryRegistry } from "../repository/repository-registry.ts";

export class EntityManagerClass {
    private databaseConnector: Mandarine.ORM.Connector.Connector;
    private databaseInstance: any;
    private connectorOptions: Mandarine.ORM.Connector.ConnectorOptions;

    entityRegistry: EntitiesRegistry;
    repositoryRegistry: RepositoryRegistry;
    public queryBuilder: QueryBuilder<any>;
    public dialect: Mandarine.ORM.Dialect.Dialects;

    constructor() {
        this.entityRegistry = new EntitiesRegistry();
        this.repositoryRegistry = new RepositoryRegistry();
    }

    public initialize(dbConnector: Mandarine.ORM.Connector.Connector, dbInstance: any, connectorOptions: Mandarine.ORM.Connector.ConnectorOptions, dialect: Mandarine.ORM.Dialect.Dialects) {
        this.databaseConnector = dbConnector;
        this.databaseInstance = dbInstance;
        this.connectorOptions = connectorOptions;

        switch(dialect) {
            case Mandarine.ORM.Dialect.Dialects.POSTGRESQL:
                this.queryBuilder = new QueryBuilder<PostgreSQLDialect>(PostgreSQLDialect);
                this.dialect = Mandarine.ORM.Dialect.Dialects.POSTGRESQL;
            break;
        }
        this.repositoryRegistry.connectRepositoriesToProxy();
    }

    public async initializeAllEntities() {

        let entityTableInitializationQuery = "";

        let entities: Array<Mandarine.ORM.Entity.Table> = this.entityRegistry.getAllEntities();

        // CREATE TABLES
        entities.forEach((table) => {

            let tableMetadata: Mandarine.ORM.Entity.TableMetadata = this.queryBuilder.query().getTableMetadata(table);

            let entityCreationQuery = this.queryBuilder.query().createTable(tableMetadata, undefined, true);

            entityTableInitializationQuery += entityCreationQuery;
        });
        // DIVIDED FROM THE LOOP SINCE MULTIPLE TABLES MAY MEAN MULTIPLE QUERIES
        if(entityTableInitializationQuery != "") {
            await this.databaseConnector.query(entityTableInitializationQuery);
        }

        // ***********************

        // CREATE COLUMNS IN TABLES
        entities.forEach(async (table) => {
            let tableMetadata: Mandarine.ORM.Entity.TableMetadata = this.queryBuilder.query().getTableMetadata(table);
            let entityColumnsInitializationQuery = "";

            if(table.columns != (null || undefined)) {
                table.columns.forEach((col) => {
                    entityColumnsInitializationQuery += this.queryBuilder.query().addColumn(tableMetadata, col);
                });
            }

            if(entityColumnsInitializationQuery != "") {
                await this.databaseConnector.query(entityColumnsInitializationQuery);
            }
        });

        // CREATE PRIMARY KEY AND UNIQUE CONSTRAINTS FOR THE COLUMNS IN TABLE
        entities.forEach(async (table) => {
            let tableMetadata: Mandarine.ORM.Entity.TableMetadata = this.queryBuilder.query().getTableMetadata(table);

            let entityPrimaryKeyConstraintsQuery = "";

            if(table.primaryKey != (null || undefined)) {
                entityPrimaryKeyConstraintsQuery += this.queryBuilder.query().addPrimaryKey(tableMetadata, table.primaryKey);
            }

            if(table.uniqueConstraints != (null || undefined)) {
                table.uniqueConstraints.forEach((uniqueConstraint: Mandarine.ORM.Entity.Column) => {
                    entityPrimaryKeyConstraintsQuery += this.queryBuilder.query().addUniqueConstraint(tableMetadata, uniqueConstraint);
                })
            }

            if(entityPrimaryKeyConstraintsQuery != "") {
                try {
                await this.databaseConnector.query(entityPrimaryKeyConstraintsQuery);
                } catch(error) {
                    // ignore
                }
            }
        });
    }

    public getDatabaseConnector(): Mandarine.ORM.Connector.Connector {
        let newConnection: Mandarine.ORM.Connector.Connector  = Object.assign( Object.create( Object.getPrototypeOf(this.databaseConnector)), this.databaseInstance);
        newConnection.initializeEssentials(this.connectorOptions);
        return newConnection;
    }
}