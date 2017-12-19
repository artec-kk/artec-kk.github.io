var studuino_device = null;
var studuino_characteristicWRITE;
var studuino_characteristicREAD;
function BLEconnect() {
	// loading表示
	// loading.className = "show";
	const UUIDServices        = "442f1570-8a00-9a28-cbe1-e1d4212d53eb";
	const UUIDCharacteristicsREAD   = "442f1571-8a00-9a28-cbe1-e1d4212d53eb";
	const UUIDCharacteristicsWRITE  = "442f1572-8a00-9a28-cbe1-e1d4212d53eb";

	studuino_device = null;
	navigator.bluetooth.requestDevice({
		filters: [
			 { namePrefix: 'Studuino' }
		],
		optionalServices: [ UUIDServices ]
	})
	.then(device => {
		debug_out("デバイスを選択しました。接続します。");
		debug_out("デバイス名 : " + device.name);
		debug_out("ID : " + device.id);

		studuino_device = device;
		return device.gatt.connect();		// 選択したデバイスに接続
	})
	.then(server => {
		debug_out("デバイス接続");
		return server.getPrimaryService(UUIDServices);	// UUIDに合致するサービス(機能)を取得
	})
	.then(service => {
		debug_out("サービスの取得");
		return Promise.all([
        service.getCharacteristic(UUIDCharacteristicsWRITE),
        service.getCharacteristic(UUIDCharacteristicsREAD)
      ]);
	})
	.then(characteristic => {
		debug_out("キャラクタリスティック取得");
		studuino_characteristicWRITE = characteristic[0];
		studuino_characteristicREAD = characteristic[1];
		studuino_characteristicREAD.startNotifications();
		studuino_characteristicREAD.addEventListener('characteristicvaluechanged',onStuduinoValueChanged);  

		debug_out("BLE接続が完了しました。");
	})
	.catch(error => {
		debug_out("Error : " + error);
			// loading非表示
			// loading.className = "hide";
	});
}

function BLEdisconnect() {
	if (!studuino_device || !studuino_device.gatt.connected) return ;
	studuino_device.gatt.disconnect();
	debug_out("BLE接続を切断しました。");
	studuino_device = null;
}

function debug_out(msg) {
	// alert(msg);
}

function LEDcontrol(value) {
	var msg;
	var param = new Uint8Array(3);
	if ( studuino_device == null) {
		debug_out("Studuinoと接続されていません");
	} else {
		if (value) {
			param[0] = 0xb1;
			param[1] = 0x00;
			param[2] = param[0] + param[1];
			msg = "LED ON";
		} else {
			param[0] = 0xb0;
			param[1] = 0x00;
			param[2] = param[0] + param[1];
			msg = "LED OFF";
		}
		studuino_characteristicWRITE.writeValue(param);
		debug_out(msg);
	}
}

function onStuduinoValueChanged(event) {
	// alert(event.target.value.getUint16(0));
    document.ble.data.value = event.target.value.getUint8(0).toString();

}