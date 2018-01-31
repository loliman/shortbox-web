echo '--------------------------'
echo ' Building shortbox-web... '
echo '--------------------------'
call npm install
call ng build --env=prod --no-sourcemap
echo 'Build done!'
