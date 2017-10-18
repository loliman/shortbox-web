shortbox.de
======
**Shortbox-Web** is meant to be the the webfrontend to shortbox-backend.

## Technology
* [Angular4](https://angular.io/)
* [ng-bootstrap](https://ng-bootstrap.github.io)
* [crypto-js](https://github.com/brix/crypto-js)
* [ngx-infinite-scroll](https://github.com/orizens/ngx-infinite-scroll)

## Usage
1. Sync sandbox to your server
2. change HTTPS and WSS-URL in 'frontend/src/app/config.ts'
3. run 'npm install'
4. run 'ng build --env=prod'
5. copy new directory 'dist' to your www-directory