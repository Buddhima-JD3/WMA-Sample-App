import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { DataTransferService } from '../shared/data-transfer.service';

@Component({
  selector: 'app-check-out',
  templateUrl: './check-out.component.html',
  styleUrls: ['./check-out.component.scss']
})
export class CheckOutComponent implements OnInit {
  transactionDetails: any;

  constructor(private router: Router, private dataTransferService: DataTransferService) {}

  ngOnInit() {
    this.transactionDetails = this.dataTransferService.getData();
    console.log("Display Transaction Details: ", this.transactionDetails);
    this.dataTransferService.clearData();
  }

  goBack() {
    this.router.navigate(['']);
  }
}
