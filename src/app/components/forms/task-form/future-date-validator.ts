import { AbstractControl, ValidatorFn } from '@angular/forms';

export function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl): { [key: string]: any } | null => {
    const inputDate = new Date(control.value);
    const currentDate = new Date();
    // Set the time of the current date to 00:00:00 for accurate comparison
    currentDate.setHours(0, 0, 0, 0);

    // Check if the input date is before the current date
    if (inputDate < currentDate) {
      // Return an error if it's in the past
      return { 'pastDate': true };
    }
    return null; // Return null if the date is valid (not in the past)
  };
}
