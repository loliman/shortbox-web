#!/usr/bin/env bash
echo '--------------------------'
echo ' Building shortbox-web... '
echo '--------------------------'
npm install
ng build --env=prod --no-sourcemap
echo 'Build done!'
