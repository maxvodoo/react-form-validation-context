import * as React from 'react';

import { ISetError, ISetShowError, IGetErrors } from './';

export interface IWithForm {
  invalidateParentForm: () => void;
  id: string 
  setShowError: ISetShowError;
  seterror: ISetError;
  C: React.ComponentClass;
}

export interface IInputComponent {
  value: string;
  onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  error: string;
  showErrors: boolean;
}


class FormInput extends React.Component<IWithForm, {}> {
  componentDidMount() {
    const { invalidateParentForm } = this.props;
    this.reset();
    invalidateParentForm();
  }

  componentWillUnmount() {
    this.reset();
  }

  reset() {
    const { id, setShowError, seterror } = this.props;
    seterror(id, []);
    setShowError(id, false);
  }

  render() {
    const { C, ...props } = this.props;
    return <C {...props} />;
  }
}

export const makeWithForm = (
  Consumer: React.ComponentType<React.ConsumerProps<any>>,
  setError: ISetError,
  setShowError: ISetShowError,
  getErrors: IGetErrors
) => (C: React.ComponentClass | React.StatelessComponent<any>) => (passedProps:any) => (
  <Consumer>
    {({ invalidateParentForm }: IWithForm) => {
      const { id, value, validations, checked, hideErrors } = passedProps;
      if (typeof id === 'undefined') {
        throw new Error(
          'react-form-context: withForm requires consumers to have an id prop'
        );
      }

      const validationValue = Object.prototype.hasOwnProperty.call(
        passedProps,
        'checked'
      )
        ? checked
        : value;

      const { inputErrors, showErrors } = getErrors();

      const validationResults = validations
        ? validations
            .map((v: any) => (typeof v === 'function' ? v(validationValue) : null))
            .filter((v:any) => v && !!v.length)
        : [];
      const inValid = !!validationResults.length;

      const errorToShow = inValid ? validationResults[0] : null;

      if (
        typeof inputErrors[id] === 'undefined' ||
        inputErrors[id].join('-') !== validationResults.join('-')
      ) {
        setError(id, validationResults);
        setTimeout(() => invalidateParentForm(), 10);
      }

      return (
        <FormInput
          {...passedProps}
          C={C}
          id={id}
          seterror={setError}
          setShowError={setShowError}
          value={value}
          error={errorToShow}
          showErrors={!hideErrors && showErrors[id]}
          invalidateParentForm={invalidateParentForm}
        />
      );
    }}
  </Consumer>
);
