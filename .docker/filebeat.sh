#!/bin/bash
CONFIG_PATH=$1
KAFKA_ENV=$2

if [ "$KAFKA_ENV" == "dev" ]
then
  KAFKA_HOSTS='"lqt-kafka-01.dev.yanolja.in:9092","lqt-kafka-02.dev.yanolja.in:9092","lqt-kafka-03.dev.yanolja.in:9092"'
else
  KAFKA_HOSTS='"lqt-kafka-01.prod.yanolja.in:9092","lqt-kafka-02.prod.yanolja.in:9092","lqt-kafka-03.prod.yanolja.in:9092"'
fi

sed -i s/%KAFKA_HOSTS%/$KAFKA_HOSTS/g $CONFIG_PATH