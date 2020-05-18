import { Mandarine } from "../../mod.ts";
import { QueryBuilder } from "./queryBuilder.ts";

export const createTable = (queryBuilder: QueryBuilder<any>, currentDialect: Mandarine.ORM.Dialect.Dialect): Function => {
    return (schemaName: string, ifNotExist?: boolean, authorization?: string) => {
        
    };
}