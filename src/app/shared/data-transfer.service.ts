import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DataTransferService {
  private data: any;

  constructor() {}

  setData(value: any) {
    this.data = value;
  }

  getData() {
    return this.data;
  }

  clearData() {
    this.data = undefined;
  }
}
