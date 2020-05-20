import { ApplicationContext } from "../../../main-core/application-context/mandarineApplicationContext.ts";
import { ComponentsRegistryUtil } from "../../../main-core/components-registry/componentRegistry.util.ts";

export const Repository = (): Function => {
    return (target: any) => {
        ComponentsRegistryUtil.registerRepositoryComponent(target);
    };
}