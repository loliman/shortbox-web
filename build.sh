#!/bin/bash
echo '--------------------------'
echo ' Building shortbox-web... '
echo '--------------------------'
rm -rf ./dist/*
npm install
ng build --env=prod
cd dist 
tar -cf shortbox_web.tar * 
cd ..
echo 'Build done!'
