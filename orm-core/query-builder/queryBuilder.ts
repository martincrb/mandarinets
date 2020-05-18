import { Mandarine } from "../../mod.ts";
import Dex from "https://deno.land/x/dex/mod.ts";

export class QueryBuilder {
    
    private knex: any;

    public options: {
        currentSchema: string
    } = {
        currentSchema: undefined
    };

    constructor(dialect: Mandarine.ORM.Dialect.Dialects) {
        this.knex = Dex({client: dialect});
    }

    public withSchema(schema: string) {
        this.options.currentSchema = schema;
        return this;
    }

    public query() {
        return this.knex.withSchema(this.options.currentSchema);
    }

}
