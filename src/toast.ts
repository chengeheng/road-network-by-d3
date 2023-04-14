import { message } from "antd";
import { MessageType } from "antd/es/message/interface";

class Toast {
	_key: number;
	_close: MessageType | null;
	constructor() {
		this._key = 0;
		this._close = null;
		message.destroy();
	}

	show(content = "toast", { top = "0px", left = "0px", duration = 2000, key = Math.random() }) {
		this._key = key;
		this._close = message.open({
			content,
			style: {
				width: "100px",
				transform: `translate(${left}, ${top})`,
			},
			duration,
			key,
		});
	}
	close() {
		message.destroy(this._key);
	}
}

export default new Toast();
