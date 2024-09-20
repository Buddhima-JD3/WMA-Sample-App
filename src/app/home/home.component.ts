import { Component, OnInit, NgZone  } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { ActivatedRoute, } from "@angular/router";
import { catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { my, syncAuthCode,  syncUserConsentData, syncTradePayData}  from 'wma-bridge';
import { DataTransferService } from '../shared/data-transfer.service';

import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  //This section should move to the merchant backend - start
  clientId: string = 'mini-app';
  token: string = '';
  queryParams: string = `?client_id=mini-app&response_type=code&redirect_uri=https://ecebdev.megalink.com.ph`;
  // queryParams: string = `?client_id=mini-app&response_type=code&redirect_uri=http://localhost:4200`;
  tokenUrl: string = 'https://ecebdev.megalink.com.ph/api-gateway/clr-service/wma/auth/token';
  redirectUrl: string = 'https://ecebdev.megalink.com.ph';
  // redirectUrl: string = 'http://localhost:4200';
  consent: string = '';
  //This section should move to the merchant backend - end

  products: any[] = [
    {
      name: 'Sterling Silver Necklace',
      description: 'Gifts for Girls Sterling Silver Necklace',
      amount: 144.99,
      orderId: 'OT123383883',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRDngLv-AwYkNHYzNdTg0az3VKs1g1tPHzELw&usqp=CAU'
    },
    {
      name: 'Ring-Minimalistic',
      description: ' Handmade Flower Signet Ring-Minimalistic',
      amount: 144.99,
      orderId: 'OT123383883',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSg56EzsnBsMA03uOn6wufLLGgvH6FDWFwfowbYt3n5sEZE7Pe-OYF7a490lHt5DL62Q4I&usqp=CAU'
    },
    {
      name: 'Jewelry',
      description: 'Promise Lover Jewelryd',
      amount: 11.99,
      orderId: 'OT123383883',
      image: 'https://jewellerymatters.com/cdn/shop/products/RSSCZ802-3_300x300.jpg?v=1638930920'
    },
    {
      name: 'Jewelry',
      description: 'A delicious food',
      amount: 244.99,
      orderId: 'OT123383883',
      image: 'https://s.alicdn.com/@sc04/kf/H60cc5836af0546a78c51246ae1c02b4be.jpg_200x200.jpg'
    },
    {
      name: 'Jewelry',
      description: 'A delicious food',
      amount: 74.99,
      orderId: 'OT123383883',
      image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRKYyOxHhGhl7GcvAm9RNOnDgMyTxHOnSNW7w&usqp=CAU'
    },
  ]

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private ngZone: NgZone,
    private dataTransferService: DataTransferService,
  ) {
  }

  ngOnInit(): void {

    //Declaration of the SDK sync methods - start
    //This will be invoked via the mobile app
    my.initiate({
      [syncAuthCode]: {
        success: (res) => this.getToken(res),
        fail: (err) => console.error('Auth Code Sync Error:', err),
      },
    });

    //This will be invoked via the mobile app
    my.initiate({
      [syncUserConsentData]: {
        success: (data) => this.displayUserConsentDetails(data),
        fail: (err) => alert('User Consent Sync Error:' + err),
      },
    });

    //This will be invoked via the mobile app
    my.initiate({
      [syncTradePayData]: {
        success: (data) => {
          console.log("check: " + data);
          // Use NgZone to run the navigation inside Angular's zone
          this.dataTransferService.setData(data);
          this.ngZone.run(() => this.router.navigate(['/check-out'], { state: { data: data } }));
        },
        fail: (err) => alert('Trade Data Sync Error :' + err),
      },
    });
    //Declaration of the SDK sync methods - end

    // Website loading event for get auth code (Check the 'code' query param
    // if you have same url as landing and redirect
    this.route.queryParams.subscribe(params => {
      if (!params['code']) {
        console.log('Invoke SDK');

        const data = {
          clientId: this.clientId,
          redirectUrl: this.redirectUrl
        };
        my.getAuthCode(data, {
          success: function (res) {
            console.log('Success:', res);
          },
          fail: function (err) {
            console.error('Fail:', err);
          },
        });
      }
    });
  }


  //This section should move to the merchant backend - start
  getToken(authCode: string) {
    console.log('Fetching token');
    console.log('Code:', authCode);
    const headers = new HttpHeaders({
      'Content-Type': 'application/x-www-form-urlencoded'
    });
    // Set request parameters
    const params = new HttpParams()
      .set('grant_type', 'authorization_code')
      .set('client_id', this.clientId)
      .set('code', authCode)
      .set('redirect_uri', this.redirectUrl);
    // Make the HTTP request
    console.log('Invoke Http Method');
    this.http.post<any>(this.tokenUrl, params.toString(), { headers }).pipe(
      catchError((error) => {
        console.error('Error occurred:', error);
        return throwError(() => error);
      })
    ).subscribe(
      {
        next: result => {
          console.log('Result:', result);
          this.token = result.access_token;
        },
        error: error => {
          console.log('An error occurred:', JSON.stringify(error));
        }
      }
    );
  }
  //This section should move to the merchant backend - end

  //Generate OrderId
  generateOrderId() {
    let randomNumber = Math.random().toString().slice(2);
    let numericPart = randomNumber.padStart(9, '0').substring(0, 9);
    let orderId = 'OT' + numericPart;
    return orderId;
  }

  //Buy now my.getTradePay()
  buyNow(data: any) {
    data.orderId = this.generateOrderId();
    data.currencyCode = 'PHP';
    data.token = this.token;
    data.token = '77e1e895-ac85-37ac-9ac5-efaeb70d11df';
    my.getTradePay(data, {
      success: function (res) {
        console.log('Success:', res);

      },
      fail: function (err) {
        console.error('Fail:', err);
      }
    });
  }

  //Get user consent my.getUserConsent() [Recommended to have API]
  getUserConsent() {
    my.getUserConsent(this.clientId, {
    // my.getUserConsent(this.token,{
      success: function (res) {
        console.log('Success:', res);
      },
      fail: function (err) {
        console.error('Fail:', err);
      }
    });;
  }

  public displayUserConsentDetails(data: any) {
    if (data == null || data == '') {
      data = "not initialized";
    }

    alert(data);
    this.consent = data;
    console.log("Display User Consent: ", data);
  }
}
