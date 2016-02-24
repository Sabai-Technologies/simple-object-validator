/// <reference path="../typings/folktale/data.validation.d.ts"/>
/// <reference path="../typings/ramda/ramda.d.ts"/>

import Schema = require("./schema");
import Validation = require('data.validation');
import R = require('ramda');
import KeyValuePair = R.KeyValuePair;
import CurriedFunction2 = R.CurriedFunction2;


/**
 * Validate the given object according the given Schema.
 * If all the indexed properties, defined in the Schema, are successfully validated, then returns a Success
 * with the given object as context otherwise returns a Failure containing an object which value of its indexed properties
 * is an array of error message.
 *
 * validate :: Schema -> {[index:string]} -> Validation
 */
export var validate = R.curry(
    (schema:Schema, obj:{[index:string]:any}):Validation => {
        if (R.is(Object, obj)) {
            let validations:Validation[] = R.compose(R.map(convert), R.toPairs, validateObj(schema))(obj);
            let validation = reduce(R.prepend(Validation.of(identityN(validations.length)), validations));

            return validation.bimap(R.compose(R.of, R.mergeAll), () => obj);
        }

        return Validation.Failure([`Error: cannot validate object: ${obj}`]);
    }
);

/**
 * Return a curried identity function with the given arity
 *
 * identityN :: n
 */
const identityN = (n:number) => R.curryN(n, R.identity);

/**
 * Apply validation of the indexed properties defined in the given Scheam to the value of the same indexed properties
 * defined in the given
 *
 * validateObj :: Schema -> {[index:string]:any} -> {[index:string]:Validation}
 */
const validateObj = R.curry(
    (schema:Schema, obj:{[index:string]:any}):{[index:string]:Validation} => R.mapObjIndexed(validateProp(schema), pick(schema, obj))
);


/**
 * Remove all the attributes of the given literal object which are not defined in the given Schema
 *
 * pick :: Schema -> {[index:string]:any} -> {[index:string]:any}
 */
const pick = R.curry((schema:Schema, obj:{[index:string]:any}):{[index:string]:any} => R.pick(R.keys(schema), obj));

/**
 * Validate the value of a key according the validations defined in the Schema
 *
 * validateProp :: Schema -> any -> string -> Validation
 */
const validateProp = R.curry((schema:Schema, value:any, key:string):Validation => {
    let validations:Validation[] = R.ap(schema[key].validations, R.of(value));

    return reduce(R.prepend(Validation.of(R.curryN(validations.length, ()=>value)), validations));
});

/**
 * Bimap the Validation of the given KeyValuePair.
 * If the validation is a Failure then map it with a function creating a literal object with only one indexed property
 * and which name is the given string.
 * If the validation is a Success, then map it with the identity function
 *
 *  convert :: [string, Validation] -> Validation
 */
const convert = (pair:KeyValuePair<string, Validation>):Validation => pair[1].bimap(R.compose(R.of, toObj(pair[0])), R.identity);

/**
 * Create literal object with only one indexed property which name is the given key and the value the given value.
 *
 * toObj :: string -> any -> {string:any}
 */
const toObj = R.curry((key:string, value:any):{[index: string]: any} => R.fromPairs([[key, value]]));

/**
 * Reduce a collection of Validation par applying the 'ap' method
 *
 * reduce :: [Validation] -> Validation
 */
const reduce = (validations:Validation[]):Validation =>
    R.reduce(
        (val1:Validation, val2:Validation):Validation => val1.ap(val2),
        R.head(validations),
        R.tail(validations)
    );