import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';

interface ILogData {
   created_at: Date;
   payload: {data: string};
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Sensor Report - Biel/Bienne (CH)';

  last_updated: Date = null;

  dataTempSeries = new Array<Number>();
  dataPresSeries = new Array<Number>();

  data: Object;

  // baseUri = 'https://db.alpha.data-upstream.ch/api';
  baseUri = 'https://vs2.sp33c.de/api';
  device = '34';

  constructor(
    private http: HttpClient
  ) {}

  private processData(data: Array<ILogData>, idx: number): Number[] {
    const series = new Array<Number>();
    for (const item of data) {
      series.push(parseFloat(item.payload.data.split(',')[idx]));
    }
    return series;
  }

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

        this.last_updated = last_record.created_at;
        const seriesRaw: Array<ILogData> = data[this.device];
        // console.log(seriesRaw);
        this.dataTempSeries = this.processData(seriesRaw, 5);
        this.dataPresSeries = this.processData(seriesRaw, 4);
        console.log(this.dataTempSeries);
        // this.data = seriesRaw;
      }
    );
  }

  ngOnInit() {
    this.makeRequest();
  }


}
