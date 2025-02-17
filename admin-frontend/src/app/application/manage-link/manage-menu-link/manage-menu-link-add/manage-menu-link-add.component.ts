import { CommonModule } from '@angular/common';
import { Component, OnInit, ElementRef } from '@angular/core';
import { FormGroup, FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { FormValidationService } from '../../../../core/validations/form-validation';
import { AlertHelper } from '../../../../core/helpers/alert-helper';
import { NgxSpinnerService } from 'ngx-spinner';
import { ManageLinkService } from '../../services/manage-link.service';
import { NgSelectModule } from '@ng-select/ng-select';
@Component({
  selector: 'app-manage-menu-link-add',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, NgSelectModule],
  templateUrl: './manage-menu-link-add.component.html',
  styleUrl: './manage-menu-link-add.component.scss'
})
export class ManageMenuLinkAddComponent implements OnInit {
  addMenuLinkForm!: FormGroup
  parentLink: boolean = false;
  linkUrl1: boolean = false;
  linkDivClass: any = "col-sm-9";
  parentlinkData: any;
  constructor(
    private fb: FormBuilder,
    private formValidationService: FormValidationService,
    private el: ElementRef,
    private alertHelper: AlertHelper,
    private spinner: NgxSpinnerService,
    private manageLinkService: ManageLinkService
  ) {
    this.iniForm();
  }

  iniForm() {
    this.addMenuLinkForm = this.fb.group({
      adminConsoleId: [0, [Validators.required,Validators.min(1)]],
      linkTypeId: [0, [Validators.required,Validators.min(1)]],
      parentLinkId: [null, [Validators.required,Validators.min(1)]],
      linkName: ['', [Validators.required]],
      linkUrl1: ['', [Validators.required]],
      linkUrl: ['', [Validators.required]],
      iconClass: ['', [Validators.required]],
    });
  }
  ngOnInit(): void {

  }

  onSelectParentLink(e: any) {
    this.addMenuLinkForm.patchValue({
      linkUrl1: e.linkUrl + "/"
    })
  }
  // 
  submitForm() {
    if (
      !this.formValidationService.validateForm(
        this.addMenuLinkForm,
        this.getReadableFieldName.bind(this),
        this.el
      )
    ) {
      return;
    }
    const formValues = this.addMenuLinkForm.getRawValue();
    this.alertHelper.confirmAlert(
      'Are you sure?',
      "You want add this menu link",
      'warning',
      'Yes, save it!'
    ).then((is: any) => {
      if (is.isConfirmed) {
        this.spinner.show();
        this.manageLinkService.addMenuLink(formValues).subscribe({
          next: (res: any) => {
            this.alertHelper.viewAlert("success", "SUCCESS", res?.msg).then(() => {
              this.iniForm();
              this.parentLink = false;
              this.linkUrl1 = false;
              this.linkDivClass = 'col-sm-9';
              this.parentlinkData = []
              
            })
            this.spinner.hide();
          }, error: (err: any) => {
            
            this.spinner.hide();

          }
        })
      }

    })

  }

  getReadableFieldName(fieldName: string): string {
    return {
      adminConsoleId: 'Please Select Admin Console',
      linkTypeId: 'Please Select Link Type',
      parentLinkId: 'Please Select Parent Link',
      linkName: 'Please Enter Link Name',
      linkUrl1: 'Please Enter Link URL',
      linkUrl: 'Please Enter Link URL',
      iconClass: 'Please Enter Icon Class Name',
    }[fieldName] || fieldName;
  }

  changeAdminConsole() {
    this.addMenuLinkForm.patchValue({
      linkTypeId: 0,
      parentLinkId: null
    })
    this.parentLink = false;
    this.linkUrl1 = false;
    this.linkDivClass = 'col-sm-9'
  }

  changeLinkType(linkTypeId: any, adminConsoleId: any) {
    this.addMenuLinkForm.patchValue({
      parentLinkId: null
    })
    if (adminConsoleId == '' && linkTypeId != '') {
      this.alertHelper.viewAlert("warning", "REQUIRED", "Please Select Admin Console ");
      this.addMenuLinkForm.patchValue({
        linkTypeId: 0
      })
      return;
    }
    if (linkTypeId == 2 || linkTypeId == 3 || linkTypeId == 4) {
      this.spinner.show();
      const linkParam = {
        adminConsoleId: adminConsoleId,
        linkTypeId: linkTypeId
      }
      this.manageLinkService.getParentlinkData(linkParam).subscribe({
        next: (res: any) => {
          this.parentlinkData = res.data;
          this.spinner.hide();
        },
        error: (err: any) => {
          this.spinner.hide()
        }
      })
      this.parentLink = true;
      this.linkUrl1 = true;
      this.linkDivClass = 'col-sm-3'
    } else {
      this.parentLink = false;
      this.linkUrl1 = false;
      this.linkDivClass = 'col-sm-9'
    }

  }
}
