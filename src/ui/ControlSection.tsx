import * as React from 'react';
import { observer, Observer } from 'mobx-react';
import { Form } from '../Form';
import { Field } from '../Field'

import { fieldDefinition, normalizesdFieldDefinition, normalizedFormSchema } from '../interface'
import { FieldSection } from "../FieldSection";
import { omit } from "../utils";

interface ControlSectionProps {
	name: string;
	component: React.Component<any, any> | React.SFC<any> | string;
}

@observer
export class ControlSection extends React.Component<ControlSectionProps, any> {
	name : string;
	form : Form;
	field: FieldSection;

	// todo: should be possible to use with children
	static requiredProps: Array<string> = ['component', 'name'];
	static propNamesToOmitWhenByPass: Array<string> = ['component', 'rules'];

	static contextTypes = {
		_ReactiveMobxForm: React.PropTypes.object.isRequired,
		_ReactiveMobxFormFieldSection: React.PropTypes.string
	}

	static childContextTypes = {
		_ReactiveMobxFormFieldSection: React.PropTypes.string.isRequired,
	}

	constructor(props, context) {
		super(props, context);

		this.verifyRequiredProps();

		this.form = context._ReactiveMobxForm;
		this.name = context._ReactiveMobxFormFieldSection ? `${context._ReactiveMobxFormFieldSection}.${props.name}` : props.name;
	}

	getChildContext() {
		return {
			_ReactiveMobxFormFieldSection: this.name
		};
	}


	componentWillMount() {
		// verify Control name duplications
		if (this.form.fields.get(this.name)) {
			throw (new Error(`Field with name ${this.name} already exist in Form`));
		}

		// 
		if (this.form.formSchema[this.name]) {
			throw (new Error(`Control Section with name ${this.name} should not be in schema`));
		}

		this.field = new FieldSection(this.name)
		this.form.registerField(this.field);
	}

	componentWillUnmount() {
		this.form.removeField(this.name);
	}

	verifyRequiredProps() {
		ControlSection.requiredProps.forEach(reqiredPropName => {
			if (!this.props[reqiredPropName]) {
				throw new Error(`You forgot to specify '${reqiredPropName}' property for <Field /> component. Cehck '${this.context._Form.component.name}' component`)
			}
		});
	}

	render() {
		const propsToPass = omit(this.props, ControlSection.propNamesToOmitWhenByPass);
		return React.createElement((this.props.component as any), Object.assign({}, { fields: this.field.subFields }, propsToPass));
	}
}