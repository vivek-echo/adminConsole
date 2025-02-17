import { Component, ElementRef, OnInit } from '@angular/core';
import {
  FormGroup,
  FormControl,
  Validators,
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
} from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MaterialModule } from '../material.module';
import { MatButtonModule } from '@angular/material/button';
import { LoginService } from '../services/login.service';
import { FormValidationService } from '../core/validations/form-validation';
import { AlertHelper } from '../core/helpers/alert-helper';
import { NgxSpinnerService } from 'ngx-spinner';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [RouterModule,
    MaterialModule,
    FormsModule,
    ReactiveFormsModule,
    MatButtonModule,],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup
  constructor(
    private router: Router,
    private loginServices: LoginService,
    private fb: FormBuilder,
    private formValidationService: FormValidationService,
    private el: ElementRef,
    private alertHelper: AlertHelper,
    private spinner: NgxSpinnerService
  ) {
    this.clearStorage();
    this.loginForm = this.fb.group({
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
    });
  }

  ngOnInit(): void {

  }

  submitForm() {
    if (
      !this.formValidationService.validateForm(
        this.loginForm,
        this.getReadableFieldName.bind(this),
        this.el
      )
    ) {
      return;
    }
    const formValues = this.loginForm.getRawValue();
    this.handleLogin(formValues);
  }

  private handleLogin(formValues: any): void {
    this.spinner.show();
    this.loginServices.login(formValues).subscribe({
      next: (res: any) => {
        if (res.success) {
          this.setSessionStorageItems(res);
          this.router.navigateByUrl('/console/dashboard');
        } else {
          this.alertHelper.viewAlert('error', 'INVALID', res.msg);
        }
      },
      error: () => {
        this.alertHelper.viewAlert(
          'error',
          'Login Failed',
          'An error occurred during login.'
        );
      },
      complete: () => {
        this.spinner.hide();
      },
    });
  }

  private setSessionStorageItems(response: any): void {
    const {
      token,
      userData,
      userMenu,
    } = response.data;
    sessionStorage.setItem('jwtToken', token);
    sessionStorage.setItem('userProfile', JSON.stringify(userData));
    sessionStorage.setItem('userMenus', JSON.stringify(userMenu));
  }

  clearStorage() {
    sessionStorage.clear();
    localStorage.clear();
  }

  getReadableFieldName(fieldName: string): string {
    return {
      empName: 'Employee Name',
      dateOfBirth: 'Date of Birth',
    }[fieldName] || fieldName;
  }
}
