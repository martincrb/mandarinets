import { Mandarine } from "../../mod.ts";
import { Types } from "../sql/types.ts";
import { RepositoryProxy } from "../repository/repository-proxy.ts";

export class PostgreSQLDialect implements Mandarine.ORM.Dialect.Dialect {

    public MQL_SUPPORTED_KEYWORDS: Array<string> = ["and", "or"];

    public getDefaultSchema(): string {
        return "public";
    }

    public getTableMetadata(table: Mandarine.ORM.Entity.Table): Mandarine.ORM.Entity.TableMetadata {
        let tableMetadata: Mandarine.ORM.Entity.TableMetadata = {
            name: table.tableName,
            schema: table.schema
        };

        if(tableMetadata.name == (null || undefined)) tableMetadata.name = table.className;
        if(tableMetadata.schema == (null || undefined)) tableMetadata.schema = this.getDefaultSchema();
        return tableMetadata;
    }

    public getColumnTypeSyntax(column: Mandarine.ORM.Entity.Column): string {

        if(column.incrementStrategy != undefined && column.incrementStrategy == true) {
            if(column.options.generatedValue.strategy == "SEQUENCE") {
                return `SERIAL`;
            }
        }

        switch(column.type) {
            case Types.VARCHAR:
            case Types.LONGVARCHAR:
                return `character varying(${column.length})`;
            break;
            case Types.NUMERIC:
                return `numeric(${column.precision},${column.scale})`;
            break;
            case Types.FLOAT:
                return `float4`;
            break;
            case Types.DOUBLE:
                return `double8`;
            break;
            case Types.DECIMAL:
                return `numeric`;
            break;
            case Types.BOOLEAN:
                return `boolean`;
            break;
            case Types.TEXT:
                return `text`;
            break;
            case Types.SMALLINT:
                return `int2`;
            break;
            case Types.CHAR:
                return `char(1)`;
            break;
            case Types.BIGINT:
                return `int8`;
            break;
            case Types.BIGSERIAL:
                return `bigserial`;
            break;
            case Types.DATE:
                return `date`;
            break;
            case Types.INTEGER:
                return `integer`;
            break;
            case Types.JSON:
                return `json`;
            break;
            case Types.JSONB:
                return `jsonb`;
            break;
            case Types.UUID:
                return `uuid`;
            break;
            case Types.TIME:
                return `time${(column.precision == undefined) ? "" : `(${column.precision})` } without time zone`;
            break;
            case Types.TIME_WITH_TIMEZONE:
                return `time${(column.precision == undefined) ? "" : `(${column.precision})` } with time zone`;
            break;
            case Types.TIMESTAMP:
                return `timestamp${(column.precision == undefined) ? "" : `(${column.precision})` } without time zone`;
            break;
            case Types.TIMESTAMP_WITH_TIMEZONE:
                return `timestamp${(column.precision == undefined) ? "" : `(${column.precision})` } with time zone`;
            break;
        }
    }

    public createTable(tableMetadata: Mandarine.ORM.Entity.TableMetadata, columns: Array<Mandarine.ORM.Entity.Column>, ifNotExist: boolean): string {
        let syntax = `CREATE TABLE ${(ifNotExist) ? "IF NOT EXISTS" : ""} ${(tableMetadata.schema == undefined) ? this.getDefaultSchema() : tableMetadata.schema}."${tableMetadata.name}"`;
        
        if(columns != (undefined || null)) {
            let columnSqls: Array<string> = new Array<string>();

            columns.forEach((column) => {
                columnSqls.push(`${column.name} ${this.getColumnTypeSyntax(column)} ${(column.nullable == false) ? "NOT NULL" : ""}`);
            });
            syntax += ` (
                ${columnSqls.join(",")}
                )`;

            syntax += ";";

            return syntax;
        } else {
            return syntax + "();";
        }
    }

    public addPrimaryKey(tableMetadata: Mandarine.ORM.Entity.TableMetadata, primaryKeyCol: Mandarine.ORM.Entity.Column): string {
        return `ALTER TABLE ${(tableMetadata.schema == undefined) ? this.getDefaultSchema() : tableMetadata.schema}.${tableMetadata.name} ADD PRIMARY KEY(${primaryKeyCol.name});`;
    }

    public addUniqueConstraint(tableMetadata: Mandarine.ORM.Entity.TableMetadata, uniqueCol: Mandarine.ORM.Entity.Column): string {
        return `ALTER TABLE ${(tableMetadata.schema == undefined) ? this.getDefaultSchema() : tableMetadata.schema}.${tableMetadata.name} ADD UNIQUE (${uniqueCol.name});`;
    }

    public addColumn(tableMetadata: Mandarine.ORM.Entity.TableMetadata, column: Mandarine.ORM.Entity.Column): string {
        return `ALTER TABLE ${tableMetadata.schema}.${tableMetadata.name} ADD COLUMN IF NOT EXISTS ${column.name} ${this.getColumnTypeSyntax(column)};`
    }

    public mqlSelectStatement(): string {
        return "SELECT * FROM %table% WHERE";
    }

    public mqlSelectCountStatement(): string {
        return "SELECT COUNT(*) FROM %table% WHERE";
    }

    public mpqlDeleteStatement(): string {
        return "DELETE FROM %table% WHERE";
    }

    public mpqlSelectColumnSyntax(colName: string): string {
        return `${colName} = '%${colName}%'`;
    }
}