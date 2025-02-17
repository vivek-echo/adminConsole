
import { Injectable } from '@angular/core';
import Swal, { SweetAlertIcon } from 'sweetalert2';
@Injectable({
  providedIn: 'root'
})
export class AlertHelper {
  // ====== client side alert

  viewAlert(iconType: string, title: string, message: string) {
    const alertClasses: any = {
      warning: "warning",
      error: "danger",
      success: "success",
      info: "info"
    };
    const Dclass = alertClasses[iconType] || "primary";
    return Swal.fire({
      icon: iconType as SweetAlertIcon,  // Cast iconType to SweetAlertIcon
      title:title,
      text: message,
      buttonsStyling: false,
      customClass: {
        confirmButton: `btn btn-${Dclass}`
      }
    });
  }


  // ======== server side
  viewAlertHtml(...params: any) {
    const [iconType, title, html] = params;
    return Swal.fire({
      icon: iconType,
      title: title,
      html: html,
    });
  }
  deleteAlert(...params: any) {
    const [title, text, icon, confirmButtonText] = params;
    return Swal.fire({
      title: title || 'Are you sure?',
      text: text,
      icon: icon || 'question',
      showCancelButton: true,
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmButtonText || 'Yes, delete it!',
    });
  }
  successAlert(...params: any) {
    const [title, message, iconType] = params;
    return Swal.fire(title, message, iconType);
  }
  submitAlert(...params: any) {
    const [title, iconType, confirmButtonText, cancelButtonText] = params;
    return Swal.fire({
      title: title || 'Do you want to submit?',
      icon: iconType || 'question',
      showCancelButton: true,
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmButtonText || 'Yes',
      cancelButtonText: cancelButtonText || 'No',
    });
  }
  submitAlertCustum(...params: any) {
    const [title, iconType, confirmButtonText, cancelButtonText] = params;
    return Swal.fire({
      title:
        title || 'Once updated it can not be modified, Do you want to submit?',
      icon: iconType || 'question',
      showCancelButton: true,
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmButtonText || 'Yes',
      cancelButtonText: cancelButtonText || 'No',
    });
  }
  confirmAlert(...params: any) {
    const [title, text, icon, confirmButtonText] = params;
    return Swal.fire({
      title: title || 'Are you sure?',
      text: text,
      icon: icon || 'warning',
      showCancelButton: true,
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmButtonText || 'Yes',
    });
  }
  updateAlert(...params: any) {
    const [title, text, confirmButtonText, cancelButtonText] = params;
    return Swal.fire({
      title: title || 'Do you want to update?',
      icon: text || 'question',
      showCancelButton: true,
      confirmButtonColor: '#4caf50',
      cancelButtonColor: '#d33',
      confirmButtonText: confirmButtonText || 'Yes, update it!',
      cancelButtonText: cancelButtonText || 'No, keep it',
    });
  }
  pageChangeWarningAlert() {
    return Swal.fire({
      title: 'Do you want to proceed?',
      text: 'Please save your changes.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Procced',
      cancelButtonText: 'Cancel',
    });
  }
}
