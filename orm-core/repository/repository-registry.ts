import { Mandarine } from "../../mod.ts";
import { ApplicationContext } from "../../main-core/application-context/mandarineApplicationContext.ts";
import { ReflectUtils } from "../../main-core/utils/reflectUtils.ts";
import { RepositoryProxy } from "./repository-proxy.ts";
import { MandarineRepository } from "./mandarineRepository.ts";

export class RepositoryRegistry implements Mandarine.ORM.Entity.Repository.RepositoryRegistry {

    public getAllRepositories(): Array<Mandarine.MandarineCore.ComponentRegistryContext> {
        return ApplicationContext.getInstance().getComponentsRegistry().getComponentsByComponentType(Mandarine.MandarineCore.ComponentTypes.REPOSITORY);
    }

    private connectRepositoryToProxy(repositoryObject: Mandarine.MandarineCore.ComponentRegistryContext) {
        let repositoryInstance: any = repositoryObject.componentInstance;
        let repositoryMethods: Array<string> = ReflectUtils.getMethodsFromClass(repositoryInstance);
        let mandarineRepositoryMethods: Array<string> = ReflectUtils.getMethodsFromClass(MandarineRepository);
        repositoryMethods = repositoryMethods.concat(mandarineRepositoryMethods);
        
        let repositoryProxy = new RepositoryProxy<any>(`${repositoryObject.componentExtradata.schema}.${repositoryObject.componentExtradata.table}`);

        repositoryMethods.forEach((methodName) => {
            let methodParameterNames: Array<string> = ReflectUtils.getParamNames(repositoryInstance.prototype[methodName]);

            switch(methodName) {
                case 'findAll':
                    repositoryInstance.prototype[methodName] = (...args) => {
                        repositoryProxy.findAll();
                    }
                    return;
                    break;
                case 'deleteAll':
                    repositoryInstance.prototype[methodName] = (...args) => {
                        repositoryProxy.deleteAll();
                    }
                    return;
                    break;
                case 'save':
                    repositoryInstance.prototype[methodName] = (...args) => {
                        repositoryProxy.save(methodParameterNames, args);
                    }
                    return;
                    break;
            }

            if(methodName.startsWith('find')) {
                repositoryInstance.prototype[methodName] = (...args) => { 
                    return repositoryProxy.mainProxy(methodName, methodParameterNames, "findBy", args);
                }
            } else if(methodName.startsWith('exists')) {
                repositoryInstance.prototype[methodName] = (...args) => { 
                    return repositoryProxy.mainProxy(methodName, methodParameterNames, "existsBy", args);
                }
            } else if(methodName.startsWith('delete')) {
                repositoryInstance.prototype[methodName] = (...args) => { 
                    return repositoryProxy.mainProxy(methodName, methodParameterNames, "deleteBy", args);
                }
            }
        });

        return repositoryInstance;
    }

    public connectRepositoriesToProxy(): void {

        this.getAllRepositories().forEach((repo) => {
            repo.componentInstance = this.connectRepositoryToProxy(repo);
            repo.componentInstance = new repo.componentInstance();
            ApplicationContext.getInstance().getComponentsRegistry().update(`repo:${repo.componentExtradata.schema}.${repo.componentExtradata.tableName}`,repo);
        });

    }

    public getRepositoryByHandlerType(classType: any): Mandarine.MandarineCore.ComponentRegistryContext {
        return this.getAllRepositories().find(repo => {
            let instance: any = repo.componentInstance;
            if(!ReflectUtils.checkClassInitialized(instance)) instance = new instance();
            return instance instanceof classType;
        });
    }
}