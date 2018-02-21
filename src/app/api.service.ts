import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from  'rxjs/Observable';
import {LogData} from './log_data/log_data.model';

@Injectable()
export class ApiService {

  baseUri = 'https://db.alpha.data-upstream.ch/api/';

  constructor(
    private httpClient: HttpClient
  ) {
    httpClient.get<LogData>(this.baseUri + '/aggregate_log_data').subscribe(

    );
  }


}
