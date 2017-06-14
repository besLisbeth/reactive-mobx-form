import React, { Component, createElement } from 'react';
import { observable, action, computed, autorun, isObservableArray, ObservableMap } from 'mobx';
import * as Validator from 'validatorjs';

import { fieldValue, fieldDefinition, normalizesdFieldDefinition, formField } from './interface';
import { Form } from "./Form";
import { Field } from "./Field";
import { FieldArray } from './FieldArray';
 

export class FieldSection {
	initialValue: {[propType:string]:fieldValue} = {};

	readonly name: string;
	readonly _isFieldSection: boolean = true;

	@observable subFields: ObservableMap<{}> = observable.map(); // todo: does not look good
	//@observable value: any = '';
	@observable errors: Array<string> = [];

	constructor(name: string) {
		this.name = name;
	}

	@action registerField(fieldName: string, fieldDefinition: normalizesdFieldDefinition, isArrayField?: boolean) {
		this.subFields.set(fieldName, isArrayField ? new FieldArray(fieldName) : new Field(fieldName, fieldDefinition));

		return this.subFields.get(fieldName);
	}

	@action reset() {
		this.subFields.values().forEach((field:formField) => field.reset());
	}

	@computed get value() {
		return {
			[this.name]: this.subFields.entries().reduce((values:any, entry:[string, formField]) => Object.assign(values, { [entry[0]]: entry[1].value }), {})
		}
	}

	// todo: fix this
	@computed get isDirty() {
		return true;
	}
}
