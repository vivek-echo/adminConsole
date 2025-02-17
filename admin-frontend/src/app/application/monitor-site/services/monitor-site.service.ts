import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class MonitorSiteService {
  httpOptions: any;
  private BACKEND_URL = environment.BACKEND_URL;
  constructor(
    private httpClient: HttpClient,
  ) { }

  viewErrorLogs(postData: any): Observable<any> {
    return this.httpClient.post(`${this.BACKEND_URL}/viewErrorLogs`, postData);
  }
}
