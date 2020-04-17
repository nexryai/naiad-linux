#!/bin/bash

# naiad linux updater 2.0

(
# =================================================================
echo "# apt-updateを実行します" ; sleep 2
sudo apt-get update 

# =================================================================
echo "25"
echo "# パッケージをアップデートしています" ; sleep 2
sudo apt-get upgrade -y

# =================================================================
echo "50"
echo "# アップデートの準備をしています" ; sleep 2
sudo apt-get autoremove -y
cd
mkdir .naiad-updater
cd .naiad-updater
rm -rf tmp
mkdir tmp
cd tmp

# =================================================================
echo "75"
echo "# 最新のnaiad updateファイルを取得しています" ; sleep 2
git clone https://github.com/nexryai/naiad-linux-update


# =================================================================
echo "99"
echo "# naiad linux 独自機能をアップデートしています" ; sleep 2
cd naiad-linux-update
bash update_v2.sh

# =================================================================
echo "# All finished." ; sleep 2
echo "100"


) |
zenity --progress \
  --title="Progress Status" \
  --text="First Task." \
  --percentage=0 \
  --auto-close \
  --auto-kill

(( $? != 0 )) && zenity --error --text="致命的なエラー：Error in zenity command."

exit 0