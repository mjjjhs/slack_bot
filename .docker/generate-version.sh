#!/usr/bin/env bash

SCRIPT_PATH=$(cd ${0%/*}; echo $PWD)
DIST_PATH=$SCRIPT_PATH/dist

rm -rf $DIST_PATH
mkdir -p $DIST_PATH
cp -a $SCRIPT_PATH/ebextensions $DIST_PATH/.ebextensions
cp -a $SCRIPT_PATH/Dockerrun.aws.json  $DIST_PATH/

