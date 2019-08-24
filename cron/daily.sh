#!/bin/bash
date=`date +%Y%m%d`
for paper in chosun asahi lemonde
do
  curl --silent --output /dev/null "localhost:3060/api/paper/clear/$paper/$date"
  curl --silent --output /dev/null "localhost:3060/api/paper/fetch/$paper/$date"
done
