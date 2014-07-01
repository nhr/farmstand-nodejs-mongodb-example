# Node.JS and MongoDB on OpenShift

This git repository contains "farmstand", a sample application written on the OpenShift Platform-as-a-Service.

## Running on OpenShift

Create an account at https://www.openshift.com

Create a nodejs application with mongodb:

    rhc app create <appname> nodejs-0.10 mongodb-2 --from-code=https://github.com/openshift-quickstart/farmstand-nodejs-mongodb-example

By default flag ```--from-code``` will add this repository as an upstream, which can be use later to pull updates.

That's it! You can now check out your application at:

    http://<appname>-<domain>.rhcloud.com


NOTES:

GIT_ROOT/.openshift/action_hooks/deploy:
    OpenShift's pre-build hooks will populate your empty mongodb instance with
    the right database and the farmstand locations (see, originally taken from
    [data.gov](https://explore.data.gov/Agriculture/Farmers-Markets-Search/ugii-uvsz).
