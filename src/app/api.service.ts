import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class ApiService {

  baseUri = 'https://db.alpha.data-upstream.ch/api/';

  constructor(
    private httpClient: HttpClient
  ) {
    httpClient.get<Object>(this.baseUri + '/aggregate_log_data').subscribe(

    );
  }


}
