/// <reference path="./typings/folktale/data.validation.d.ts"/>
/// <reference path="./typings/ramda/ramda.d.ts"/>

import Validator =  require('./src/validator');

export import Schema = require('./src/schema');

export var validate = Validator.validate;