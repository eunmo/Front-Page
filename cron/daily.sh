date=`date +%Y%m%d`
papers=("joongang" "asahi" "lemonde")
for paper in ${papers[@]}
do
	curl --silent --output /dev/null "localhost:3060/api/paper/clear/$paper/$date"
	curl --silent --output /dev/null "localhost:3060/api/paper/fetch/$paper/$date"
done
