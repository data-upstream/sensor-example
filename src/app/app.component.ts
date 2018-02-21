import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';



@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Sensor Report';

  last_updated: Date = null;

  data: Object;

  // baseUri = 'https://db.alpha.data-upstream.ch/api';
  baseUri = 'https://vs2.sp33c.de/api';
  device = '34';

  constructor(
    private http: HttpClient
  ) {}

  makeRequest(): void {
    const options = {
      headers: {
        'Content-Type': 'application/json',
        // READ ONLY TOKEN
        'X-Access-Token': '3442bee0-0d02-4db4-b5e5-066de46931ab'
      }
    };
    this.http.get(this.baseUri + '/aggregate_log_data?device_ids=[' + this.device + ']&limit=3', options).subscribe(
      data => {
        const last_record = data[this.device][0];
        this.data = data[this.device];
        this.last_updated = last_record.created_at;

      }
    );
  }

  ngOnInit() {
    this.makeRequest();
  }


}
