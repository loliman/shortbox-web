shortbox.de
======
**Shortbox-Web** is meant to be the the webfrontend to shortbox-backend.

## Technology
* [Angular4](https://angular.io/)
* [ng-bootstrap](https://ng-bootstrap.github.io)
* [crypto-js](https://github.com/brix/crypto-js)
* [ngx-infinite-scroll](https://github.com/orizens/ngx-infinite-scroll)
* [AWS](https://aws.amazon.com/de/)

## Installation
1. Sync sandbox to your server
2. change HTTPS and WSS-URL in 'frontend/src/app/config.ts'
3. create AWS S3 Bucket and Cloudfront Distribution

## Usage
1. Run ./build to build shortbox-web locally
2. Run ./deploy to deploy shortbox-web to your S3 Bucket
