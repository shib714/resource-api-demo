import { Component, input, ChangeDetectionStrategy } from '@angular/core';
import { FieldState } from '@angular/forms/signals';

@Component({
  selector: 'field-error',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <!--displays errors when fieldState().touched() is true, which typically occurs on blur
    If pending() becomes false and touched() is also false, the "Checking availability..." message disappears 
    without showing the "taken" error

    show errors when the field is either touched() or dirty(). This ensures async errors appear immediately 
    upon typing, while still hiding initial errors on empty fields until the user interacts with them.
    Please see: https://angular.dev/guide/forms/signals/field-state-management
   
    Handle Pending State: Since signal forms support async validation, adding a check for pending()      
    allows you to show "Checking..." messages
     -->
     @if (fieldState().pending()) {
        <div class="field-pending">Checking availability...</div>
    }
    @if (fieldState().invalid() && (fieldState().touched() || fieldState().dirty())) {
       <div class="field-errors">
          @for (error of fieldState().errors(); track error.kind) {
            <div class="error-message">{{ error.message }}</div>
          }
       </div>
    }
  `,
  styles: `
     .error-message { color: #d32f2f; font-size: 0.75rem; margin-top: 4px; }
     .field-pending { color: #666; font-size: 0.75rem; }
   `
})
export class FieldError {
  fieldState = input.required<FieldState<any, any>>();
}
