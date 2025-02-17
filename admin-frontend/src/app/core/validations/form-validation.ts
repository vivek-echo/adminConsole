import { Injectable, ElementRef } from '@angular/core';
import { FormGroup, FormArray } from '@angular/forms';
import { AlertHelper } from '../../core/helpers/alert-helper';

@Injectable({
    providedIn: 'root',
})
export class FormValidationService {
    constructor(private alertHelper: AlertHelper) { }

    validateForm(
        formGroup: FormGroup,
        getReadableFieldName: (fieldName: string) => string,
        el: ElementRef
    ): boolean {
        if (formGroup.invalid) {
            this.markAllAsTouched(formGroup);
            this.showValidationErrors(formGroup, getReadableFieldName, el);
            return false;
        }
        return true;
    }

    private markAllAsTouched(formGroup: FormGroup | FormArray): void {
        Object.keys(formGroup.controls).forEach((key) => {
            const control = formGroup.get(key);
            if (control instanceof FormGroup || control instanceof FormArray) {
                this.markAllAsTouched(control);
            } else {
                control?.markAsTouched();
            }
        });
    }

    private showValidationErrors(
        formGroup: FormGroup,
        getReadableFieldName: (fieldName: string) => string,
        el: ElementRef
    ): void {
        const invalidFields: { fieldName: string; errors: string[] }[] = [];
        this.collectInvalidFieldsWithErrors(formGroup, invalidFields, getReadableFieldName);

        if (invalidFields.length > 0) {
            const firstInvalidControlKey = this.findFirstInvalidControlKey(formGroup);
            console.log(invalidFields[0])
            const error = invalidFields[0]
            const errorMessage = error.errors[0] + " : " + error.fieldName

            this.alertHelper
                .viewAlert('warning', 'Form Invalid', errorMessage)
                .then(() => {
                    this.focusFirstInvalidControl(firstInvalidControlKey, el);
                });
        }
    }

    private collectInvalidFieldsWithErrors(
        formGroup: FormGroup | FormArray,
        invalidFields: { fieldName: string; errors: string[] }[],
        getReadableFieldName: (fieldName: string) => string,
        parentKey = ''
    ): void {
        Object.keys(formGroup.controls).forEach((key) => {
            const control = formGroup.get(key);

            if (control instanceof FormGroup || control instanceof FormArray) {
                this.collectInvalidFieldsWithErrors(
                    control,
                    invalidFields,
                    getReadableFieldName,
                    parentKey ? `${parentKey}` : key
                );
            } else if (control?.invalid && control.errors) {
                const readableFieldName = getReadableFieldName(key);
                const errors = Object.keys(control.errors || {}).map((errorKey) =>
                    this.getErrorMessage(errorKey, control.errors![errorKey])
                );
                invalidFields.push({
                    fieldName: parentKey ? `${parentKey} : ${readableFieldName}` : readableFieldName,
                    errors,
                });
            }
        });
    }

    private findFirstInvalidControlKey(
        formGroup: FormGroup | FormArray
    ): string | null {
        for (const key of Object.keys(formGroup.controls)) {
            const control = formGroup.get(key);
            if (control instanceof FormGroup || control instanceof FormArray) {
                const childInvalidKey = this.findFirstInvalidControlKey(control);
                if (childInvalidKey) {
                    return key;
                }
            } else if (control?.invalid) {
                return key;
            }
        }
        return null;
    }


    private focusFirstInvalidControl(controlKey: string | null, el: ElementRef): void {
        if (!controlKey) return;

        const element = el.nativeElement.querySelector(`[formControlName="${controlKey}"]`);
        if (element) {
            // First scroll the element into view
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });

            // Then focus the element after a slight delay to ensure scroll completes
            setTimeout(() => {
                element.focus();
            }, 300); // Adjust delay to allow for the scrolling to finish (300ms is a reasonable value)
        }
    }

    private collectInvalidFields(
        formGroup: FormGroup | FormArray,
        invalidFields: string[],
        getReadableFieldName: (fieldName: string) => string,
        parentKey = ''
    ): void {
        Object.keys(formGroup.controls).forEach((key) => {
            const control = formGroup.get(key);

            if (control instanceof FormGroup || control instanceof FormArray) {
                this.collectInvalidFields(
                    control,
                    invalidFields,
                    getReadableFieldName,
                    parentKey ? `${parentKey}` : key
                );
            } else if (control?.invalid) {
                const readableFieldName = getReadableFieldName(key);
                invalidFields.push(parentKey ? `${parentKey} : ${readableFieldName}` : readableFieldName);
            }
        });
    }

    private getErrorMessage(errorKey: string, errorValue: any): string {
        const errorMessages: { [key: string]: string } = {
            required: 'This field is required',
            minlength: `Minimum length is ${errorValue.requiredLength}`,
            maxlength: `Maximum length is ${errorValue.requiredLength}`,
            email: 'Enter a valid email address',
            pattern: 'Invalid format',
            // Additional validation error messages:
            min: `Value must be greater than or equal to ${errorValue.min}`,
            max: `Value must be less than or equal to ${errorValue.max}`,
            number: 'This field must be a valid number',
            equalTo: 'Fields must match',
            url: 'Enter a valid URL',
            date: 'Enter a valid date',
            digits: 'This field should only contain digits',
            custom: errorValue, // For custom errors with specific messages
            // Add other validation error messages as needed
        };

        return errorMessages[errorKey] || 'Invalid value';
    }

}
