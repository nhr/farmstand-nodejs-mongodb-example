# Node.JS and MongoDB on OpenShift

This git repository contains "farmstand", a sample application written on the OpenShift Platform-as-a-Service.

## Running on OpenShift
Create an account at http://openshift.redhat.com/

Install the RHC client tools if you have not already done so:
    
    sudo gem install rhc

Create a NodeJS application

    rhc app create -a <appname> -t nodejs-0.6

Add MongoDB

    rhc app cartridge add -a <appname> -c mongodb-2.0

Add this upstream repo

    cd <appname>
    git remote add upstream -m master git://github.com/openshift/farmstand-nodejs-mongodb-example.git
    git pull -s recursive -X theirs upstream master

Then push the repo upstream

    git push
	
That's it! You can now check out your application at:

    http://<appname>-<domain>.rhcloud.com

OpenShift's pre-build hooks will populate your empty mongodb instance with the right database and the farmstand locations, originally taken from [data.gov](https://explore.data.gov/Agriculture/Farmers-Markets-Search/ugii-uvsz).
