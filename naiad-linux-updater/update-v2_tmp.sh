#!/bin/bash
file=ver003
echo naiad linux update $file
cd
cd .naiad-updater
if [ -e $file ]; then
    zenity --info \
    --text="システムは既に最新の状態です"
    exit
else
    zenity --info \
    --text="更新が必要です。"
fi
touch $file
#以下アップデート処理
#!/bin/bash


