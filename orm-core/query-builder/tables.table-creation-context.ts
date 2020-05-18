import { MandarineORM } from "../mandarine-orm.ns.ts";
import { Types } from "../sql/types.ts";
import { Mandarine } from "../../main-core/Mandarine.ns.ts";

export class TableCreationClass {
    private columns: Map<string, Mandarine.ORM.Tables.FinalType> = new Map<string, Mandarine.ORM.Tables.FinalType>();
    private dialect: MandarineORM.Dialect.Dialect;
    
    constructor(dialect: MandarineORM.Dialect.Dialect) {
        this.dialect = dialect;
    }

    public string(colName: string, maxLength?: number): TableCreationClass {
        if(this.columns.get(colName) == (undefined || null)) {
            maxLength = (maxLength == (null || undefined)) ? this.dialect.maximumLengthInVarchar() : maxLength;

            this.addRegularColumn(colName, Types.VARCHAR, {
                maxLength: maxLength
            });
            
            return this;
        } else {
            // TODO
            throw new Error();
        }
    }

    public integer(colName: string): TableCreationClass {
        if(this.columns.get(colName) == (undefined || null)) {

            this.addRegularColumn(colName, Types.INTEGER);

            return this;
        } else {
            // TODO
            throw new Error();
        }
    }

    public bigInteger(colName: string): TableCreationClass{
        if(this.columns.get(colName) == (undefined || null)) {

            this.addRegularColumn(colName, Types.BIGINT);

            return this;
        } else {
            // TODO
            throw new Error();
        }
    }

    public text(colName: string): TableCreationClass {
        if(this.columns.get(colName) == (undefined || null)) {

            this.addRegularColumn(colName, Types.LONGNVARCHAR);

            return this;
        } else {
            // TODO
            throw new Error();
        }
    }

    public float(colName: string, precision?: number, scale?: number, float?: boolean): TableCreationClass {
        if(this.columns.get(colName) == (undefined || null)) {

            if(precision == (null || undefined)) precision = 8;
            if(scale == (null || undefined)) scale = 2;

            this.addRegularColumn(colName, Types.NUMERIC, {
                precision: (float) ? "null" : precision,
                scale: scale
            });
            
            return this;
        } else {
            // TODO
            throw new Error();
        }
    }

    public decimal(colName: string, scale?: number): TableCreationClass {
        return this.float(colName, null, scale, true);
    }

    public boolean(colName: string): TableCreationClass {
        if(this.columns.get(colName) == (undefined || null)) {

            this.addRegularColumn(colName, Types.BOOLEAN);

            return this;
        } else {
            // TODO
            throw new Error();
        }
    }

    public date(colName: string): TableCreationClass {
        if(this.columns.get(colName) == (undefined || null)) {

            this.addRegularColumn(colName, Types.DATE);
            
            return this;
        } else {
            // TODO
            throw new Error();
        }
    }

    public datetime(colName: string, options: {
        timezone?: boolean,
        precision?: number
    }): TableCreationClass {
        if(this.columns.get(colName) == (undefined || null)) {

            this.addRegularColumn(colName, Types.TIME, options);
            return this;
        } else {
            // TODO
            throw new Error();
        }
    }

    public timestamp(colName: string, options: {
        timezone?: boolean,
        precision?: number
    }): TableCreationClass {
        if(this.columns.get(colName) == (undefined || null)) {

            this.addRegularColumn(colName, Types.TIMESTAMP);

            return this;
        } else {
            // TODO
            throw new Error();
        }
    }

    public json(colName: string): TableCreationClass {
        if(this.columns.get(colName) == (undefined || null)) {

            this.addRegularColumn(colName, Types.JSON);

            return this;
        } else {
            // TODO
            throw new Error();
        }
    }

    public jsonb(colName: string): TableCreationClass {
        if(this.columns.get(colName) == (undefined || null)) {

            this.addRegularColumn(colName, Types.JSONB);

            return this;
        } else {
            // TODO
            throw new Error();
        }
    }

    public binary(colName: string): TableCreationClass {
        if(this.columns.get(colName) == (undefined || null)) {

            this.addRegularColumn(colName, Types.BINARY);

            return this;
        } else {
            // TODO
            throw new Error();
        }
    }

    private addRegularColumn(colName: string, sqlType: Types, options?: any) {
        let ormType = this.dialect.getType(sqlType);
        this.columns.set(colName, {
            type: ormType.type,
            finalValue: ormType.value,
            options: options
        });
    }
}