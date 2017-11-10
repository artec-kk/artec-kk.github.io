(function (ext) {

  const UUIDServices        			= "442f1570-8a00-9a28-cbe1-e1d4212d53eb";
  const UUIDCharacteristicsREAD   = "442f1571-8a00-9a28-cbe1-e1d4212d53eb";
  const UUIDCharacteristicsWRITE  = "442f1572-8a00-9a28-cbe1-e1d4212d53eb";

  var ledCharacteristic;

  ext.connectBLE = function(type) {
		navigator.bluetooth.requestDevice({
			filters: [
				// { services: [ UUIDServices ] }
				{ name: [ "Studuino-8D91751" ] }
			],
			optionalServices: [ UUIDServices ]
		})
    .then(device => {
      debug("デバイスを選択しました。接続します。");
      debug("デバイス名 : " + device.name);
      debug("ID : " + device.id);

      // 選択したデバイスに接続
      return device.gatt.connect();
    })
    .then(server => {
      debug("デバイスへの接続に成功しました。サービスを取得します。");

      // UUIDに合致するサービス(機能)を取得
      return server.getPrimaryService(UUIDServices);
    })
    .then(service => {
      debug("サービスの取得に成功しました。キャラクタリスティックを取得します。");

      // UUIDに合致するキャラクタリスティック(サービスが扱うデータ)を取得
      return service.getCharacteristic(UUIDCharacteristicsWRITE);
    })
    .then(characteristic => {
      debug("キャラクタリスティックの取得に成功しました。");

      ledCharacteristic = characteristic;
      debug("BLE接続が完了しました。");

    })
    .catch(error => {
      debug("Error : " + error);

      // loading非表示
      loading.className = "hide";
    });
	}

	function debug(str) {
		// console.log(str);
		alert(str);
	}

  ext.controlLED = function (device, type) {
  	if (type == "点灯") {
			value = Uint8Array.of(
				0xA1,
				0x00,
				0xA1
			);
			ledCharacteristic.writeValue(value);
		} else {
			value = Uint8Array.of(
				0xA0,
				0x00,
				0xA0
			);
			ledCharacteristic.writeValue(value);
  }

  ext.log = function(str) {
    // ログを出力する
    alert(str);
  };

  var descriptor = {
    menus: {
        buttonStatus: ["押された", "放された"]
      , outputs: ["on", "off"]
      , lights: ["点灯", "消灯"]
      , connects: ["接続", "切断"]
      , analogConnecors: ["A0","A1","A2","A3","A4","A5","A6","A7","A6","A7" ]
      , digitalConnecors: ["D2","D4","D7","D8","D9","D10","D11","D12" ]
      , buttons: ["A0","A1","A2","A3" ]
      , leds: ["A0","A1","A2","A3","A4","A5" ]
      , dcmotors: ["M1","M2" ]
      , moves: ["正転", "逆転"]
      , accels: ["加速度1", "加速度2"]
    }
    , blocks: [
      [" ", "Studuino と %m.connects する", "connectBLE", "接続"]
    // [" ", "サーボモーター %m.digitalConnecors を %m.connects にする", "moveServo", "D9", "90"]
    , [" ", "LED %m.leds を %m.lights する", "controlLED", "A0", "点灯"]
    , [" ", 'log %s', 'log', 'sample log']
    // , ["r", "光センサー　%m.leds　の値", "getLightSensorValue", "A0"]
    // , ["h", "ボタン %m.buttons　が %m.buttonStatus とき", "isButtonPressed", ,"A0", "押された"]
    // , ["b", "Pochiru が %m.btnStates", "isButtonClicked", "クリックされた"]
    // , [" ", "%m.sensors のLEDを %m.outputs にする", "controlLED", "Sizuku 6X", "on"]
    // , [" ", "温度を %m.outputs にする", "controlTemperature", "on"]
    // , [" ", "湿度を %m.outputs にする", "controlHumidity", "on"]
    // , [" ", "加速度を %m.outputs にする", "controlACL", "on"]
  ]
  };


  //ブロックを登録
  ScratchExtensions.register("Studuino Extension", descriptor, ext);
})({});
