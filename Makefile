SHELL := /bin/bash
.PHONY: ci-tests

FIREBASE_ID=my-backyard-usa

quasar-build:
	npx quasar build

firebase-cli-auth:
	npx firebase login:add davidordine98@gmail.com

firebase-use-project:
	npx firebase use ${FIREBASE_ID}

firebase-hosting-deploy-admin-stg:
	npx firebase use ${FIREBASE_ID}
	npx quasar build
	npx firebase deploy --only hosting:admin-staging

firebase-hosting-deploy-admin-prod:
	npx firebase use ${FIREBASE_ID}
	npx quasar build
	npx firebase deploy --only hosting:admin-prod
