PROFILE=default
PROFILE_ARG=--profile=$(PROFILE)

build:
	npm install
	npm run-script build

create-deploy-package:
	zip -r ./dist/deploy.zip -j ./dist/index.js

staging-deploy: 
	$(MAKE) PROFILE=mineko_staging deploy

prod-deploy: 
	$(MAKE) PROFILE=mineko deploy

deploy:
	aws $(PROFILE_ARG) lambda update-function-code --function-name create_payments --zip-file fileb://./dist/deploy.zip --publish