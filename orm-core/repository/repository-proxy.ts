import { QueryBuilder } from "../query-builder/queryBuilder.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { Mandarine } from "../../mod.ts";

export class RepositoryProxy<T> {

    private static readonly SUPPORTED_KEYWORDS = ["and", "or"];

    private currentDialect: Mandarine.ORM.Dialect.Dialect;

    private tableReferenceName: string;

    constructor(tableReferenceName: string) {
        this.currentDialect = ApplicationContext.getInstance().getEntityManager().queryBuilder.query();
        this.tableReferenceName = tableReferenceName;
    }

    private getQueryKeysValues(repositoryMethodParameterNames: Array<string>, args: Array<any>) {
        let values: object = {};
        repositoryMethodParameterNames.forEach((item, index) => {
            values[item] = args[index];
        });
        return values;
    }

    private lexicalProcessor(methodName: string, repositoryMethodParameterNames: Array<string>, proxyType: "findBy" | "existsBy" | "deleteBy") {
        repositoryMethodParameterNames = repositoryMethodParameterNames.map(item => item.toLowerCase());
        methodName = methodName.replace(proxyType, "").toLowerCase();

        let mainQuery = "";

        switch(proxyType) {
            case "findBy":
                mainQuery += `${this.currentDialect.mqlSelectStatement()} `;
            break;
            case "existsBy":
                mainQuery += `${this.currentDialect.mqlSelectCountStatement()} `;
            break;
            case "deleteBy":
                mainQuery += `${this.currentDialect.mpqlDeleteStatement()} `;
            break;
        }

        let currentWord = "";
        for(let i = 0; i<methodName.length; i++) {
            currentWord += methodName.charAt(i);

            if(repositoryMethodParameterNames.some(parameter => currentWord == parameter)) {
                mainQuery += `${this.currentDialect.mpqlSelectColumnSyntax(currentWord)} `;
                currentWord = "";
            } else if(RepositoryProxy.SUPPORTED_KEYWORDS.some(keyword => keyword == currentWord)) {
                mainQuery += `${currentWord} `;
                currentWord = "";
            }

        }

        return mainQuery;
    }

    public mainProxy(nativeMethodName: string, repositoryMethodParameterNames: Array<string>, proxyType: "findBy" | "existsBy" | "deleteBy", args: Array<any>): any {
        let values: object = this.getQueryKeysValues(repositoryMethodParameterNames.map(item => item.toLowerCase()), args);
        let mqlQuery: string = this.lexicalProcessor(nativeMethodName, repositoryMethodParameterNames, proxyType);
        Object.keys(values).forEach((valueKey, index) => {
            mqlQuery = mqlQuery.replace(`'%${valueKey}%'`, `$${index}`);
        });
        mqlQuery = mqlQuery.replace("%table%", this.tableReferenceName);
        
        let entityManager = ApplicationContext.getInstance().getEntityManager();
        switch(entityManager.dialect) {
            case Mandarine.ORM.Dialect.Dialects.POSTGRESQL:
                return entityManager.getDatabaseConnector().query({
                    text: mqlQuery + ";",
                    args: args
                });
            break;
        }
    }

}