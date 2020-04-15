#!/bin/bash
file=ver001
echo naiad linux update $file
cd
cd .naiad-updater
if [ -e $file ]; then
    echo "システムは既に最新の状態です"
    exit
else
    echo "アップデートを開始します"
fi
touch $file
#以下アップデート処理
