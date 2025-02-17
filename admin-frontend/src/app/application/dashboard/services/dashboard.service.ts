import { Injectable } from '@angular/core';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private BACKEND_URL = environment.BACKEND_URL;
  constructor(
    private httpClient: HttpClient
  ) { }
  
  getDashbaoardData() {
    return this.httpClient.post(this.BACKEND_URL + '/getDashbaoardData', {},);
  }
}
