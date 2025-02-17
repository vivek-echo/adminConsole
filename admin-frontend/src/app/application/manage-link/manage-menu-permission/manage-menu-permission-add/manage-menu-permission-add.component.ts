import { CommonModule } from '@angular/common';
import { Component, ElementRef, OnInit, Renderer2 } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ManageLinkService } from '../../services/manage-link.service';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertHelper } from '../../../../core/helpers/alert-helper';
import { FormValidationService } from '../../../../core/validations/form-validation';
@Component({
  selector: 'app-manage-menu-permission-add',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule],
  templateUrl: './manage-menu-permission-add.component.html',
  styleUrl: './manage-menu-permission-add.component.scss'
})
export class ManageMenuPermissionAddComponent implements OnInit {
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
    this.manageLinkService.getMenuLinks(formValues).subscribe({
      next: (response: any) => {
        console.log(response);
        this.menuLinkData = response.data;
        this.menuLinkData.forEach((globalLink: any) => {
          // For global links, initialize with 'pl_links' as the children key
          this.initializeState(globalLink, 'pl_links');
        });
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

  // Recursive method to initialize the tree state
  initializeState(node: any, childrenKey: string): void {
    // Set the checked state based on the corresponding property
    node.checked = node.gl_checked === 'checked' || node.pl_checked === 'checked' || node.tab_checked === 'checked' || node.btn_checked === 'checked';

    // Recursively initialize children
    if (node[childrenKey]) {
      node[childrenKey].forEach((child: any) => {
        // Enable child nodes only if the parent is checked
        child.disabled = !node.checked;

        // Recursive call for child nodes
        this.initializeState(child, this.getChildKey(child));
      });
    }
  }



  toggleChildState(parent: any, childrenKey: string, event: Event): void {
    // Access the `checked` state from the event's target
    const isChecked = (event.target as HTMLInputElement).checked;

    // Traverse child elements and update their states
    parent[childrenKey]?.forEach((child: any) => {
      // Update child checked and disabled states
      child.checked = isChecked;
      child.disabled = !isChecked;

      if (isChecked) {
        // If enabling, recursively initialize child states
        this.initializeState(child, this.getChildKey(child));
      } else {
        // If disabling, recursively propagate the unchecked state
        this.toggleChildState(child, this.getChildKey(child), event);
      }
    });
  }


  // Identify the children key for a node
  getChildKey(node: any): string {
    if (node.pl_links) return 'pl_links';
    if (node.pl_tab) return 'pl_tab';
    if (node.tab_button) return 'tab_button';
    return '';
  }

  // Handle checkbox change and toggle child states
  onCheckboxChange(node: any, childrenKey: string, event: Event): void {
    this.toggleChildState(node, childrenKey, event);
  }

  updatePermission() {
    const permissions: { [key: number]: string } = {};

    const collectPermissions = (nodes: any[], parentKey: string) => {
      nodes.forEach((node: any) => {
        if (node.checked && node[parentKey] && node[parentKey] > 0) {
          permissions[node[parentKey]] = String(node.gl_radio || node.pl_radio || node.tab_radio || node.btn_radio);
        }

        // Check for child nodes recursively
        if (node.pl_links) collectPermissions(node.pl_links, 'pl_id');
        if (node.pl_tab) collectPermissions(node.pl_tab, 'tab_id');
        if (node.tab_button) collectPermissions(node.tab_button, 'btn_id');
      });
    };
    console.log(this.menuLinkData);
    // Start collecting permissions from the root
    collectPermissions(this.menuLinkData, 'gl_id');
    const updatePermissionData = {
      permissionVal: this.menuLinkData, permissionRawValue: this.addPermissionSearchForm.getRawValue()
    }
    console.log(JSON.stringify(updatePermissionData))
    this.alertHelper.confirmAlert(
      'Are you sure?',
      "You want update menu permission for the role",
      'warning',
      'Yes, save it!'
    ).then((re: any) => {
      if (re.isConfirmed) {
        this.spinner.show();
        this.manageLinkService.updateMenuPermissions(updatePermissionData).subscribe({
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
    // Submit to backend

  }



}
