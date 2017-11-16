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


			/* */
			self.services = await self.server.getPrimaryServices();
			var self = this;
			for (const service of services) {
				console.log("> Service: " + service.uuid);
				characteristics = await service.getCharacteristics();
				characteristics.forEach(characteristic => {
					console.log(">> Characteristic: " + characteristic.uuid + " " + getSupportedProperties(characteristic));
					if (characteristic.uuid == "b3b39101-50d3-4044-808d-50835b13a6cd") {
						console.log(">> addEventListener: write");
						self.setWriteCharacteristic(characteristic);
					}
					else {
						console.log(">> addEventListener: indicate");
						self.writeCharacteristic2 = characteristic;
						const result = characteristic.startNotifications();
						console.log("> startNotifications result:" + result); {
							console.log("> Notifications started");
							self.connected = true;
							self.writeCharacteristic2.addEventListener("characteristicvaluechanged", self.handleNotifications.bind(self));
						}
					}
				});
			}




		service.
										mBLEService.setCharacteristicNotification(mCharaRead, true);
										//if(mCharaRead.getUuid().equals(ARTEC_READ_CHARA)) {
										BluetoothGattDescriptor desc = mCharaRead.getDescriptor(ARTEC_WRITE_DESC);
										desc.setValue(BluetoothGattDescriptor.ENABLE_NOTIFICATION_VALUE);
										mBLEService.writeDescriptor(desc);





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

	// 川瀬さんからいただいたブロックのソース。あとで取り込む。
	// var descriptor = {
	// 	blocks: [
	// 		[' ', 'Set servomtor %m.svmPin to %n degrees',      'setMotorDegree',    'D9', 90],
	// 		[' ', 'DC motor %m.dcmPin power %n',                'setMotorPower',     'M1', 100],
	// 		[' ', 'DC motor %m.dcmPin on at %m.dcmDirection',   'setMotorDirection', 'M1', 'cw.'],
	// 		[' ', 'DC motor %m.dcmPin off %m.dcmStop',          'setMotorStop',      'M1', 'Brake'],
	// 		[' ', 'Buzzer %m.digiPin on frequency %n',          'buzzerOn',          'A0', 60],
	// 		[' ', 'Buzzer %m.digiPin off',                      'buzzerOff',         'A0'],
	// 		[' ', 'LED %m.digiPin %m.onOff',                    'ledOnOff',          'A0', 'on'],

	// 		['r', 'Light Sensor %m.anaPin value',               'getLightSensor',    'A0'],
	// 		['r', 'Touch Sensor %m.digiPin value',              'getTouchSensor',    'A0'],
	// 		['r', 'Sound Sensor %m.anaPin value',               'getSoundSensor',    'A0'],
	// 		['r', 'IR Photoreflector %m.anaPin value',          'getIRPhotoreflector','A0'],
	// 		['r', '3-Axis Digital Accelerometer %m.accDirection value','getAccelerometer','x'],
	// 		['r', 'Button %m.btnPin value',                     'getButton',         'A0']
	// 	],
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