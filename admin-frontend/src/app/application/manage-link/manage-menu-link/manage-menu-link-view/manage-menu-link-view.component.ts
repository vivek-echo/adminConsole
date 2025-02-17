import { CommonModule } from '@angular/common';
import { Component, ElementRef } from '@angular/core';
import { ManageLinkService } from '../../services/manage-link.service';
import { NgxSpinnerService } from 'ngx-spinner';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { CustomValidators } from '../../../../core/validations/custom-validators';

@Component({
  selector: 'app-manage-menu-link-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './manage-menu-link-view.component.html',
  styleUrl: './manage-menu-link-view.component.scss',
})
export class ManageMenuLinkViewComponent {
  searchForm: FormGroup;
  linkType: any = 0;
  parentLinks: any = '';
  links: any=[];

  allLabels: any = ['Admin Console Id', 'Link Type Id'];
  constructor(
    private readonly manageLinkService: ManageLinkService,
    private spinner: NgxSpinnerService,
    private fb: FormBuilder,
    private customValidators: CustomValidators,
    private el: ElementRef
  ) {
    this.searchForm = this.initialiseForm();
  }

  initialiseForm() {
    return this.fb.group({
      adminConsoleId: ['', [Validators.required, Validators.minLength(1)]],
      linkTypeId: ['', [Validators.required, Validators.minLength(1)]],
      // parentlinkId: ['', Validators.required],
    });
  }

  onChangeLinkType(event: any) {
    this.spinner.show();
    this.linkType = event.target.value;
    if (this.linkType != 1) {
      this.manageLinkService
        .getGlobalLink({ linkTypeId: this.linkType })
        .subscribe({
          next: (res: any) => {
            this.parentLinks = res.data;
            this.spinner.hide();
          },
          error: (err: any) => {
            console.error('Error', err);
            this.spinner.hide();
          },
          complete: () => {
            this.spinner.hide();
          },
        });
    } else {
      this.parentLinks = '';
      this.spinner.hide();
    }
  }
  searchLink() {
    if (this.searchForm.invalid) {
      this.customValidators.formValidationHandler(
        this.searchForm,
        this.allLabels,
        this.el
      );
      return;
    }
    this.spinner.show();
    this.manageLinkService.getSerchedLinks(this.searchForm.value).subscribe({
      next: (res: any) => {
        console.log(res);

        this.links = res.data;
        this.spinner.hide();
      },
      error: (err: any) => {
        console.log('Error', err);
        this.spinner.hide();
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }
}
