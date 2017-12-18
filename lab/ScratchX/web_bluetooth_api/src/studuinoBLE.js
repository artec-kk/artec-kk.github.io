var studuino_device;
var studuino_characteristic;
function connectBLE() {
	// loading表示
	// loading.className = "show";
	const UUIDServices        = "442f1570-8a00-9a28-cbe1-e1d4212d53eb";
	const UUIDCharacteristicsREAD   = "442f1571-8a00-9a28-cbe1-e1d4212d53eb";
	const UUIDCharacteristicsWRITE  = "442f1572-8a00-9a28-cbe1-e1d4212d53eb";

	alert("接続を開始します。");
	navigator.bluetooth.requestDevice({
		filters: [{
			services: [ UUIDServices]
		}]
	})
	.then(device => {
		alert("デバイスを選択しました。接続します。");
		alert("デバイス名 : " + device.name);
		alert("ID : " + device.id);

		studuino_device = device;
		// 選択したデバイスに接続
		return device.gatt.connect();
	})
	.then(server => {
		alert("デバイスへの接続に成功しました。サービスを取得します。");

		// UUIDに合致するサービス(機能)を取得
		return server.getPrimaryService(UUIDServices);
	})
	.then(service => {
		alert("サービスの取得に成功しました。キャラクタリスティックを取得します。");
		// UUIDに合致するキャラクタリスティック(サービスが扱うデータ)を取得
		return service.getCharacteristic(UUIDCharacteristicsWRITE);
	})
	.then(characteristic => {
		alert("キャラクタリスティックの取得に成功しました。");
		ledCharacteristic = characteristic;
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
