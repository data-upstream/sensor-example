import {Component, OnInit} from '@angular/core';
import {HttpClient} from '@angular/common/http';

/**
 * interface LogData
 */
interface ILogData {
   created_at: Date;
   payload: {data: string};
}

/**
 * model time series item
 */
class TimeSeriesItem {
  constructor(private _data: number, private _created_at: Date) {}

  get created_at(): Date {
    return this._created_at;
  }

  get data(): number {
    return this._data;
  }

}

/**
 * Component
 */

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  title = 'Sensor Report - Biel/Bienne (CH)';

  last_updated: Date = null;

  dataTempSeries = new Array<TimeSeriesItem>(); // holds temperature series
  dataPresSeries = new Array<TimeSeriesItem>(); // holds pressure

  // baseUri = 'https://db.alpha.data-upstream.ch/api';
  baseUri = 'https://vs2.sp33c.de/api';
  device = '34';

  /**
   *
   * @param {HttpClient} http
   */
  constructor(
    private http: HttpClient
  ) {}

  /**
   * parses / processes raw data from sensor
   * returns a list of one spec. type, e.g. temperature, pressure, etc.
   *
   * @param {Array<ILogData>} data    raw data stream
   * @param {number} idx              number of element in a composite stream, that matches a specific type
   * @returns {Number[]}
   */
  private processData(data: Array<ILogData>, idx: number): TimeSeriesItem[] {
    const series = new Array<TimeSeriesItem>();
    for (const item of data) {
      series.push(new TimeSeriesItem(parseFloat(item.payload.data.split(',')[idx]), item.created_at));
    }
    return series;
  }

  /**
   * retrieves the sensor data
   */
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
        // take note of last record (to display recorded at)
        const last_record = data[this.device][0];
        this.last_updated = last_record.created_at;

        // transform the untyped data from json request into typed one
        const seriesRaw: Array<ILogData> = data[this.device];

        /*
          process the series
         */
        this.dataTempSeries = this.processData(seriesRaw, 5);
        this.dataPresSeries = this.processData(seriesRaw, 4);
      }
    );
  }

  /*
    on Init make request
   */
  ngOnInit() {
    this.makeRequest();
  }


}
