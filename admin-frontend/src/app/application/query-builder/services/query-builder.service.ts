import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class QueryBuilderService {

  httpOptions: any;
  private BACKEND_URL = environment.BACKEND_URL;
  constructor(
    private httpClient: HttpClient,
  ) { }

  getDataQueryBuilder(postData: any): Observable<any> {
    return this.httpClient.post(`${this.BACKEND_URL}/getDataQueryBuilder`, postData);
  }
  getQueryBuilderReport(postData: any): Observable<any> {
    return this.httpClient.post(`${this.BACKEND_URL}/getQueryBuilderReport`, postData);
  }
  deleteSavedQueryReport(postData: any): Observable<any> {
    return this.httpClient.post(`${this.BACKEND_URL}/deleteSavedQueryReport`, postData);
  }
  addNewQueryReport(postData: any): Observable<any> {
    return this.httpClient.post(`${this.BACKEND_URL}/addNewQueryReport`, postData);
  }
  downloadQueryReport(postData: any): Observable<any> {
    return this.httpClient.post(`${this.BACKEND_URL}/downloadQueryReport`, postData, {
      responseType: 'blob'
    });
  }
}
