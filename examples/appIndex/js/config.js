/* Author : cstap inc. Takuji Takei */
jQuery.noConflict();
(function($, PLUGIN_ID) {
    "use strict";

    // プラグインIDの設定
    var conf = kintone.plugin.app.getConfig(PLUGIN_ID);

    //既に値が設定されている場合はフィールドに値を設定する
    if (typeof (conf['folderIcon']) !== 'undefined') {
        $('#f_' + conf['folderIcon']).prop('checked', true);
        $('#a_' + conf['appIcon']).prop('checked', true);
    } else {
        // 初回プラグイン設定時のみ必要なフォームを自動追加する
        kintone.api('/k/v1/preview/app/form/fields', 'POST', {
            "app": kintone.app.getId(),
            "properties": {
                "folderName": {
                    "code": "folderName",
                    "label": "フォルダ名",
                    "type": "SINGLE_LINE_TEXT"
                },
                "appName": {
                    "code": "appName",
                    "label": "アプリ名",
                    "type": "SINGLE_LINE_TEXT"
                },
                "appSort": {
                    "code": "appSort",
                    "label": "アプリ順",
                    "type": "NUMBER"
                },
                "parentFolderID": {
                    "code": "parentFolderID",
                    "label": "親フォルダID",
                    "type": "SINGLE_LINE_TEXT"
                },
                "appID": {
                    "code": "appID",
                    "label": "アプリID",
                    "type": "SINGLE_LINE_TEXT"
                },
                "selfFolderID": {
                    "code": "selfFolderID",
                    "label": "自フォルダID",
                    "type": "SINGLE_LINE_TEXT"
                }
            }
        }, function(resp) {
            location.reload();
        });
    }

    //「保存する」ボタン押下時に入力情報を設定する
    $('#submit').click(function() {
        var config = [];

        config['folderIcon'] = $("[name=folder]:checked").val();
        config['appIcon'] = $("[name=app]:checked").val();

        if (config['folderIcon'] === config['appIcon']) {
            alert("フォルダとアプリは異なるアイコンを選択してください。");
            return;
        }

        // カスタマイズビューを追加
        var VIEW_NAME = 'アプリ一覧';
        kintone.api(kintone.api.url('/k/v1/preview/app/views', true), 'GET', {
            'app': kintone.app.getId()
        }).then(function(appResp) {
            var req = $.extend(true, {}, appResp);
            req.app = kintone.app.getId();

            // 作成したビューが存在するか
            var existFlg = false;
            for (var k in req.views) {
                if (req.views[k].id === conf['viewId']) {
                    existFlg = true;
                    break;
                }
            }

            // カスタマイズビューが存在しなければ追加
            if (!existFlg) {

                // 一番上のビュー（デフォルトビュー）に「スケジュール」ビューを作成
                for (var key in req.views) {
                    if (req.views.hasOwnProperty(key)) {
                        req.views[key].index = Number(req.views[key].index) + 1;
                    }
                }

                req.views[VIEW_NAME] = {
                    "type": "CUSTOM",
                    "name": VIEW_NAME,
                    "html": '<div class="row">' +
                        '<button type="button" id="folderCreate" class="btn btn-success btn-sm">' +
                        '<i class="glyphicon glyphicon-plus"></i> 新規フォルダ作成</button>' +
                        '<button type="button" id="returnDefault" class="btn btn-danger btn-sm" style="float:right;">' +
                        '<i class="glyphicon glyphicon-fast-backward"></i> 初期状態に戻す</button>' +
                        '</div><div id="tree"></div>',
                    "filterCond": "",
                    "pager": true,
                    "index": 0
                };

                kintone.api(kintone.api.url('/k/v1/preview/app/views', true), 'PUT', req).then(function(putResp) {
                    // 作成したビューIDを保存する
                    var viewId = putResp.views[VIEW_NAME].id;
                    config['viewId'] = viewId;
                    kintone.plugin.app.setConfig(config);
                });

            } else {
                config['viewId'] = conf['viewId'];
                kintone.plugin.app.setConfig(config);
            }

        });
    });

    //「キャンセル」ボタン押下時の処理
    $('#cancel').click(function() {
        history.back();
    });


})(jQuery, kintone.$PLUGIN_ID);