#!/bin/bash
date=`date +%Y%m%d`
for paper in lemonde
do
  curl --silent --output /dev/null "localhost:3060/api/clear/$paper/$date"
  curl --silent --output /dev/null "localhost:3060/api/fetch/$paper/$date"
done
