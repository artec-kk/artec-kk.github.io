(function (ext) {

	ext._shutdown = function() {};

	class Studuino {
		constructor(type) {
			this.device = null;
			this.server = null;
			this.services = null;
			this.type = type;
			this.previousRcvData = null;
			this.writeCharacteristic = null;
			this.writeCharacteristic2 = null;
			this.connected = false;
			this.disconnecting = false;
			// this.prefix = sensorNamePrefix[sensors.indexOf(type)];
			// this.SensorBaseClass = createSensorBaseClass(type);
			console.log("type:" + this.type);

			/* UUID */
			let UUIDServices 				= ["442F1570-8A00-9A28-CBE1-E1D4212D53EB"];
			let UUIDCharacteristicsREAD 	= ["442F1571-8A00-9A28-CBE1-E1D4212D53EB"];
			let UUIDCharacteristicsWRITE	= ["442F1572-8A00-9A28-CBE1-E1D4212D53EB"];
		}

		async requestDevice(prefix) {
			try {
				var self = this;
				this.device = await navigator.bluetooth.requestDevice({
					filters: [{
						services:[ UUIDServices ]
						// namePrefix: self.prefix
					}]
				});
				alert("device got!");

				this.device.addEventListener("gattserverdisconnected", function () {
					console.log("> Bluetooth Device disconnected:" + self.device.name);
					self.connected = false;
					if (!self.disconnecting && !self.connecting) {
						//自分から切断した場合、接続中以外は再接続
						self.connect();
					}
				});
				console.log("Connecting to GATT Server...");
				this.connect();
			}
			catch (error) {
				console.log("Argh! " + error);
			}
		}

		async connect() {
			this.connecting = true;
			var self = this;
			this.exponentialBackoff(3 /* max retries */ , 2 /* seconds delay */ , async function toTry() {
				self.disconnecting = false;
				time("Connecting to Bluetooth Device... name:" + self.device.name);
				self.server = await self.device.gatt.connect({
					bond: true
				});
				self.connecting = false;
				alert(self.connecting);
				self.services = await self.server.getPrimaryServices();
				time("Service Discovered...");
				time("Start Notify");
				await self.startNotify(self.services);
				let _LinkingDevice = getDevice([self.type]);
				if (_LinkingDevice == null) {
					LinkingDeviceList.push(self);
				}
			}, function success() {
				time("Connected... name:" + self.device.name);
			}, function fail() {
				self.connected = false;
				self.connecting = false;
				time("Failed to connect.");
			});
		}
		async exponentialBackoff(max, delay, toTry, success, fail) {
			var self = this;
			try {
				const result = await toTry();
				success(result);
			}
			catch (error) {
				console.log(error);
				if (max === 0) {
					return fail();
				}
				time("Retrying in " + delay + "s... (" + max + " tries left)");
				setTimeout(function () {
					self.exponentialBackoff(--max, delay * 2, toTry, success, fail);
				}, delay * 1000);
			}
		}
		async startNotify(services) {
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
		}
		setWriteCharacteristic(characteristic) {
		  this.writeCharacteristic = characteristic;
		}
		ledOn() {
			let value = Uint8Array.of(
				0xA1,
				0x00,
				0xA1
			);
			alert("LED ON!");
			this.writeCharacteristic.writeValue(value);
		}

		ledOff() {
			let value = Uint8Array.of(
				0xA0,
				0x00,
				0xA0
			);
			alert("LED OFF!");
			this.writeCharacteristic.writeValue(value);
		}
	}

	ext.log = function(str) {
		// ログを出力する
		alert(str);
	};

	/* 接続制御 */
	ext.controlConnect = async function (type, val) {
		console.log("controlConnect:type:" + type + " val:" + val);
		var studuino = new Studuino();
		// await studuino.requestDevice();
		// await studuino.connect();
		let value;
		if (val == "接続") {
			navigator.bluetooth.requestDevice({
			filters: [
				{
					services: [UUIDServices]
				}
			]
			})

			var studuino = new Studuino();
			await studuino.requestDevice();
			await studuino.device.gatt.connect();

			}
			catch (error) {
				console.log("Argh! " + error);
			}
		}
		else {
			if (studuino == null) {
				return;
			}
			studuino.disconnect();
		}
	};

	/* LED制御 */
	ext.controlLED = function (device, val) {
		console.log("controlLED:device:" + device + " val:" + val);
		let value;
		if (val == "点灯") {
			/* 点灯処理 */
			try {
				studuino.ledOn();
			}
			catch (error) {
				console.log("Argh! " + error);
			}
		}
		else {
			/* 消灯処理 */
			try {
				studuino.ledOff();
			}
			catch (error) {
				console.log("Argh! " + error);
			}
		}
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
			[" ", "Studuino と %m.connects する", "controlConnect", "接続"]
		// [" ", "サーボモーター %m.digitalConnecors を %m.connects にする", "moveServo", "D9", "90"]
		,	[" ", "LED %m.leds を %m.lights する", "controlLED", "A0", "点灯"]
		,	[" ", 'log %s', 'log', 'sample log']
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