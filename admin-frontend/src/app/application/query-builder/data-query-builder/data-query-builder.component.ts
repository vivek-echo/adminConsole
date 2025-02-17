import { Component, OnInit, OnDestroy, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { Router, NavigationEnd, Event, RouterModule } from '@angular/router';
import { TabNavigationServiceService } from '../../../core/services/tab-navigation-service.service';
import { Subscription } from 'rxjs';
import { filter } from 'rxjs/operators';
import { CommonModule } from '@angular/common';
import { MaterialModule } from '../../../material.module';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { NgxSpinnerService } from 'ngx-spinner';
import { AlertHelper } from '../../../core/helpers/alert-helper';
import { FormValidationService } from '../../../core/validations/form-validation';
import { QueryBuilderService } from '../services/query-builder.service';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';

@Component({
  selector: 'app-data-query-builder',
  standalone: true,
  imports: [CommonModule, RouterModule, MaterialModule, ReactiveFormsModule],
  templateUrl: './data-query-builder.component.html',
  styleUrls: ['./data-query-builder.component.scss']
})
export class DataQueryBuilderComponent implements OnInit, OnDestroy, AfterViewInit {
  tabMenuData: any[] = [];
  breadCrumData: { globalMenu?: string; primaryMenu?: string } = {};
  currentUrl: string = '';
  queryTableData: MatTableDataSource<any> = new MatTableDataSource<any>([]);
  dataQueryForm: FormGroup;
  isLoading = false;
  queryColumnNames: string[] = [];
  totalRecords = 0;
  pageSize = 10;
  currentPage = 0;

  globalMenuData: any
  primaryMenuData: any
  private routerSubscription?: Subscription;

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private tabNavigationServiceService: TabNavigationServiceService,
    private spinner: NgxSpinnerService,
    private alertHelper: AlertHelper,
    private el: ElementRef,
    private formValidationService: FormValidationService,
    private queryBuilderService: QueryBuilderService
  ) {
    this.initializeMenuData();
    this.dataQueryForm = this.fb.group({
      queryText: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.subscribeToRouteChanges();
  }

  ngAfterViewInit(): void { }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  initializeMenuData(): void {
    this.globalMenuData = this.tabNavigationServiceService.getGlobalMenuData("/console/queryBuilder");
    this.tabMenuData = this.tabNavigationServiceService.getTabLinks("/console/queryBuilder/dataQuery") || [];
    this.primaryMenuData = this.tabNavigationServiceService.getPrimaryLinks("/console/queryBuilder/dataQuery");
    this.currentUrl = this.router.url;

    this.breadCrumData.globalMenu = this.globalMenuData.gl_name;
    this.breadCrumData.primaryMenu = this.primaryMenuData.pl_name;
  }

  subscribeToRouteChanges(): void {
    this.routerSubscription = this.router.events
      .pipe(filter((event: Event): event is NavigationEnd => event instanceof NavigationEnd))
      .subscribe((event: NavigationEnd) => this.currentUrl = event.urlAfterRedirects);
  }

  handlePageEvent(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.currentPage = event.pageIndex;
    this.fetchData();
  }

  searchForm(): void {
    if (!this.formValidationService.validateForm(this.dataQueryForm, this.getReadableFieldName.bind(this), this.el)) return;
    this.resetPagination();
    this.fetchData();
  }

  resetPagination(): void {
    this.currentPage = 0;
    this.totalRecords = 0;
    this.queryTableData.data = [];
    this.paginator?.firstPage();
  }

  fetchData(): void {
    const { queryText } = this.dataQueryForm.getRawValue();
    const params = { queryText, page: this.currentPage + 1, pageSize: this.pageSize };

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
}