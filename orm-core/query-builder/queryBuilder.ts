import { Mandarine } from "../../mod.ts";

export class QueryBuilder<T extends Mandarine.ORM.Dialect.Dialect> {
    private dialectClass: T;

    constructor(TCreator: { new (): T; }) {
       this.dialectClass = new TCreator();
    }

    public query(): Mandarine.ORM.Dialect.Dialect {
        return this.dialectClass;
    }
}
