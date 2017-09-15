import React, { Component, createElement } from 'react';
import { observable, action, computed, autorun, isObservableArray, IObservableArray } from 'mobx';
import * as Validator from 'validatorjs';

import { fieldValue, IFieldDefinition, INormalizesdFieldDefinition } from '../interfaces/Form';
import { formField } from './types';
import { Form } from "./Form";
import { Field } from "./Field";
import { objectPath, isNumeric } from "./utils";


export class FieldArray {
	name: string;
	autoRemove: boolean = false;

	@observable subFields: Array<formField> = [];
	@observable errors: Array<string> = [];

	constructor(name: string) {
		this.update(name);
	}

	update(name: string) {
		this.name = name;
	}

	@action addField(field: formField) {
		const fieldPath = objectPath(field.name);
		const lastPathNode = fieldPath[fieldPath.length - 1];

		// When lastPathNode is numeric this means that in FormArray we register a direct children on FormArray
		if (isNumeric(lastPathNode)) {
			this.subFields[parseInt(lastPathNode, 10)] = field;
		}
		// we registering a Field in childrend on FormArray, like Field in a FieldSection
		else {
			const preLastPathNode = parseInt(fieldPath[fieldPath.length - 2], 10);

			if (!this.subFields[preLastPathNode]) {
				throw new Error(`Attempt to register field named "${lastPathNode}" without registring its parent first. 
					Probably you should refactor your <Control name="[index]${lastPathNode}" /> into 
					<ControlSection name={index} component={...}> and <Control name="${lastPathNode}" /> as component` )
			}

			this.subFields[preLastPathNode][lastPathNode] = field;
		}
	}

	@action reset() {
		this.subFields.forEach((subField) => subField.setAutoRemove());
		(this.subFields as IObservableArray<formField>).clear();
	}

	@action removeSubField(index) {
		(this.subFields as IObservableArray<formField>).splice(index, 1);
	}

	getField(index:string) {
		// Avoid mobx.js:1905 [mobx.array] Attempt to read an array index (0) that is out of bounds (0). 
		// Please check length first. Out of bound indices will not be tracked by MobX
		return (this.subFields.length > parseInt(index, 10)) ? this.subFields[index] : undefined;
	}

	setAutoRemove() {
		this.autoRemove = true;
		this.subFields.forEach((subField: formField) => subField.setAutoRemove());
	}

	// we need some normal solution here, as pushing empty map to -> render Controls in View -> replace empty map with FieldSection
	/*push() {
		this.subFields.set((this.subFields.size).toString(), observable.map())
	}*/

	@computed get realSubFields() {
		// filter in order to avoid errors when subFields has a gap for item to be insetred
		return this.subFields.filter((subField: formField) => subField);
	}

	@computed get value() {
		return this.realSubFields.map((subField: formField) => subField.value);
	}

	@computed get rules() {
		return this.realSubFields.reduce((rules, subField: formField) => Object.assign(rules, subField.rules), {});
	}

	@computed get isDirty() {
		return this.realSubFields.some(subField => subField.isDirty);
	}
}
