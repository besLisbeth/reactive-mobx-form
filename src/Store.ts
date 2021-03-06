import { observable, ObservableMap } from 'mobx';
import { Form } from './Form';
import { IFormSchema, IFormErrorMessages, IFormAttributeNames } from './interfaces/Form';

export class FormStore {
	@observable public forms: ObservableMap<Form> = observable.map();

	public registerForm(name: string, schema: IFormSchema, errorMessages: IFormErrorMessages, attributeNames: IFormAttributeNames): Form { // tslint:disable-line
		let form;

		if (this.hasForm(name)) {
			form = this.getForm(name);
			// update form with data of new form part
		}
		else {
			form = new Form(schema, errorMessages, attributeNames);
			form.registerValidation();
			this.forms.set(name, form);
		}

		return form;
	}

	public unRegisterForm(name: string): void {
		if (this.forms.has(name)) {
			this.forms.delete(name);
		}
	}

	public hasForm(name: string): boolean {
		return this.forms.has(name);
	}

	public getForm(name: string): Form {
		return this.forms.get(name);
	}
}
