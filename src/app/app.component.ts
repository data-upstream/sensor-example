import {Component, OnInit, ViewChild} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import * as moment from 'moment';
import { jqxChartComponent } from 'jqwidgets-scripts/jqwidgets-ts/angular_jqxchart';
import {injectTemplateRef} from '@angular/core/src/render3';

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

  @ViewChild('myChart') myChart: jqxChartComponent;

  // sampleData: any[] = [29, undefined, 10, 15, 10, undefined, NaN, 30, 25, undefined, 33, 19, 11];
  sampleData: any[] = [];

  padding: any = { left: 5, top: 5, right: 15, bottom: 5 };

  titlePadding: any = { left: 0, top: 0, right: 0, bottom: 10 };

  xAxis: any =
    {
      text: 'x',
      valuesOnTicks: false
    };

  seriesGroups: any[] =
    [
      {
        type: 'line',
        source: this.sampleData,
        toolTipFormatFunction: (value: any, itemIndex: any, serie: any, group: any, categoryValue: any, categoryAxis: any) => {
          let dataItem = this.sampleData[itemIndex];
          return '<DIV style="text-align:left"><b>Index:</b> ' +
            itemIndex + '<br /><b>Value:</b> ' +
            value + '<br /></DIV>';
        },
        valueAxis:
          {
            title: { text: 'Value<br>' }
          },
        series:
          [
            { emptyPointsDisplay: 'skip', displayText: 'Value', lineWidth: 2, symbolSize: 8, symbolType: 'circle' }
          ]
      }
    ];

  title = 'Sensor Report - Biel/Bienne (CH)';

  last_updated: Date = null;
  f2c = this._f2c;

  moment = moment;
  dataTempSeries = new Array<TimeSeriesItem>(); // holds temperature series
  dataVWCSeries = new Array<TimeSeriesItem>(); // holds VWC %
  dataPresSeries = new Array<TimeSeriesItem>(); // holds pressure
  dataBatSeries = new Array<TimeSeriesItem>(); // holds pressure
  dataSleepSeries = new Array<TimeSeriesItem>(); // holds pressure

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

  dropDownOnSelect(event: any): void {
    let chartInstance = this.myChart.getInstance();
    let args = event.args;

    if (args) {
      let value = args.item.value;
      chartInstance.seriesGroups[0].series[0].emptyPointsDisplay = value;
      chartInstance.update();
    }

  }

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
   * returns temp.C
   * @param {number} vFar   value in fahrenheit given
   * @returns {number}
   * @private
   */
  private _f2c(vFar: number): number {
    return (vFar - 32) / 1.8;
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

    this.http.get(this.baseUri + '/aggregate_log_data?device_ids=[' + this.device + ']&limit=20', options).subscribe(
      data => {
        // transform the untyped data from json request into typed one
        const seriesRaw: Array<ILogData> = data[this.device];

        /*
          process the series
         */
        this.dataTempSeries = this.processData(seriesRaw, 1).reverse();
        this.dataVWCSeries = this.processData(seriesRaw, 0).reverse();
        this.dataPresSeries = this.processData(seriesRaw, 4).reverse();
        this.dataBatSeries = this.processData(seriesRaw, 6).reverse();
        this.dataSleepSeries = this.processData(seriesRaw, 7).reverse();

        const chartInstance = this.myChart.getInstance();

        for (const item of this.dataTempSeries) {
          this.sampleData.push(this.f2c(item.data));
        }
        this.seriesGroups =
          [
            {
              type: 'line',
              source: this.sampleData,
              toolTipFormatFunction: (value: any, itemIndex: any, serie: any, group: any, categoryValue: any, categoryAxis: any) => {
                const dataItem = this.sampleData[itemIndex];
                return '<DIV style="text-align:left"><b>Index:</b> ' +
                  itemIndex + '<br /><b>Value:</b> ' +
                  value + '<br /></DIV>';
              },
              valueAxis:
                {
                  title: { text: 'Value<br>' }
                },
              series:
                [
                  { emptyPointsDisplay: 'skip', displayText: 'Value', lineWidth: 2, symbolSize: 8, symbolType: 'circle' }
                ]
            }
          ];

        chartInstance.update();

        // take note of last record (to display recorded at)
        const last_record = this.dataTempSeries[0];
        this.last_updated = last_record.created_at;

      }
    );
  }

  /*
    on Init make request
   */
  ngOnInit() {
    this.makeRequest();
    setInterval(() => {
      this.makeRequest();
    }, 1000 * 10 /* alle Xs */);
  }


}
