#!/usr/bin/env bash
echo '---------------------------'
echo ' Deploying shortbox-web... '
echo '---------------------------'
aws s3 cp dist s3://www.shortbox.xyz/ --recursive --include "*" --acl public-read --cache-control public,max-age=31536000,no-transform
aws cloudfront create-invalidation --distribution-id EU7Q022C0JQXB --paths /
echo 'Deployment done!'

