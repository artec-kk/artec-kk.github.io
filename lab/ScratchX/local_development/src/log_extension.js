(function(ext) {
  // コメントは補足の説明なので書かなくてもいいです

  // Extension が終了するときに呼ばれる
  // 今は特に何もしない
  ext._shutdown = function() {};

  // Extension の状態を返す
  // デバイスが繋がっていないときにはエラーを返したりする
  // ---
  // 返す値, 表示される色, 意味
  //      0,          red, error
  //      1,       yellow, not ready
  //      2,        green, ready
  // ---
  // 今回はデバイスなどは使用しないので常に準備完了
  // ということで 2 を返します。
  ext._getStatus = function() {
    return {status: 2, msg: 'Ready'};
  };

  // この関数がブロック処理になります。
  ext.log = function(str) {
    // ログを出力するだけ
    alert(str);
  };

  // ブロックをどういう風に表示するかを書きます
  // ここの書き方は結構難しいので今は説明しません
  var descriptor = {
    blocks: [
      [' ', 'log %s', 'log', 'sample log']
    ]
  };

  // Scratch に作ったブロックを登録します
  ScratchExtensions.register('Studuino Extension', descriptor, ext);
})({});