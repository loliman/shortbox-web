import {Injectable} from '@angular/core';
import {Headers, Http, RequestOptions} from '@angular/http';
import * as config from '../config'
import {Observable} from 'rxjs/Observable';
import {User} from '../models/user';
import {Request} from "../models/Request";
import {Response} from "../models/response";

@Injectable()
export class AuthService {
    private options: RequestOptions;

    constructor(private http: Http) {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json');
        this.options = new RequestOptions({headers: headers});
    }

    logout(user: User): Observable<Response> {
        let req = new Request();
        req.Sessionid = localStorage.getItem('sessionid');
        req.Username = localStorage.getItem('name');
        req.Payload = user;

        return this.http.post(config.url + '/logout', JSON.stringify(req), this.options)
            .map(res => res.json() || {})
            .catch(res => Observable.throw('error'));
    }

    login(user: User): Observable<Response> {
        let req = new Request();
        req.Sessionid = localStorage.getItem('sessionid');
        req.Username = localStorage.getItem('name');
        req.Payload = user;

        return this.http.post(config.url + '/login', JSON.stringify(req), this.options)
            .map(res => res.json() || {})
            .catch(res => Observable.throw('error'));
    }

    checkSession(user: User): Observable<Response> {
        let req = new Request();
        req.Sessionid = localStorage.getItem('sessionid');
        req.Username = localStorage.getItem('name');
        req.Payload = user;

        return this.http.post(config.url + '/checksession', JSON.stringify(req), this.options)
            .map(res => res.json() || {})
            .catch(res => Observable.throw('error'));
    }
}
