import { Mandarine } from "../../mod.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { MandarineRepository } from "./mandarineRepository.ts";
import { MandarineRepositoryException } from "../core/exceptions/RepositoryException.ts";
import { ReflectUtils } from "../../main-core/utils/reflectUtils.ts";
import { RepositoryProxy } from "./repository-proxy.ts";

export class RepositoryRegistry implements Mandarine.ORM.Entity.Repository.RepositoryRegistry {
    private repos: Map<string, Mandarine.ORM.Entity.Repository.Repository> = new Map<string, Mandarine.ORM.Entity.Repository.Repository>();

    public register(instance: any): void {
        try {
            let mandarineRepository: object & MandarineRepository<any> = new instance();
            let entity: Mandarine.ORM.Entity.Table = ApplicationContext.getInstance().getEntityManager().entityRegistry.findEntityByInstanceType(mandarineRepository.getModeler().object);
            
            if(entity != (null || undefined)) {
                if(this.repos.get(`${entity.schema}.${entity.tableName}`) == (null || undefined)) {

                    this.repos.set(`${entity.schema}.${entity.tableName}`, {
                        table: entity.tableName,
                        schema: entity.schema,
                        instance: instance
                    });
                }
            } else {
                throw new MandarineRepositoryException(MandarineRepositoryException.INVALID_REPOSITORY, ReflectUtils.getClassName(instance));
            }

        } catch(error) {
            console.log(error);
            throw new MandarineRepositoryException(MandarineRepositoryException.INVALID_REPOSITORY, ReflectUtils.getClassName(instance));
        }
    }

    public getAllRepositories(): Array<Mandarine.ORM.Entity.Repository.Repository> {
        return Array.from(this.repos.values());
    }

    private connectRepositoryToProxy(repositoryObject: Mandarine.ORM.Entity.Repository.Repository) {
        let repositoryInstance: any = repositoryObject.instance;
        let repositoryMethods: Array<string> = ReflectUtils.getMethodsFromClass(repositoryInstance);

        let repositoryProxy = new RepositoryProxy<any>(`${repositoryObject.schema}.${repositoryObject.table}`);

        repositoryMethods.forEach((methodName) => {
            let methodParameterNames: Array<string> = ReflectUtils.getParamNames(repositoryInstance.prototype[methodName]);

            if(methodName.startsWith('find')) {
                repositoryInstance.prototype[methodName] = (...args) => { 
                    return repositoryProxy.mainProxy(methodName, methodParameterNames, "findBy", args);
                }
                repositoryInstance.prototype[methodName]("chocolate", true, 100);
            } else if(methodName.startsWith('exists')) {
                repositoryInstance.prototype[methodName] = (...args) => { 
                    return repositoryProxy.mainProxy(methodName, methodParameterNames, "existsBy", args);
                }
                repositoryInstance.prototype[methodName](true);
            } else if(methodName.startsWith('delete')) {
                repositoryInstance.prototype[methodName] = (...args) => { 
                    return repositoryProxy.mainProxy(methodName, methodParameterNames, "deleteBy", args);
                }
                repositoryInstance.prototype[methodName]("chocolate", 100, false);
            }
        });

        return repositoryInstance;
    }

    public connectRepositoriesToProxy(): void {

        this.getAllRepositories().forEach((repo) => {
            this.repos.set(`${repo.schema}.${repo.table}`, {
                table: repo.table,
                schema: repo.schema,
                instance: this.connectRepositoryToProxy(repo)
            });
        });

    }
}