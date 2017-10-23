#!/bin/bash
echo '--------------------------'
echo ' Building shortbox-web... '
echo '--------------------------'
rm -rf ./dist/*
npm install
ng build --env=prod
tar -cf ./dist/shortbox_web.tar ./dist/*
echo 'Build done!'