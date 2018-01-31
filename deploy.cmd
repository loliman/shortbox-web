echo '---------------------------'
echo ' Deploying shortbox-web... '
echo '---------------------------'
call aws s3 cp dist s3://www.shortbox.xyz/ --recursive --include "*" --acl public-read --cache-control public,max-age=31536000,no-transform
call aws cloudfront create-invalidation --distribution-id EU7Q022C0JQXB --paths /index.html
call aws cloudfront create-invalidation --distribution-id EU7Q022C0JQXB --paths /main.bundle.js
call aws cloudfront create-invalidation --distribution-id EU7Q022C0JQXB --paths /inline.bundle.js
call aws cloudfront create-invalidation --distribution-id EU7Q022C0JQXB --paths /polyfills.bundle.js
call aws cloudfront create-invalidation --distribution-id EU7Q022C0JQXB --paths /scripts.bundle.js
call aws cloudfront create-invalidation --distribution-id EU7Q022C0JQXB --paths /styles.bundle.js
call aws cloudfront create-invalidation --distribution-id EU7Q022C0JQXB --paths /vendor.bundle.js
echo 'Deployment done!'

