import {Component, OnInit} from '@angular/core';
import {AuthService} from './auth/auth.service';
import {User} from './models/user';
import {Router} from '@angular/router';
import {isUndefined} from "util";

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    private lastUrl = '';

    constructor(private router: Router) {

        router.events.subscribe(() => {
            this.ngOnInit();
        });
    }

    ngOnInit(): void {
        const url = this.router.url;

        if (this.lastUrl !== url) {
            this.lastUrl = url;

            const user: User = new User();
            user.Name = localStorage.getItem('name');
            user.Sessionid = localStorage.getItem('sessionid');

            if (user.Name === null || isUndefined(user.Name)
                || user.Name === ''
                || user.Sessionid === null
                || user.Sessionid === '') {
                this.router.navigate(['login']);
            }
        }
    }
}
