/// <reference path="../typings/folktale/data.validation.d.ts"/>
/// <reference path="../typings/ramda/ramda.d.ts"/>

import Schema = require("./schema");
import Validation = require('data.validation');
import R = require('ramda');
import KeyValuePair = R.KeyValuePair;
import CurriedFunction2 = R.CurriedFunction2;

export var validate:CurriedFunction2<Schema, any, Validation> = R.curry(
    (schema:Schema, obj:any):Validation => {
        if (R.is(Object, obj)) {
            let validations:Validation[] = R.compose(R.map(convert), R.toPairs, validateObj(schema))(obj);
            let validation = reduce(R.prepend(Validation.of(R.curryN(validations.length, R.identity)), validations));

            return validation.bimap(R.compose(R.of, R.mergeAll), () => obj);
        }

        return Validation.Failure([`Error: cannot validate object: ${obj}`]);
    }
);

const validateObj:CurriedFunction2<Schema,{[index:string]:any}, {[index:string]:Validation}> = R.curry(
    (schema:Schema, object:{[index:string]:any}):{[index:string]:Validation} => {
        return R.mapObjIndexed(validateProp(schema), R.pick(R.keys(schema), object))
    }
);

const validateProp = (schema:Schema):(value:any, key:string) => Validation => {
    return (value:any, key:string):Validation => {
        let validations:Validation[] = R.ap(schema[key].validations, R.of(value));

        return reduce(R.prepend(Validation.of(R.curryN(validations.length, ()=>value)), validations));
    }
};

const convert = (pair:KeyValuePair<string, Validation>):Validation => {
    return pair[1].bimap(R.compose(R.of, objFrom(pair[0])), () => pair[0]);
};

const objFrom:CurriedFunction2<string, any, {[index: string]: any}> = R.curry(
    (key:string, value:any):{[index: string]: any} => R.fromPairs([[key, value]])
);

const reduce = (validations:Validation[]):Validation =>
    R.reduce(
        (val1:Validation, val2:Validation):Validation => val1.ap(val2),
        R.head(validations),
        R.tail(validations)
    );