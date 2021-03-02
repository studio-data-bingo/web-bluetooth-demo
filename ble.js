/* ----------------------------------------------------------------------------------------------------
 * Web Bluetooth, 2020
 * Created: 03/02/20 by Bastien DIDIER
 * 
 * ble.js allows a simplified connection with adafruit bluefruit
 *
 * Tested with Adafruit Feather 32u4 Bluefruit LE [https://www.adafruit.com/product/2829]
 * 
 * Update: 03/02/20 Current V.1
 * ----------------------------------------------------------------------------------------------------
 */
let ble = {
	gatt: undefined,
	service: undefined,
	characteristic: undefined,
	busy: false,
	isReady: false,
	connect : () => {
		
		if(ble.isReady) return;

		const UART_PRIMARY_SERVICE   = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
		const UART_RX_CHARACTERISTIC = '6e400002-b5a3-f393-e0a9-e50e24dcca9e';
		const UART_TX_CHARACTERISTIC = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

		const options =	{
			filters: [
				{ name: 'Adafruit Bluefruit LE' }
			],
			optionalServices: [UART_PRIMARY_SERVICE]
		};

		navigator.bluetooth.requestDevice(options).then(device => {
				return device.gatt.connect();
			}).then(function(g) {
				ble.gatt = g;
				return g.getPrimaryService(UART_PRIMARY_SERVICE);
			}).then(function(s) {
				ble.service = s;
				return s.getCharacteristic(UART_RX_CHARACTERISTIC);
			}).then(function(c) {
				ble.characteristic = c;
			}).then(function() {
				ble.isReady = true;
				ble.onReadyStateChange();
				console.log("Finish Initialisation !");
			}).catch(function(error) {
				console.log("Something went wrong. " + error);
			});
	},
	disconnect : () => {
		if(ble.gatt){
			ble.gatt.disconnect();
			ble.gatt = undefined;
			ble.service = undefined;
			ble.characteristic = undefined;
			ble.isReady = false;
		}
	},
	send : (value) => {

		if(!ble.isReady) return;
		if (ble.busy) return;
		ble.busy = true;
				
		const encoder = new TextEncoder('utf-8');
		const v = encoder.encode(value);

		ble.characteristic.writeValue(v).then(function() {
			ble.busy = false;
			console.log("try to send : \""+value+"\" | encoded value : "+v);
		});
	},
	onReadyStateChange(){},
	ready : (listener) => {
		ble.onReadyStateChange = listener;
	}
};