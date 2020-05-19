import { Mandarine } from "../../mod.ts";
import { Types } from "../sql/types.ts";

export class PostgreSQLDialect implements Mandarine.ORM.Dialect.Dialect {
    public getDefaultSchema(): string {
        return "public";
    }

    public getColumnTypeSyntax(column: Mandarine.ORM.Entity.Decorators.Column): string {

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

    public createTable(tableMetadata: Mandarine.ORM.Entity.TableMetadata, colums: Array<Mandarine.ORM.Entity.Decorators.Column>, ifNotExist: boolean): string {
        let syntax = `CREATE TABLE ${(ifNotExist) ? "IF NOT EXIST" : ""} ${(tableMetadata.schema == undefined) ? this.getDefaultSchema() : tableMetadata.schema}."${tableMetadata.name}"`;
        
        let columnSqls: Array<string> = new Array<string>();

        colums.forEach((column) => {
            columnSqls.push(`${column.name} ${this.getColumnTypeSyntax(column)} ${(column.nullable == false) ? "NOT NULL" : ""}`);
        });
        syntax += ` (
            ${columnSqls.join(",")}
            )`;

        return syntax;
    }

    public addPrimaryKey(tableMetadata: Mandarine.ORM.Entity.TableMetadata, primaryKeyCol: Mandarine.ORM.Entity.Decorators.Column): string {
        return `ALTER TABLE ${(tableMetadata.schema == undefined) ? this.getDefaultSchema() : tableMetadata.schema}.${tableMetadata.name} ADD PRIMARY KEY(${primaryKeyCol.name})`;
    }
    
    public addUniqueConstraint(tableMetadata: Mandarine.ORM.Entity.TableMetadata, uniqueCol: Mandarine.ORM.Entity.Decorators.Column): string {
        return `ALTER TABLE ${(tableMetadata.schema == undefined) ? this.getDefaultSchema() : tableMetadata.schema}.${tableMetadata.name} ADD UNIQUE (${uniqueCol.name})`;
    }
}