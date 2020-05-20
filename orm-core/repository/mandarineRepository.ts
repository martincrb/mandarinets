// where T is the model
export type RepositoryModeler = {
    instance: any,
    object: any
};

export abstract class MandarineRepository<T> {

    private modeler: RepositoryModeler;

    constructor(TCreator: { new (): T; }) {
        this.modeler = {
            instance: TCreator,
            object: new TCreator()
        };
    
     }

     public getModeler(): RepositoryModeler {
         return this.modeler;
     }

     public save(model: T) {}
     public findAll() {}
     public deleteAll() {}

}
