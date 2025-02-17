import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { HttpClient } from '@angular/common/http';
@Injectable({
  providedIn: 'root',
})
export class ManageLinkService {
  httpOptions: any;
  private BACKEND_URL = environment.BACKEND_URL;
  constructor(private httpClient: HttpClient) {}

  getParentlinkData(postData: any): Observable<any> {
    return this.httpClient.post(
      `${this.BACKEND_URL}/getParentlinkData`,
      postData
    );
  }
  getGlobalLink(postData: any): Observable<any> {
    return this.httpClient.post(`${this.BACKEND_URL}/getGlobalLink`, postData);
  }
  addMenuLink(postData: any): Observable<any> {
    return this.httpClient.post(`${this.BACKEND_URL}/addMenuLink`, postData);
  }
  getUserRoles(postData: any): Observable<any> {
    return this.httpClient.post(`${this.BACKEND_URL}/getUserRoles`, postData);
  }
  getMenuLinks(postData: any): Observable<any> {
    return this.httpClient.post(`${this.BACKEND_URL}/getMenuLinks`, postData);
  }
  updateMenuPermissions(postData: any): Observable<any> {
    return this.httpClient.post(
      `${this.BACKEND_URL}/updateMenuPermissions`,
      postData
    );
  }
  getSerializeMenuLinks(postData: any): Observable<any> {
    return this.httpClient.post(
      `${this.BACKEND_URL}/getSerializeMenuLinks`,
      postData
    );
  }
  updateMenuSerialization(postData: any): Observable<any> {
    return this.httpClient.post(
      `${this.BACKEND_URL}/updateMenuSerialization`,
      postData
    );
  }
  getSerchedLinks(postData: any): Observable<any> {
    return this.httpClient.post(
      `${this.BACKEND_URL}/getSerchedLinks`,
      postData
    );
  }
}
