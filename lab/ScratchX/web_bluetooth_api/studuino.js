(function (ext) {

	const UUIDServices        			= "442f1570-8a00-9a28-cbe1-e1d4212d53eb";
	const UUIDCharacteristicsREAD   = "442f1571-8a00-9a28-cbe1-e1d4212d53eb";
	const UUIDCharacteristicsWRITE  = "442f1572-8a00-9a28-cbe1-e1d4212d53eb";

	var ledCharacteristic;
	var device;
	var server;
	var services;
	var type = type;
	var previousRcvData;
	var writeCharacteristic;
	var writeCharacteristic2;
	var connected;
	var disconnecting;

	// Extension の状態を返すメソッド
	// ---
	// 返す値, 表示される色, 意味
	//      0,	red,	error
	//      1,	yellow,	not ready
	//      2,	green,	ready
	// ---
	ext._getStatus = function() {
		return {status: 2, msg: 'Ready'};
	};

	ext.connectBLE = function(type) {
		// navigator.bluetooth.requestDevice({
		// 	filters: [
		// 		// { services: [ UUIDServices ] }
		// 		{ name: [ "Studuino-8D91751" ] }
		// 	],
		// 	optionalServices: [ UUIDServices ]
		// })
		// .then(device => {
		// 	debug("デバイスを選択しました。接続します。");
		// 	debug("デバイス名 : " + device.name);
		// 	debug("ID : " + device.id);

		// 	// 選択したデバイスに接続
		// 	return device.gatt.connect();
		// })
		// .then(server => {
		// 	debug("デバイスへの接続に成功しました。サービスを取得します。");

		// 	// UUIDに合致するサービス(機能)を取得
		// 	return server.getPrimaryService(UUIDServices);
		// })
		// .then(service => {
		// 	debug("サービスの取得に成功しました。キャラクタリスティックを取得します。");

		// 	// UUIDに合致するキャラクタリスティック(サービスが扱うデータ)を取得
		// 	return service.getCharacteristic(UUIDCharacteristicsWRITE);
		// })
		// .then(characteristic => {
		// 	debug("キャラクタリスティックの取得に成功しました。");

		// 	ledCharacteristic = characteristic;
		// 	debug("BLE接続が完了しました。");


		// 	/* */
		// 	self.services = await self.server.getPrimaryServices();
		// 	var self = this;
		// 	for (const service of services) {
		// 		console.log("> Service: " + service.uuid);
		// 		characteristics = await service.getCharacteristics();
		// 		characteristics.forEach(characteristic => {
		// 			console.log(">> Characteristic: " + characteristic.uuid + " " + getSupportedProperties(characteristic));
		// 			if (characteristic.uuid == "b3b39101-50d3-4044-808d-50835b13a6cd") {
		// 				console.log(">> addEventListener: write");
		// 				self.setWriteCharacteristic(characteristic);
		// 			}
		// 			else {
		// 				console.log(">> addEventListener: indicate");
		// 				self.writeCharacteristic2 = characteristic;
		// 				const result = characteristic.startNotifications();
		// 				console.log("> startNotifications result:" + result); {
		// 					console.log("> Notifications started");
		// 					self.connected = true;
		// 					self.writeCharacteristic2.addEventListener("characteristicvaluechanged", self.handleNotifications.bind(self));
		// 				}
		// 			}
		// 		});
		// 	}
		// service.
		// 								mBLEService.setCharacteristicNotification(mCharaRead, true);
		// 								//if(mCharaRead.getUuid().equals(ARTEC_READ_CHARA)) {
		// 								BluetoothGattDescriptor desc = mCharaRead.getDescriptor(ARTEC_WRITE_DESC);
		// 								desc.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
		// 								mBLEService.writeDescriptor(desc);
		// })
		// .catch(error => {
		// 	debug("Error : " + error);

		// 	// loading非表示
		// 	loading.className = "hide";
		// });
	}

	function debug(str) {
		// console.log(str);
		alert(str);
	}

	ext.controlLED = function (device, type) {
			debug(type);
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
	}

	ext.log = function(str) {
		// ログを出力する
		alert(str);
	};

	ext.setMotorDegree = function(svm, degree) {
	};

	ext.setMotorPower = function(dcm, power) {
	};

	ext.setMotorAction = function(dcm, direction) {
	};

	ext.buzzerOn = function(buzzer, tone) {
	};

	ext.buzzerOff = function(buzzer) {
	};

	ext.ledOnOff = function(led) {
	};

	ext.getSensorValue = function(sensor, pin) {
	};

	ext.getAccelerometer = function(sensor) {
	};

	ext.getButton = function(button) {
	};

	ext.connectWiFi = function(ssid, password) {
	};

	ext.getHttp = function(uri, para, callback) {
		request = 'http://' + uri + '?zipcode=' + para;
		$.ajax({
			type: 'get',
			url: request,
		 	dataType: 'text',
			success: function(data) {
				console.log(data);
			 	if (data == undefined) {
					callback('');
			 	} else {
					callback(data);
				}
			}
		});
	};

	ext.getResponse = function(response) {
	};

	ext.joinParameter = function(string, string) {
	};

	ext.getWeather = function(para, callback) {
		request = 'http://www.artec-kk.co.jp/lab/get_weather_info.php?zipcode=' + para;
		alert(request);
		$.ajax({
			// url: request,
			url: 'http://www.artec-kk.co.jp/lab/get_weather_info.php?zipcode=581-0066',
		 	dataType: 'text'
		 })
		.then(
			// 成功時処理
			function(data) {
				alert(data);
				console.log(data);
			 	if (data == undefined) {
					callback('');
			 	} else {
					callback(data);
				}
			},
			// エラー処理
			function () {
     		   alert("読み込み失敗");
    		}
		});
	};

	var descriptor = {
		menus: {
			  buttonStatus: ['押された', '放された']
			, onOff:		['ON', 'OFF']
			, lights:		['点灯', '消灯']
			, connects:		['接続', '切断']
			, anaPin:		['A0','A1','A2','A3','A4','A5','A6','A7','A6','A7' ]
			, digiPin:		['A0','A1','A2','A3','A4','A5' ]
			, svmPin:		['D2','D4','D7','D8','D9','D10','D11','D12' ]
			, btnPin:		['A0','A1','A2','A3' ]
			, ledPin:		['A0','A1','A2','A3','A4','A5' ]
			, dcmPin:		['M1','M2' ]
			, dcmAction:    ['正転', '逆転', '停止', '解放']
			, accDirection:	['X軸', 'Y軸', 'Z軸']
			, accels:		['加速度1', '加速度2']
			, sensors:		['光センサー', 'タッチセンサー', '音センサー', '赤外線フォトリフレクタ']
		}
		, blocks: [
		  [' ', 'log %s',									'log', 'sample log']
		,　[' ', "Studuino と %m.connects する",				'connectBLE', '接続']

		// Studuino Blocks
		, [' ', "LED %m.leds を %m.lights する",				"controlLED", "A0", '点灯']
		, [' ', 'サーボモーター　%m.svmPin を %n 度にする',			'setMotorDegree',    'D9', 90]
		, [' ', 'DCモーター %m.dcmPin の速さを %n にする',			'setMotorPower',     'M1', 100]
		, [' ', 'DCモーター %m.dcmPin を %m.dcmAction する',		'setMotorAction', 'M1', '正転']
		, [' ', 'ブザー %m.digiPin から %n を出力する',			'buzzerOn',          'A0', 60]
		, [' ', 'ブザー %m.digiPin off',						'buzzerOff',         'A0']
		, [' ', 'LED %m.digiPin を %m.onOff する',			'ledOnOff',          'A0', '点灯']
		, ['r', '%m.sensors %m.anaPin の値',					'getSensorValue',   '光センサー', 'A0']
		, ['r', '加速度センサー %m.accDirection の値',			'getAccelerometer', 'x']
		, ['r', 'ボタン %m.btnPin の値',						'getButton',         'A0']

		// Wi-Fi Blocks
		, [' ', 'SSID %s のアクセスポイントに %s で接続する',			'connectWiFi', '', '']
		, ['r', 'http:// %s に　%s を送った結果',				'getHttp', 'www.artec-kk.co.jp/', '']
		, ['r', '郵便番号 %s の明日の天気',						'getWeather', '']
		, ['r', '%s と %s',									'joinParameter', '', '']

		// Bluetooth Blocks
		, [' ', 'BLEの通信グループ %s を作る',					'dummy', '1']
		, [' ', '無線で数値 %s を送る',							'dummy', '']
		, [' ', '無線で文字列 %s を送る',						'dummy', '']
		, ['h', '無線で %n を受け取った時',						'dummy', 'received_number']
		, ['h', '無線で %s と %s を受け取った時',					'dummy', 'received_name', 'received_value']


		//　English Blocks
		// , [' ', 'Set servomtor %m.svmPin to %n degrees',      'setMotorDegree',    'D9', 90]
		// , [' ', 'DC motor %m.dcmPin power %n',                'setMotorPower',     'M1', 100]
		// , [' ', 'DC motor %m.dcmPin on at %m.dcmDirection',   'setMotorDirection', 'M1', 'cw.']
		// , [' ', 'DC motor %m.dcmPin off %m.dcmStop',          'setMotorStop',      'M1', 'Brake']
		// , [' ', 'Buzzer %m.digiPin on frequency %n',          'buzzerOn',          'A0', 60]
		// , [' ', 'Buzzer %m.digiPin off',                      'buzzerOff',         'A0']
		// , [' ', 'LED %m.digiPin %m.onOff',                    'ledOnOff',          'A0', 'on']
		// , ['r', 'Light Sensor %m.anaPin value',               'getLightSensor',    'A0']
		// , ['r', 'Touch Sensor %m.digiPin value',              'getTouchSensor',    'A0']
		// , ['r', 'Sound Sensor %m.anaPin value',               'getSoundSensor',    'A0']
		// , ['r', 'IR Photoreflector %m.anaPin value',          'getIRPhotoreflector','A0']
		// , ['r', '3-Axis Digital Accelerometer %m.accDirection value','getAccelerometer','x']
		// , ['r', 'Button %m.btnPin value',                     'getButton',         'A0']

		// , ['r', '光センサー　%m.leds　の値', 'getLightSensorValue', 'A0']
		// , ['h', 'ボタン %m.buttons　が %m.buttonStatus とき', 'isButtonPressed', ,'A0', '押された']
		// , ['b', 'Pochiru が %m.btnStates', 'isButtonClicked', 'クリックされた']
		// , [' ', '%m.sensors のLEDを %m.outputs にする', 'controlLED', 'Sizuku 6X', 'on']
		// , [' ', '温度を %m.outputs にする', 'controlTemperature', 'on']
		// , [' ', '湿度を %m.outputs にする', 'controlHumidity', 'on']
		// , [' ', '加速度を %m.outputs にする', 'controlACL', 'on']
	]
	};

	// 	menus: {
	// 	  svmPin: ['D2', 'D4', 'D7', 'D8', 'D9', 'D10', 'D11', 'D12'],
	// 	  dcmPin: ['M1', 'M2'],
	// 	  dcmDirection: ['cw.', 'ccw.'],
	// 	  dcmStop: ['Brake', 'Coast'],
	// 	  anaPin: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'],
	// 	  digiPin: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'],
	// 	  btnPin: ['A0', 'A1', 'A2', 'A3'],
	// 	  accDirection: ['x', 'y', 'z'],
	// 	  onOff:  ['on', 'off']
	// 	}
	// };


	//ブロックを登録
	ScratchExtensions.register("Studuino Extension", descriptor, ext);
})({});
