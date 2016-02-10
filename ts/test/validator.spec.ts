/// <reference path="../typings/mocha/mocha.d.ts" />
/// <reference path="../typings/chai/chai.d.ts" />
/// <reference path="../typings/folktale/data.validation.d.ts"/>

import { expect } from 'chai';
import Schema = require("../src/schema");
import validator = require('../src/validator');
import Validation = require('data.validation');

const Success = Validation.Success;
const Failure = Validation.Failure;
const PASSWORD_LENGTH_ERROR_MESSAGE = "Password must have more than 5 characters";
const PASSWORD_STRENGTH_ERROR_MESSAGE = "Password must contain special characters";
const MIN_AGE_ERROR_MESSAGE = "Age must be greater than 12";

const passwordLength = (a:string):Validation => {
    return a.length > 5 ? Success(a)
        : /* otherwise */ Failure([PASSWORD_LENGTH_ERROR_MESSAGE])
};

const passwordStrength = (a:string):Validation => {
    return /[\W]/.test(a) ? Success(a)
        : /* otherwise */   Failure([PASSWORD_STRENGTH_ERROR_MESSAGE])
};

const minAge = (a:number):Validation => {
    return a > 12 ? Success(a)
        : /* otherwise */ Failure([MIN_AGE_ERROR_MESSAGE]);
};

describe('validation with Success', () => {

    it('should validate an empty object with a Success', () => {
        // given
        let schema:Schema = {
            password: {
                validations: [passwordLength, passwordStrength],
            }
        };

        let person = {};

        // when
        let validation = validator.validate(schema, person);

        // then
        expect(validation.isSuccess).to.be.true;
        expect(validation.get()).to.deep.equal(person);

    });

    it('should return a Success when no validation has been executed', () => {
        // given
        let schema:Schema = {
            password: {
                validations: [passwordLength, passwordStrength],
            }
        };

        let person = {
            name: 'Bond'
        };

        // when
        let validation = validator.validate(schema, person);

        // then
        expect(validation.isSuccess).to.be.true;
        expect(validation.get()).to.deep.equal(person);

    });

    it('should return a Success when all the validations of a prop has been passed', () => {
        // given
        let schema:Schema = {
            password: {
                validations: [passwordLength, passwordStrength],
            }
        };

        let person = {
            name: "John",
            password: "Pa$$word"
        };

        // when
        let validation = validator.validate(schema, person);

        // then
        expect(validation.isSuccess).to.be.true;
        expect(validation.get()).to.deep.equal(person);

    });

    it('should return a Success when all the validations of has been succeeded', () => {
        // given
        let schema:Schema = {
            password: {
                validations: [passwordLength, passwordStrength],
            },
            age: {
                validations: [minAge],
            }
        };

        let person = {
            age: 23,
            password: "$pectre"
        };

        // when
        let validation = validator.validate(schema, person);

        // then
        expect(validation.isSuccess).to.be.true;
        expect(validation.get()).to.deep.equal(person);

    });
});


describe('validation with Failure', () => {
    it('should only validate literal object', ()=> {
        // given
        let schema:Schema = {
            password: {
                validations: [passwordLength, passwordStrength],
            }
        };

        let obj=123;

        // when
        let validation= validator.validate(schema);

        // then
        expect(validation(123).isFailure).to.be.true;
        expect(validation('sdqsdqs').isFailure).to.be.true;
        expect(validation(true).isFailure).to.be.true;
    });

    it('should return a Failure when one validation has not been succeeded', () => {
        // given
        let schema:Schema = {
            password: {
                validations: [passwordLength, passwordStrength],
            }
        };

        let person = {
            password: "Password"
        };

        // when
        let validation = validator.validate(schema, person);

        // then
        expect(validation.isFailure).to.be.true;
        expect(validation.merge()).to.deep.equal([{
            password: [PASSWORD_STRENGTH_ERROR_MESSAGE]
        }]);
    });

    it('should return a Failure when one validation has not been succeeded', () => {
        // given
        let schema:Schema = {
            password: {
                validations: [passwordLength, passwordStrength],
            },
            age: {
                validations: [minAge]
            }
        };

        let person = {
            password: "Password",
            age: 11
        };

        // when
        let validation = validator.validate(schema, person);

        // then
        expect(validation.isFailure).to.be.true;
        expect(validation.merge()).to.deep.equal([{
            password: [PASSWORD_STRENGTH_ERROR_MESSAGE],
            age: [MIN_AGE_ERROR_MESSAGE]
        }]);
    });

    it('should concat error messages', () => {
        // given
        let schema:Schema = {
            password: {
                validations: [passwordLength, passwordStrength],
            }
        };

        let person = {
            password: "f"
        };

        // when
        let validation = validator.validate(schema, person);

        // then
        expect(validation.isFailure).to.be.true;
        expect(validation.merge()).to.deep.equal([{
            password: [PASSWORD_LENGTH_ERROR_MESSAGE, PASSWORD_STRENGTH_ERROR_MESSAGE]
        }]);
    });
});