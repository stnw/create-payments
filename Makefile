PROFILE=default
PROFILE_ARG=--profile=$(PROFILE)

install:
	npm install

build:
	npm run-script build

create-deploy-package:
	rm -Rf ./dist/deploy.zip
	zip -r ./dist/deploy.zip -j ./dist/index.js

staging-deploy: build create-deploy-package
	$(MAKE) PROFILE=mineko_staging deploy

prod-deploy: build create-deploy-package
	$(MAKE) PROFILE=mineko deploy

deploy: 
	aws $(PROFILE_ARG) lambda update-function-code --function-name create_payments --zip-file fileb://./dist/deploy.zip --publish
	rm -Rf ./dist/deploy.zip