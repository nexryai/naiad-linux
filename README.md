# naiad-linux
Arch系LinuxであるAlter Linuxベースのxfceデスクトップ採用のエレガントで軽量でミニマルなLinux。AlterISO3を使用してビルドします。究極の自己満足


# ビルド方法
AlterISOを使用しますが設定ファイルを一部書き換える必要があります。
`alteriso-path/system/pacman-x86_64.conf` に以下の内容を追記してください。 <br>
`[naiad-repo]` <br>
`SigLevel = Optional TrustedOnly` <br>
`Server = https://naiad-repo.web.app/$arch` <br>


**完全な無保証で使用は自己責任です**



