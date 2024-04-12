#!/bin/bash
source ./config.sh
for f in $json_source; do
    jq -nf program.jq $f | jq .[] | mongoimport $uri -d $db -c $coll
done;