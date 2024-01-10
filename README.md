


Steps to reproduce:



```
export LOCALSTACK_AUTH_TOKEN=...
docker-compose up

yarn install
tsc --build

cd cdk
cdklocal bootsrap
cdklocal deploy --all --require-approval never # will succeed 
cdklocal deploy --all --require-approval never # will fail
```