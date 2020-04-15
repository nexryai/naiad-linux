#!/bin/bash
echo =========================
echo naiad linux updater v.1.0
echo =========================
echo 'このウィザードを使用するとお使いのnaiad linuxを最新の状態にすることができます。'
sudo apt-get update
sudo apt-get upgrade
sudo apt-get autoremove
cd
mkdir .naiad-updater
cd .naiad-updater
rm -rf tmp
mkdir tmp
cd tmp
echo 'naiad linuxのレポジトリからアップデートファイルを取得します。'
git clone https://github.com/nexryai/naiad-linux-update
if [ -e naiad-linux-update ]; then
    echo "ok"
else
    echo "======================="
    echo "error - git_clone_faild" 
    echo "申し訳ありません。ファイルの取得に失敗しました。ネットワーク接続が正常な場合、サーバーが一時的に使用できない状態かレポジトリが変更された可能性があります。"
    echo "しばらく待ってからもう一度やり直すかnaiad linuxの公式ページから最新のアップデーターを取得してください。それでも問題が解決しない場合は開発者に連絡してください"
    echo "======================="
fi
cd naiad-linux-update
bash update.sh