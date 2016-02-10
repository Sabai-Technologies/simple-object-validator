/// <reference path="../typings/folktale/data.validation.d.ts"/>

interface Schema {
    [index:string]: {
        validations: ((value:any) => Validation)[]
    };
}

export = Schema;