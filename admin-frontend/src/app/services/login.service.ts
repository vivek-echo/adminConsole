import { Injectable } from '@angular/core';
import { JwtHelperService } from '@auth0/angular-jwt';
import * as CryptoJS from 'crypto-js';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AlertHelper } from '../core/helpers/alert-helper';
import { Router } from '@angular/router';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../environments/environment';
import { NgxSpinnerService } from 'ngx-spinner';
@Injectable({
  providedIn: 'root',
})
export class LoginService {
  httpOptions: any;
  private BACKEND_URL = environment.BACKEND_URL;
  encKey: any = 'vivekJhat4whyb167enfipc2ABCDEFGHIJKLMNOPQRSTUVWXYZqxrCrypto';
  constructor(
    private httpClient: HttpClient,
    private jwtHelper: JwtHelperService,
    private route: Router,
    private alertHelper: AlertHelper,
    private spinner:NgxSpinnerService
  ) {
    this.getHttpHeaders();
  }

  getHttpHeaders() {
    // ==== get jwt key
    this.httpOptions = {
      headers: new HttpHeaders({
        // skipInterCept: "false",
        'Content-Type': 'application/json',
      }),
    };
  }

  login(postData: any): Observable<any> {
    const CryptoJSAesJson = {
      stringify: function (cipherParams: any) {
        const j = {
          ct: cipherParams.ciphertext.toString(CryptoJS.enc.Base64),
          iv: cipherParams.iv.toString(),
          s: cipherParams.salt?.toString() || null,
        };
        return JSON.stringify(j);
      },
      parse: function (jsonStr: any) {
        const j = JSON.parse(jsonStr);
        const cipherParams = CryptoJS.lib.CipherParams.create({
          ciphertext: CryptoJS.enc.Base64.parse(j.ct),
        });
        if (j.iv) {
          cipherParams.iv = CryptoJS.enc.Hex.parse(j.iv);
        }
        if (j.s) {
          cipherParams.salt = CryptoJS.enc.Hex.parse(j.s);
        }
        return cipherParams;
      },
    };

    const encryptionKey = 'vivekJhaCrypto'; // Same key for backend
    const params = CryptoJS.AES.encrypt(JSON.stringify(postData), encryptionKey, {
      format: CryptoJSAesJson,
    }).toString();

    return this.httpClient.post(this.BACKEND_URL + '/login', params, this.httpOptions);
  }

  isAuthenticated(): boolean {
    try {
      const token = sessionStorage.getItem('jwtToken');
      if (token) {
        return !this.jwtHelper.isTokenExpired(token);
      }
      // Optionally navigate if needed
      return false;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  }

  logout() {
    localStorage.clear();
    sessionStorage.clear();
    const logoutURL = "/website"
    this.alertHelper.viewAlert('success', 'Logged out', "You have been successfully logged out.").then((res: any) => {
      // redirect to login page
      this.route.navigateByUrl(logoutURL);
    }); // logout message
  }
}
