#!/bin/bash
source ./config.sh
for f in $json_source; do
    jq -nf program.jq $f | jq .[] | mongoimport $url -d $db -c $coll
done;