var studuino_device;
var studuino_characteristicWRITE;
var studuino_characteristicREAD;
function connectBLE() {
	// loading表示
	// loading.className = "show";
	const UUIDServices        = "442f1570-8a00-9a28-cbe1-e1d4212d53eb";
	const UUIDCharacteristicsREAD   = "442f1571-8a00-9a28-cbe1-e1d4212d53eb";
	const UUIDCharacteristicsWRITE  = "442f1572-8a00-9a28-cbe1-e1d4212d53eb";

	alert("接続開始");
	navigator.bluetooth.requestDevice({
		filters: [{
			acceptAllDevices:true,
			optionalServices: [ "442f1570-8a00-9a28-cbe1-e1d4212d53eb" ]
		}]
	})
	.then(device => {
		alert("デバイスを選択しました。接続します。");
		alert("デバイス名 : " + device.name);
		alert("ID : " + device.id);

		studuino_device = device;
		return device.gatt.connect();		// 選択したデバイスに接続
	})
	.then(server => {
		alert("デバイス接続");
		return server.getPrimaryService(UUIDServices);	// UUIDに合致するサービス(機能)を取得
	})
	.then(service => {
		alert("サービスの取得");
		return service.getCharacteristic(UUIDCharacteristicsWRITE);	// UUIDに合致するキャラクタリスティック(サービスが扱うデータ)を取得
	})
	.then(characteristic => {
		alert("キャラクタリスティック取得");
		studuino_characteristicWRITE = characteristic;
		alert("BLE接続が完了しました。");

		// LEDを切り替えるボタンを表示
		showLEDButton();

		// LEDの初期設定
		initLED();
	})
	.catch(error => {
		alert("Error : " + error);
			// loading非表示
			// loading.className = "hide";
	});
}

function disconnect() {
	if (!studuino_device || !studuino_device.gatt.connected) return ;
	studuino_device.gatt.disconnect();
	alert("BLE接続を切断しました。")
}
