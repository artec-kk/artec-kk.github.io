(function (ext) {

	/*
		data1部用コマンド定義
	*/
	const DATA1_BASE		= 0x80;
	const DEV_DC_MOTOR		= DATA1_BASE + 0x00;
	const DEV_SERVO_MOTOR	= DATA1_BASE + 0x10;
	const DEV_BUZZER 		= DATA1_BASE + 0x20;
	const DEV_LED 			= DATA1_BASE + 0x30;
	const DEV_EXT 			= DATA1_BASE + 0x50;

	/*
		UUID
	*/
	const UUIDServices        		= "442f1570-8a00-9a28-cbe1-e1d4212d53eb";
	const UUIDCharacteristicsREAD   = "442f1571-8a00-9a28-cbe1-e1d4212d53eb";
	const UUIDCharacteristicsWRITE  = "442f1572-8a00-9a28-cbe1-e1d4212d53eb";

	var device;
	var server;
	var services;
	var previousRcvData;
	var studuino_characteristicWRITE;
	var studuino_characteristicREAD;

	function getPortNumber(device) {
		return parseInt(device.substr(1));
	}

	function execute(value) {
		value[2] = value[0] + value[1];
		studuino_characteristicWRITE.writeValue(value);
	}

	function debug(str) {
		// console.log(str);
		// alert(str);
	}

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

	/*
		BLE接続/切断処理
	*/
	ext.controlBLE = function(mode) {
		if(mode == "接続") {
			studuino_device = null;
			navigator.bluetooth.requestDevice({
				filters: [
					 { namePrefix: 'Studuino' }
				],
				optionalServices: [ UUIDServices ]
			})
			.then(device => {
				debug("デバイスを選択しました。接続します。");
				debug("デバイス名 : " + device.name);
				debug("ID : " + device.id);

				studuino_device = device;
				return device.gatt.connect();		// 選択したデバイスに接続
			})
			.then(server => {
				debug("デバイス接続");
				return server.getPrimaryService(UUIDServices);	// UUIDに合致するサービス(機能)を取得
			})
			.then(service => {
				debug("サービスの取得");
				return Promise.all([
		        service.getCharacteristic(UUIDCharacteristicsWRITE),
		        service.getCharacteristic(UUIDCharacteristicsREAD)
		      ]);
			})
			.then(characteristic => {
				debug("キャラクタリスティック取得");
				studuino_characteristicWRITE = characteristic[0];
				studuino_characteristicREAD = characteristic[1];
				studuino_characteristicREAD.startNotifications();
				studuino_characteristicREAD.addEventListener('characteristicvaluechanged',onStuduinoValueChanged);  

				debug("BLE接続が完了しました。");
			})
			.catch(error => {
				debug("Error : " + error);
					// loading非表示
					// loading.className = "hide";
			});
		} else {
			if (!studuino_device || !studuino_device.gatt.connected) return ;
			studuino_device.gatt.disconnect();
			debug_out("BLE接続を切断しました。");
			studuino_device = null;
		}
	}

	function onStuduinoValueChanged(event) {
		var val = studuino_characteristicREAD.readValue().getUint8(0);
		var type = val & 0xc0;
		alert(val.toString());
	}

	/*
		LEDを制御する
	*/
	ext.ledOnOff = function (led, type) {
		var param = new Uint8Array(3);
		param[0] = DEV_LED + getPortNumber(led) * 2;
		if (type == "点灯") {
			param[0] += 1;
		}
		param[1] = 0x00;
		execute(param);
	}

	/*
		ブザーを鳴らす
	*/
	ext.buzzerOn = function(buzzer, tone) {
		var param = new Uint8Array(3);
		param[0] = DEV_BUZZER + getPortNumber(buzzer) * 2 + 0x01;
		param[1] = parseInt(tone);
		execute(param);
	};

	ext.buzzerOff = function(buzzer) {
		var param = new Uint8Array(3);
		param[0] = DEV_BUZZER + getPortNumber(buzzer) * 2;
		param[1] = 0;
		execute(param);
	};

	ext.log = function(str) {
		// ログを出力する
		alert(str);
	};

	ext.setMotorDegree = function(svm, degree) {
	};

	ext.setMotorPower = function(dcm, power) {
		var param = new Uint8Array(3);
		param[0] = DEV_DC_MOTOR + getPortNumber(dcm) * 8;
		param[1] = 0;
		execute(param);
	};

	ext.setMotorAction = function(dcm, direction) {
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

	ext.getWeather = function(para, callback) {
		request = 'http://www.artec-kk.co.jp/lab/get_weather_info.php?zipcode=' + para;
		getAjaxResponse(request, "text").done(function(data){
			return data;
		})
		.fail(function(data){
			return "";
		});
	};

	function getAjaxResponse(request, type) {
		return $.ajax({
			type: "GET",
			url: request,
			dataType: type,
			async: false
		}).responseText;
	}

	/*
		httpリクエスト用パラメータを作成する。
	*/
	ext.makeHttpParameter= function(key, value, callback) {
		parameter = "&" + key + "=" + value;
		return parameter;
	};

	/*
		httpリクエストブロック
	*/
	ext.getHttpResponse = function(urlEndPoint, value) {
		if(value.slice(0, 1) == "&") {
			value = value.slice(1);
		}
		request = urlEndPoint + "?" + value;
		return getAjaxResponse(request, "text");
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
			, dcmPin:		['M1','M2' ]
			, dcmAction:    ['正転', '逆転', '停止', '解放']
			, accDirection:	['X軸', 'Y軸', 'Z軸']
			, accels:		['加速度1', '加速度2']
			, sensors:		['光センサー', 'タッチセンサー', '音センサー', '赤外線フォトリフレクタ']
		}
		, blocks: [
		  [' ', 'log %s',									'log', 'sample log']
		,　[' ', "Studuino と %m.connects する",				'controlBLE', '接続']

		// Studuino Blocks
		, [' ', 'LED %m.digiPin を %m.lights する',			'ledOnOff',          'A0', '点灯']
		, [' ', 'サーボモーター　%m.svmPin を %n 度にする',			'setMotorDegree',    'D9', 90]
		, [' ', 'DCモーター %m.dcmPin の速さを %n にする',			'setMotorPower',     'M1', 100]
		, [' ', 'DCモーター %m.dcmPin を %m.dcmAction する',		'setMotorAction', 'M1', '正転']
		, [' ', 'ブザー %m.digiPin から %n を出力する',			'buzzerOn',          'A0', 60]
		, [' ', 'ブザー %m.digiPin off',						'buzzerOff',         'A0']
		, ['r', '%m.sensors %m.anaPin の値',					'getSensorValue',   '光センサー', 'A0']
		, ['r', '加速度センサー %m.accDirection の値',			'getAccelerometer', 'x']
		, ['r', 'ボタン %m.btnPin の値',						'getButton',         'A0']

		// Wi-Fi Blocks
		// , [' ', 'SSID %s のアクセスポイントに %s で接続する',			'connectWiFi', '', '']

		// Bluetooth Blocks
		// , [' ', 'BLEの通信グループ %s を作る',					'dummy', '1']
		// , [' ', '無線で数値 %s を送る',							'dummy', '']
		// , [' ', '無線で文字列 %s を送る',						'dummy', '']
		// , ['h', '無線で %n を受け取った時',						'dummy', 'received_number']
		// , ['h', '無線で %s と %s を受け取った時',					'dummy', 'received_name', 'received_value']

		// http　ブロック
		, ['r', 'パラメータ %s と %s',						'makeHttpParameter',		'zipcode', '5810066' ]
		, ['r', 'URL %s に %s を送ってデータを受け取る',			'getHttpResponse',			'http://www.artec-kk.co.jp/lab/get_weather_info.php', 'パラメータ' ]
		, ['r', '郵便番号 %s の明日の天気',						'getWeather', '']
		, ['r', 'http:// %s に　%s を送った結果',				'getHttp', 'www.artec-kk.co.jp/', '']

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