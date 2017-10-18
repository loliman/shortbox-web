import {Component, OnInit} from '@angular/core';
import {Router} from '@angular/router';
import {AuthService} from './auth.service';
import {User} from '../models/user';
import {SHA256} from 'crypto-js';
import {Alert} from "app/models/alert";

@Component({
    selector: 'app-auth',
    templateUrl: './auth.component.html',
    styleUrls: ['./auth.component.css']
})
export class AuthComponent implements OnInit {
    public user = new User();
    public alerts: Array<Alert> = [];

    constructor(private router: Router,
                private authService: AuthService) {
    }

    ngOnInit() {
        const user: User = new User();
        user.Name = localStorage.getItem('name');
        user.Sessionid = localStorage.getItem('sessionid');

        this.authService.checkSession(user).subscribe(response => {
            if (response.Payload) {
                this.router.navigate(['list', 'issue', 0]);
            }
        });
    }

    login() {
        const pw: string = SHA256(this.user.Password).toString();
        const user: User = new User();
        user.Name = this.user.Name;
        user.Password = pw;

        this.authService.login(user).subscribe(response => {
            if (response.Type == 'danger') {
                this.alerts.push({
                    id: this.alerts.length + 1,
                    type: 'danger',
                    message: 'Benutzername oder Passwort falsch.',
                })
            } else {
                localStorage.setItem('sessionid', response.Payload);
                localStorage.setItem('name', this.user.Name);
                this.router.navigate(['list', 'issue', 0]);
            }
        });
    }

    public closeAlert(alert: Alert) {
        const index: number = this.alerts.indexOf(alert);
        this.alerts.splice(index, 1);
    }
}
