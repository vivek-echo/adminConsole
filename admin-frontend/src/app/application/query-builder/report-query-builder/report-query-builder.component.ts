import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit, TemplateRef } from '@angular/core';
import { Router, NavigationEnd, Event, RouterModule } from '@angular/router';
import { TabNavigationServiceService } from '../../../core/services/tab-navigation-service.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertHelper } from '../../../core/helpers/alert-helper';
import { FormValidationService } from '../../../core/validations/form-validation';
import { QueryBuilderService } from '../services/query-builder.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-report-query-builder',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './report-query-builder.component.html',
  styleUrl: './report-query-builder.component.scss'
})
export class ReportQueryBuilderComponent implements OnInit, OnDestroy, AfterViewInit {
  tabMenuData: any[] = [];
  breadCrumData: { globalMenu?: string; primaryMenu?: string } = {};
  currentUrl: string = '';
  queryTableData: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  dataQueryForm: FormGroup;
  addNewQueryReportModalForm: FormGroup;
  isLoading = false;
  queryColumnNames: string[] = [];
  totalRecords = 0;
  pageSize = 10;
  currentPage = 0;

  globalMenuData: any
  primaryMenuData: any
  private routerSubscription?: Subscription;
  queryReportData: any = []
  cssColor: any = ["info", "success", "dark", "danger", "secondary", "primary", "warning"]
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  selectedQuery: string | null = null;
  @ViewChild('addQueryReportModal') addQueryReportModal!: TemplateRef<any>;
  saveQuery: boolean = false
  constructor(
    private fb: FormBuilder,
    private router: Router,
    private tabNavigationServiceService: TabNavigationServiceService,
    private spinner: NgxSpinnerService,
    private alertHelper: AlertHelper,
    private el: ElementRef,
    private formValidationService: FormValidationService,
    private queryBuilderService: QueryBuilderService,
    private dialog: MatDialog
  ) {
    this.initializeMenuData();
    this.dataQueryForm = this.fb.group({
      queryText: ['', [Validators.required]]
    });
    this.addNewQueryReportModalForm = this.fb.group({
      queryLableModal: ['', [Validators.required]],
      queryTextModal: ['', [Validators.required]],
    })
  }

  initializeMenuData(): void {
    this.globalMenuData = this.tabNavigationServiceService.getGlobalMenuData("/console/queryBuilder");
    this.tabMenuData = this.tabNavigationServiceService.getTabLinks("/console/queryBuilder/reportQuery") || [];
    this.primaryMenuData = this.tabNavigationServiceService.getPrimaryLinks("/console/queryBuilder/reportQuery");
    this.currentUrl = this.router.url;

    this.breadCrumData.globalMenu = this.globalMenuData.gl_name;
    this.breadCrumData.primaryMenu = this.primaryMenuData.pl_name;
  }

  ngOnInit(): void {
    this.getQueryBuilderReport()
    this.subscribeToRouteChanges();

  }
  saveQueryCheckBox(event: any) {
    const isChecked = (event.target as HTMLInputElement).checked;
    if (isChecked) {
      this.saveQuery = true;
    } else {
      this.saveQuery = false;
    }
  }

  getQueryBuilderReport() {
    this.queryBuilderService.getQueryBuilderReport({}).subscribe({
      next: (response: any) => {
        this.queryReportData = response?.data
        this.queryReportData.forEach((it: any) => {
          const randomIndex = Math.floor(Math.random() * this.cssColor.length);
          it.classCss = this.cssColor[randomIndex]; // Set classCss on the item
        });
      }
    })
  }

  handlePageEvent(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.fetchData();
  }

  searchForm(): void {
    if (!this.formValidationService.validateForm(this.dataQueryForm, this.getReadableFieldName.bind(this), this.el)) return;
    if (!this.dataQueryForm.get('queryText')?.value.match(/^SELECT/i)) {
      this.alertHelper.viewAlert("warning", "INVALID", "The Query must start with select");
      return;
    }
    if (this.saveQuery) {
      console.log(this.saveQuery, this.dataQueryForm.get('queryText')?.value)
      this.openAddQueryReportModal();
      this.addNewQueryReportModalForm.patchValue({
        queryTextModal: this.dataQueryForm.get('queryText')?.value
      })
    } else {

      this.resetPagination();
      this.fetchData();
    }
  }

  resetPagination(): void {
    this.currentPage = 0;
    this.totalRecords = 0;
    this.queryTableData.data = [];
    this.paginator?.firstPage();
  }

  fetchData(reportType: boolean = false): void {
    const { queryText } = this.dataQueryForm.getRawValue();
    const params = { queryText, page: this.currentPage + 1, pageSize: this.pageSize, reportType };
    this.isLoading = true;
    this.spinner.show();

    this.queryBuilderService.getDataQueryBuilder(params).subscribe({
      next: (response: any) => {
        this.spinner.hide();
        this.isLoading = false;
        this.queryTableData.data = response.data.rows;
        this.totalRecords = response.data.total;
        this.queryColumnNames = this.queryTableData.data.length > 0 ? Object.keys(this.queryTableData.data[0]) : [];
      },
      error: (err) => {
        this.spinner.hide();
        this.isLoading = false;
        // this.alertHelper.error("Error", "Failed to fetch data. Please try again later.");
        console.error(err);
      }
    });
  }

  getReadableFieldName(fieldName: string): string {
    const fieldNames: { [key: string]: string } = { queryText: 'Please Enter Your Query' };
    return fieldNames[fieldName] || fieldName;
  }

  subscribeToRouteChanges(): void {
    this.routerSubscription = this.router.events
      .pipe(filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => this.currentUrl = event.urlAfterRedirects);
  }

  ngOnDestroy(): void {
    // Unsubscribe from the router events on component destroy to prevent memory leaks
    this.routerSubscription?.unsubscribe();
  }

  ngAfterViewInit(): void { }

  onCheckReport(qryText: any) {
    this.dataQueryForm.reset();
    this.dataQueryForm.patchValue({
      queryText: qryText
    });
  }

  viewQueryData(qryText: any) {
    this.onCheckReport(qryText)
    this.fetchData()
  }
  toggleCheck(queryTxt: string) {
    this.selectedQuery = this.selectedQuery === queryTxt ? null : queryTxt;
    if (this.selectedQuery) {

      this.onCheckReport(queryTxt)
    } else {
      this.dataQueryForm.reset();
    }
  }

  deleteQueryReport(id: any) {
    const param = {
      'savedQueryId': id
    }
    this.alertHelper.confirmAlert(
      'Are you sure?',
      "You want delete the saved query",
      'warning',
      'Yes, delete it!'
    ).then((rs: any) => {
      if (rs.isConfirmed) {

        this.spinner.show();
        this.queryBuilderService.deleteSavedQueryReport(param).subscribe({
          next: (response: any) => {
            this.spinner.hide();
            this.alertHelper.viewAlert("success", "SUCCESS", response.msg).then(() => {
              this.getQueryBuilderReport()
            })
          },
          error: (err: any) => {
            this.spinner.hide();
          }
        })
      }
    })
  }

  openAddQueryReportModal() {
    const dialogRef = this.dialog.open(this.addQueryReportModal, {
      width: '900px', // Customize the size
    });

    dialogRef.afterClosed().subscribe(result => {
      console.log('The dialog was closed');
    });
  }

  closeAddQueryReportModal() {
    this.dialog.closeAll();
  }

  confirmActionAddNewQueryReport() {
    if (!this.formValidationService.validateForm(this.addNewQueryReportModalForm, this.getReadableFieldName.bind(this), this.el)) return;
    if (!this.addNewQueryReportModalForm.get('queryTextModal')?.value.match(/^SELECT/i)) {
      this.alertHelper.viewAlert("warning", "INVALID", "The Query must start with select");
      return;
    }

    const modalRawData = this.addNewQueryReportModalForm.getRawValue()
    this.alertHelper.confirmAlert(
      'Are you sure?',
      "You want to add new query report",
      'warning',
      'Yes, save it!'
    ).then((re: any) => {
      if (re.isConfirmed) {
        this.spinner.show();
        this.queryBuilderService.addNewQueryReport(modalRawData).subscribe({
          next: (response: any) => {
            this.alertHelper.viewAlert("success", "SUCCESS", response.msg).then(() => {
              this.getQueryBuilderReport();
              this.addNewQueryReportModalForm.reset();
              if (this.saveQuery) {
                this.fetchData();
                this.closeAddQueryReportModal();
                this.saveQuery = false
              }
              // this.closeAddQueryReportModal();
            })
            this.spinner.hide();
          },
          error: (err: any) => {
            if (this.saveQuery) {
              this.addNewQueryReportModalForm.reset();
              this.closeAddQueryReportModal();
            }

            this.spinner.hide();
          }
        })
      }
    })

  }

  getReadableFieldNameAddNewQueryReport(fieldName: string): string {
    const fieldNames: { [key: string]: string } = {
      queryLableModal: "Please Enter the Query Report Label",
      queryTextModal: "Please Enter the Query Text"
    };
    return fieldNames[fieldName] || fieldName;
  }

  downloadCsv() {
    const { queryText } = this.dataQueryForm.getRawValue();
    const paramVal = { queryText, reportType: true };
    this.queryBuilderService.downloadQueryReport(paramVal).subscribe((item: Blob) => {
      const url = window.URL.createObjectURL(item);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'data.csv';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    })
  }
}
