# Grailip
Grailip is web clipping app.

## 大まかな仕組み

* Chromeの拡張機能で現在のページをMHTML形式にする
* APIを叩いてアップロード
  * 文章の抜き出し
  * 検索に登録
    * データはIDを付与して別で保存
    * 本文検索に引っかかったらIDを返す
* 専用サイトでは検索APIと開くAPIがある

その他やりたいこと

* 広告などのHTMLを拡張機能側で消す
  * よく使うサイトはJSを登録して実行
  * 広告を削除した状態で登録
* 検索結果の広告を削除してアップデート

## 構成

* 本体
  * Deno Deploy
  * サービスの提供
* 検索
  * Elasticsearch
    * ElasticCloudを使用。
    * 直に叩けるので単体運用
* クリップ
  * CloudflareのR2とWorker
    * R2に保存したりする認証付きAPIをWorkerで提供

## Secrets

* CF_API_TOKEN

