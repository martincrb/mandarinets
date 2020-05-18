import { Mandarine } from "../../mod.ts";
import { createSchema } from "./query.create-schema.ts";

export class QueryBuilder<T extends Mandarine.ORM.Dialect.Dialect> {
    private dialectClass: T;

    private options: {
        currentSchema: string
    } = {
        currentSchema: undefined
    };

    public createSchema: Function;

    public withSchema(schema: string): QueryBuilder<T> {
        this.options.currentSchema = schema;
        return this;
    }

    constructor(TCreator: { new (): T; }) {
        this.dialectClass = new TCreator();

        this.createSchema = createSchema(this.dialectClass);
    }


}
