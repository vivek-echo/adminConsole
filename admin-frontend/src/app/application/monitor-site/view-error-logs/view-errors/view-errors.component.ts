import { Component, OnInit, ElementRef, ViewChild, TemplateRef } from '@angular/core';
import { MonitorSiteService } from '../../services/monitor-site.service';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertHelper } from '../../../../core/helpers/alert-helper';
import { FormValidationService } from '../../../../core/validations/form-validation';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MaterialModule } from '../../../../material.module';
@Component({
  selector: 'app-view-errors',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MaterialModule],
  templateUrl: './view-errors.component.html',
  styleUrl: './view-errors.component.scss'
})
export class ViewErrorsComponent implements OnInit {
  logs: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  errorSearchForm: FormGroup
  btnSerachLoading: boolean = false
  totalRecords = 0;
  pageSize = 10;
  currentPage = 0;
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild('addQueryReportModal') addQueryReportModal!: TemplateRef<any>;
  isLoading = false;
  logsFileName: any
  constructor(
    private monitorSiteService: MonitorSiteService,
    private fb: FormBuilder,
    private spinner: NgxSpinnerService,
    private alertHelper: AlertHelper,
    private el: ElementRef,
    private formValidationService: FormValidationService
  ) {
    this.errorSearchForm = this.fb.group({
      logType: ['', [Validators.required, Validators.min(1)]],
    })
  }
  ngOnInit(): void {

  }

  searchForm() {
    this.resetPagination();
    this.fetchData();
  }

  handlePageEvent(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.fetchData();
  }
  resetPagination(): void {
    this.currentPage = 0;
    this.totalRecords = 0;
    this.logs.data = [];
    this.paginator?.firstPage();
  }


  fetchData() {
    if (
      !this.formValidationService.validateForm(
        this.errorSearchForm,
        this.getReadableFieldName.bind(this),
        this.el
      )
    ) {
      return;
    }
    const formParam = this.errorSearchForm.getRawValue();
    const params = { logType: formParam.logType, page: this.currentPage + 1, pageSize: this.pageSize, reportType: false };
    this.monitorSiteService.viewErrorLogs(params).subscribe({
      next: (response: any) => {
        this.logsFileName = response.data[0].file;
        this.isLoading = false;
        this.logs.data = response.data[0].rows;
        this.totalRecords = response.data[0].totalRows;
      },
      error: (err: any) => {
        this.spinner.hide();
        this.isLoading = false;
      }
    })
  }




  getReadableFieldName(fieldName: string): string {
    return {
      logType: 'Please Select Micro-Service'
    }[fieldName] || fieldName;
  }
}
