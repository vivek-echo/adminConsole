import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ManageLinkService } from '../../services/manage-link.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertHelper } from '../../../../core/helpers/alert-helper';
import { FormValidationService } from '../../../../core/validations/form-validation';

@Component({
  selector: 'app-manage-menu-permission-serialization',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './manage-menu-permission-serialization.component.html',
  styleUrl: './manage-menu-permission-serialization.component.scss'
})
export class ManageMenuPermissionSerializationComponent implements OnInit {
  addPermissionSearchForm: FormGroup
  userRoleData: any = []
  btnSerachLoading: boolean = false
  menuLinkData: any

  constructor(
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private manageLinkService: ManageLinkService,
    private alertHelper: AlertHelper,
    private el: ElementRef,
    private formValidationService: FormValidationService,
    private renderer: Renderer2
  ) {
    this.addPermissionSearchForm = this.fb.group({
      adminConsoleId: [0, [Validators.required, Validators.min(1)]],
      userRoleId: [0, [Validators.required, Validators.min(1)]],
    })
  }

  ngOnInit(): void {
  }

  getRoles(adminId: any) {
    this.btnSerachLoading = true
    const paramPost = {
      adminConsoleId: adminId
    }
    this.manageLinkService.getUserRoles(paramPost).subscribe({
      next: (res: any) => {
        this.userRoleData = res?.data;
        this.btnSerachLoading = false
      },
      error: (err: any) => {
        this.btnSerachLoading = false
      }
    })
  }

  searchForm() {
    if (
      !this.formValidationService.validateForm(
        this.addPermissionSearchForm,
        this.getReadableFieldName.bind(this),
        this.el
      )
    ) {
      return;
    }
    const formValues = this.addPermissionSearchForm.getRawValue();
    this.spinner.show();
    this.manageLinkService.getSerializeMenuLinks(formValues).subscribe({
      next: (response: any) => {
        console.log(response);
        this.menuLinkData = response.data;
        this.spinner.hide();
      },
      error: (err: any) => {
        this.spinner.hide();
      }
    })
  }

  getReadableFieldName(fieldName: string): string {
    return {
      adminConsoleId: 'Please Select Admin Console',
      userRoleId: 'Please Select User Role',
    }[fieldName] || fieldName;
  }

 
  dragData: any;

  onDragStart(event: DragEvent, gIndex: number, pIndex: number | null, tIndex: number | null) {
    this.dragData = { gIndex, pIndex, tIndex };
    event.dataTransfer?.setData('text', JSON.stringify(this.dragData));
  }

  onDragOver(event: DragEvent) {
    event.preventDefault();
  }

  onDrop(event: DragEvent, gIndex: number, pIndex: number | null, tIndex: number | null) {
    event.preventDefault();

    const dragData = JSON.parse(event.dataTransfer?.getData('text') || '{}');
    const { gIndex: srcGIndex, pIndex: srcPIndex, tIndex: srcTIndex } = dragData;

    if (pIndex === null && tIndex === null && srcPIndex === null && srcTIndex === null) {
      // Swap global links
      const temp = this.menuLinkData[srcGIndex];
      this.menuLinkData[srcGIndex] = this.menuLinkData[gIndex];
      this.menuLinkData[gIndex] = temp;
    } else if (tIndex === null && srcTIndex === null && gIndex === srcGIndex) {
      // Swap primary links within the same global link
      const temp = this.menuLinkData[gIndex].pl_links[srcPIndex];
      this.menuLinkData[gIndex].pl_links[srcPIndex] =
        this.menuLinkData[gIndex].pl_links[pIndex!];
      this.menuLinkData[gIndex].pl_links[pIndex!] = temp;
    } else if (srcPIndex === pIndex && gIndex === srcGIndex) {
      // Swap tab links within the same primary link
      const temp = this.menuLinkData[gIndex].pl_links[pIndex!].pl_tab[srcTIndex];
      this.menuLinkData[gIndex].pl_links[pIndex!].pl_tab[srcTIndex] =
        this.menuLinkData[gIndex].pl_links[pIndex!].pl_tab[tIndex!];
      this.menuLinkData[gIndex].pl_links[pIndex!].pl_tab[tIndex!] = temp;
    }
  }

  updatePermission() {

    const preparedData = this.prepareFormData();

    const updatePermissionData = {
      permissionVal: preparedData, permissionRawValue: this.addPermissionSearchForm.getRawValue()
    }

    this.alertHelper.confirmAlert(
      'Are you sure?',
      "You want update menu Serialization for the role",
      'warning',
      'Yes, save it!'
    ).then((re: any) => {
      if (re.isConfirmed) {
        this.spinner.show();
        this.manageLinkService.updateMenuSerialization(updatePermissionData).subscribe({
          next: (response: any) => {
            this.spinner.hide()
            this.alertHelper.viewAlert("success", "SUCESS", response.msg);
          },
          error: (error: any) => {
            this.spinner.hide()
            console.error('Error:', error);
          },
        });
      }
    })

  }
  prepareFormData(): { [key: string]: string } {
    const formData: { [key: string]: string } = {};
  
    this.menuLinkData.forEach((globalLink: any) => {
      // Add global link data
      if (globalLink.gl_id && globalLink.gl_radio) {
        formData[globalLink.gl_id] = globalLink.gl_radio;
      }
  
      globalLink.pl_links.forEach((primaryLink: any) => {
        // Add primary link data
        if (primaryLink.pl_id && primaryLink.pl_radio) {
          formData[primaryLink.pl_id] = primaryLink.pl_radio;
        }
  
        primaryLink.pl_tab.forEach((tabLink: any) => {
          // Add tab link data
          if (tabLink.tab_id && tabLink.tab_radio) {
            formData[tabLink.tab_id] = tabLink.tab_radio;
          }
        });
      });
    });
  
    return formData;
  }
  

}
