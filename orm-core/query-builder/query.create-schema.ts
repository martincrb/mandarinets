import { Mandarine } from "../../mod.ts";

export const createSchema = (currentDialect: Mandarine.ORM.Dialect.Dialect): Function => {
    return (schemaName: string, ifNotExist?: boolean, authorization?: string) => {
        currentDialect.createSchemaString(schemaName, ifNotExist, authorization)
    };
}