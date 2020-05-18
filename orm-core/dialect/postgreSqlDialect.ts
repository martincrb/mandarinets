import { Mandarine } from "../../main-core/Mandarine.ns.ts";
import auth from "https://deno.land/x/mysql/src/auth.ts";
import { Types } from "../sql/types.ts";

export class PostgreSQLDialect implements Mandarine.ORM.Dialect.Dialect {
    public types: Map<Types, Mandarine.ORM.Dialect.Type> = new Map<Types, Mandarine.ORM.Dialect.Type>();

    constructor() {
        this.registerType(Types.BIGINT, "int8" );
        this.registerType(Types.BOOLEAN, "boolean" );
		this.registerType(Types.SMALLINT, "int2" );
		this.registerType(Types.TINYINT, "int2" );
		this.registerType(Types.INTEGER, "int4" );
		this.registerType(Types.CHAR, "char(1)" );
		this.registerType(Types.VARCHAR, "varchar($l)" );
		this.registerType(Types.FLOAT, "float4" );
		this.registerType(Types.DOUBLE, "float8" );
		this.registerType(Types.DATE, "date" );
		this.registerType(Types.TIME, "time" );
		this.registerType(Types.TIMESTAMP, "timestamp" );
		this.registerType(Types.VARBINARY, "bytea" );
		this.registerType(Types.BINARY, "bytea" );
		this.registerType(Types.LONGVARCHAR, "text" );
		this.registerType(Types.LONGVARBINARY, "bytea" );
		this.registerType(Types.CLOB, "text" );
		this.registerType(Types.BLOB, "oid" );
		this.registerType(Types.NUMERIC, "numeric($p, $s)" );
        this.registerType(Types.UUID, "uuid" );
        this.registerType(Types.JSON, "json" );
        this.registerType(Types.JSONB, "jsonb" );

    }

    registerType(type: Types, value: string): void {
        if(this.getType(type) == (null || undefined)) {
            this.types.set(type, {
                type: type,
                value: value,
            });
        }
    }

    getType(type: Types): Mandarine.ORM.Dialect.Type {
        return this.types.get(type);
    }

    createSchemaString(name: string, ifNotExist?: boolean, authorization?: string): string {
        let syntax: string = `CREATE SCHEMA [ifNotExist] ${name} [authorization]`;

        if(ifNotExist != undefined && ifNotExist) {
            syntax = syntax.replace("[ifNotExist]", "IF NOT EXISTS");
        } else {
            syntax = syntax.replace("[ifNotExist]", "");
        }

        if(authorization != undefined && authorization) {
            syntax = syntax.replace("[authorization]", `AUTHORIZATION ${authorization}`);
        } else {
            syntax = syntax.replace("[authorization]", "");
        }

        return syntax;
    }

    defaultSchema(): string {
        return "public";
    }

    maximumLengthInVarchar(): number {
        return 255;
    }
}