import {Injectable} from '@angular/core';
import {Observable} from 'rxjs/Observable';
import {Headers, Http, RequestOptions} from '@angular/http';
import {Issue} from '../../../models/issue';
import * as config from '../../../config'
import {Request} from "../../../models/Request";
import {Response} from "../../../models/response";

@Injectable()
export class CreateService {

    private url = config.url + '/create/issue';
    private importUrl = config.url + '/import';

    constructor(private http: Http) {
    }

    save(issue: Issue): Observable<Response> {
        let req = new Request();
        req.Sessionid = localStorage.getItem('sessionid');
        req.Username = localStorage.getItem('name');
        req.Payload = issue;

        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        const options = new RequestOptions({headers: headers});

        return this.http.post(this.url, JSON.stringify(req), options)
            .map(res => res.json() || {})
            .catch(res => Observable.throw('error'));
    }

    import(url: String): Observable<Response> {
        let req = new Request();
        req.Sessionid = localStorage.getItem('sessionid');
        req.Username = localStorage.getItem('name');
        req.Payload = url;

        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        const options = new RequestOptions({headers: headers});

        return this.http.post(this.importUrl, JSON.stringify(req), options)
            .map(res => res.json() || {})
            .catch(res => Observable.throw('error'));
    }
}
