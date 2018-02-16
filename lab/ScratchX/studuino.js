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
	const DEV_INIT_SENSOR	= DATA1_BASE + 0x51;

	const SENSOR_DIGITAL		= 0x00;
	const SENSOR_ANALOG			= 0x10;
	const SENSOR_ACCELEOMETER	= 0x20;
	const SENSOR_TEMPERATURE	= 0x30;
	const SENSOR_GYRO			= 0x40;

	const DATA_MASK			= 0xc0;
	const DATA_SENSOR1		= 0x00;
	const DATA_SENSOR2		= 0x40;
	const DATA_EXT1			= 0x80;
	const DATA_EXT2			= 0xc0;

	var sensorValue　= new Array(14);
	var tempSensorValue;
	var offset;

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

	/*
		Notification駆動でセンサーの値を更新
	*/
	function onStuduinoValueChanged(event) {
		for (i = 0; i < event.target.value.byteLength; i++) {
			var val = event.target.value.getUint8(0);
			var type = val & DATA_MASK;
			switch (type) {
				case DATA_SENSOR1:
					offset = (val & 0x3c) >>> 2;
					tempSensorValue = (val & 0x03) << 6;
				break;
				case DATA_SENSOR2:
					sensorValue[offset] = tempSensorValue + (val & 0x3f);
					tempSensorValue = 0;
				break;
				case DATA_EXT1:
				break;
				case DATA_EXT2:
				break;
			}
		}
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
		return  sensorValue[getPortNumber(pin)];
	};

	ext.getAccelerometer = function(sensor) {
	};

	ext.getButton = function(button) {
	};

	ext.connectWiFi = function(ssid, password) {
	};

	/*
		アナログセンサーを初期化
	*/
	ext.initAnalogSensor = function(sensor, pin) {
		var param = new Uint8Array(3);
		param[0] = DEV_INIT_SENSOR;
		param[1] = SENSOR_ANALOG + getPortNumber(pin);
		execute(param);
	};

	/*
		デジタルセンサーを初期化
	*/
	ext.initDigitalSensor = function(sensor, pin) {
		var param = new Uint8Array(3);
		param[0] = DEV_INIT_SENSOR;
		param[1] = SENSOR_DIGITAL + getPortNumber(pin);
		execute(param);
	};

	ext.getResponse = function(response) {
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
		天気予報を取得する
	*/
	ext.getWeather = function(para) {
		request = 'http://www.artec-kk.co.jp/lab/get_weather_info.php?zipcode=' + para;
		return getAjaxResponse(request, "text");
	};

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
		request = urlEndPoint;
		if (value != null) {
			request += "?" + value;
		}
		return getAjaxResponse(request, "text");
	};

	var descriptor = {
		menus: {
			  buttonStatus: ['押された', '放された']
			, onOff:		['ON', 'OFF']
			, lights:		['点灯', '消灯']
			, connects:		['接続', '切断']
			, anaPin:		['A0','A1','A2','A3','A4','A5','A6','A7' ]
			, digiPin:		['A0','A1','A2','A3','A4','A5' ]
			, anaaIN:		['A0','A1','A2','A3','A4','A5','A6','A7' ]
			, digiIO:		['A0','A1','A2','A3','A4','A5', 'D2','D4','D7','D8','D9','D10','D11','D12' ]
			, anaOUT:		['D9','D10','D11']
			, svmPin:		['D2','D4','D7','D8','D9','D10','D11','D12' ]
			, btnPin:		['A0','A1','A2','A3' ]
			, dcmPin:		['M1','M2' ]
			, dcmAction:    ['正転', '逆転', '停止', '解放']
			, accDirection:	['X軸', 'Y軸', 'Z軸']
			, accels:		['加速度1', '加速度2']
			, sensors:		['光センサー', 'タッチセンサー', '音センサー', '赤外線フォトリフレクタ']
			, httpRequest:	['キー', '値']
		}
		, blocks: [
		  // [' ', 'log %s',									'log', 'sample log']
		,　[' ', "Studuino と %m.connects する",				'controlBLE', '接続']

		// Studuino Blocks
		, [' ', 'LED %m.digiPin を %m.lights する',			'ledOnOff',          'A0', '点灯']
		// , [' ', 'サーボモーター　%m.svmPin を %n 度にする',			'setMotorDegree',    'D9', 90]
		// , [' ', 'DCモーター %m.dcmPin の速さを %n にする',			'setMotorPower',     'M1', 100]
		// , [' ', 'DCモーター %m.dcmPin を %m.dcmAction する',		'setMotorAction', 'M1', '正転']
		, [' ', 'ブザー %m.digiPin から %n を出力する',			'buzzerOn',          'A0', 60]
		, [' ', 'ブザー %m.digiPin off',						'buzzerOff',         'A0']

		//　Additional Studuino Blocks
		, [' ', '%m.sensors を %m.anaPin で使用',			'initAnalogSensor',          '光センサー', 'A0']
		, ['r', '%m.sensors %m.anaPin の値',					'getSensorValue',   '光センサー', 'A0']

		, [' ', '%m.sensors を %m.digPin で使用',			'initDigitalSensor',          'タッチセンサー', 'A0']
		, ['r', 'ボタン %m.btnPin の値',						'getButton',         'A0']

		, ['r', '加速度センサー %m.accDirection の値',			'getAccelerometer', 'x']

		//　Arduino Compatibile Blocks
		// , ['r', 'アナログ入力 %m.anaaIN の値',				'dummy',	'A0']
		// , [' ', 'アナログ出力 %m.anaOUT を %s にする',		'dummy',	'D9']
		// , ['r', 'デジタル入力 %m.digiIO の値',				'dummy',	'A0']
		// , [' ', 'デジタル出力 %m.digiIO を %m.onOff',		'dummy',	'A0', 'ON']

		/*
			Pin Assign
			|   | Analog In | Digital I/O | Anlog Out(PWM) |
			|A0 |    o      |      o      |                |
			|A1 |    o      |      o      |                |
			|A2 |    o      |      o      |                |
			|A3 |    o      |      o      |                |
			|A4 |    o      |      o      |                |
			|A5 |    o      |      o      |                |
			|A6 |    o      |      x      |                |
			|A7 |    o      |      x      |                |
			|   |           |             |                |
			|D2 |           |      o      |                |
			|D4 |           |      o      |                |
			|D7 |           |      o      |                |
			|D8 |           |      o      |                |
			|D9 |           |      o      |       o        |
			|D10|           |      o      |       o        |
			|D11|           |      o      |       o        |
			|D12|           |      o      |                |
		*/

		// Wi-Fi Blocks
		// , [' ', 'SSID %s のアクセスポイントに %s で接続する',			'connectWiFi', '', '']

		// Bluetooth Blocks
		// , [' ', 'BLEの通信グループ %s を作る',					'dummy', '1']
		// , [' ', '無線で数値 %s を送る',							'dummy', '']
		// , [' ', '無線で文字列 %s を送る',						'dummy', '']
		// , ['h', '無線で %n を受け取った時',						'dummy', 'received_number']
		// , ['h', '無線で %s と %s を受け取った時',					'dummy', 'received_name', 'received_value']

		// http　ブロック（クライアント）
		, ['r', 'パラメータ %s と %s',							'makeHttpParameter',		'キー', '値' ]
		, ['r', '%s に %s を送ってデータを受け取る',				'getHttpResponse',			'URLエンドポイント', 'パラメータ' ]
		, [' ', '%s に %s を送る',								'getHttpResponse',			'URLエンドポイント', 'パラメータ' ]
		// http　ブロック（サーバー）
		,　['h', "httpリクエストを受け取った時",						'dummy',]
		,　['r', "httpリクエストの　%s 番目の %m.httpRequest",		'dummy', "1", "キー"]
		,　['r', "httpリクエストの長さ",		'dummy',]
		// http　ブロック（マクロ）
		, ['r', '郵便番号 %s の明日の天気',						'getWeather', '']

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
