#!/usr/bin/env bash
echo '--------------------------'
echo ' Building shortbox-web... '
echo '--------------------------'
npm install
ng build --env=prod
echo 'Build done!'
