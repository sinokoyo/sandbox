

// iframeのjQueryオブジェクト化
var $iframe = $('#app-pages');

// シートキーのjQueryオブジェクト化
var $sKey_links = $('#app-menu .bt_link');


// ========================================
// top以外でのシートキー無効化

// シートキーのクリックで判定開始
$sKey_links.on('click', function(ev){
  // デフォルトのリンク無効
  ev.preventDefault();
  // 現在のURL（iframe内の)を取得
  var url = $iframe[0].contentDocument.URL;
  // URLからファイル名（拡張子無し）を取得
  var fname = url.match(".+/(.+?)\.[a-z]+([\?#;].*)?$")[1];
  // ファイル名がtopの場合（現在表示している画面がTOPの場合）
  if(fname === 'top'){
    // クリックしたシートキーのhref値を取得
    var target = $(this)[0].href;
    // iframe内のドキュメントをtarget値に変更
    $iframe[0].contentDocument.location.replace(target);
  }
});

// ========================================




































//[EOF]
