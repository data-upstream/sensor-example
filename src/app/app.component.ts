import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'app';

  data: Object;

  // baseUri = 'https://db.alpha.data-upstream.ch/api';
  baseUri = 'https://vs2.sp33c.de/api';

  constructor(
    private http: HttpClient
  ) {}

  makeRequest(): void {
    const options = {
      params: {
        device_ids: ['34']
      },
      headers: {
        'Content-Type': 'application/json',
        // READ ONLY TOKEN
        'X-Access-Token': '3442bee0-0d02-4db4-b5e5-066de46931ab'
      }
    };
    this.http.get(this.baseUri + '/aggregate_log_data', options).subscribe(
      data => {
        this.data = data;
      }
    );
  }

  ngOnInit() {
    this.makeRequest();
  }


}
