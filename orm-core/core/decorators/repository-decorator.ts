import { ApplicationContext } from "../../../main-core/application-context/mandarineApplicationContext.ts";

export const Repository = (): Function => {
    return (target: any) => {
        ApplicationContext.getInstance().getEntityManager().repositoryRegistry.register(target);
    };
}