import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-branding',
  standalone: true,
  imports: [RouterModule],
  template: `
    <div class="branding border-bottom mb-4 border-success border-2">
  <div class="text-center">
    <h4 class="text-success" style="color: #015909 !important;"><i class="fa-solid fa-laptop-code m-2"></i> <span
        class="fs-4 f-w-600">Admin Console</span></h4>
  </div>
  </div>
  `,
})
export class BrandingComponent {
  constructor() { }
}
