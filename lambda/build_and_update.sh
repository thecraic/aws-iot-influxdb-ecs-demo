#!/bin/bash

# Builds and updates the dispatcher lambda function

echo "Building the lambda function package..."

rm -f IngestToInfluxDB.zip
cd ingest-to-influxdb
zip -r9 ${OLDPWD}/IngestToInfluxDB.zip .
cd ${OLDPWD}

echo "Updating the lambda function..."

aws lambda update-function-code --function-name IngestToInfluxDB --zip-file fileb://IngestToInfluxDB.zip

