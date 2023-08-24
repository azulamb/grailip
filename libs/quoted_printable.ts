export class QuotedPrintable {
	protected inHex(charCode: number) {
		return 48 <= charCode && charCode <= 57 || // 0-9
			65 <= charCode && charCode <= 70 || // A-F
			97 <= charCode && charCode <= 102; // a-f
	}
	protected toHex(charCode: number): number {
		if (48 <= charCode && charCode <= 57) {
			return charCode - 48;
		}
		if (65 <= charCode && charCode <= 70) {
			return charCode - 55;
		}
		if (97 <= charCode && charCode <= 102) {
			return charCode - 87;
		}
		throw new Error('Invalid hex character');
	}

	protected decodeLine(data: string): Uint8Array {
		if (data.match(/^=\?[a-z0-9\-]+\?Q\?/)) {
			data = data.replace(/^=\?[a-z0-9\-]+\?Q\?/, '').replace(/\?=$/, '');
		} else {
			data = data.replace(/=$/, '');
		}
		const raw = new TextEncoder().encode(data);
		const byte: number[] = [];

		for (let i = 0; i < raw.length; ++i) {
			if (raw[i] === 61 && i + 2 < raw.length && this.inHex(raw[i + 1]) && this.inHex(raw[i + 2])) {
				byte.push(this.toHex(raw[i + 1]) * 16 + this.toHex(raw[i + 2]));
				i += 2;
			} else {
				byte.push(raw[i]);
			}
		}

		return new Uint8Array(byte);
	}

	public async decode(data: string): Promise<ArrayBuffer> {
		const lines = data.split(/\r?\n/);
		return new Blob(lines.map((line) => {
			return this.decodeLine(line);
		})).arrayBuffer();
	}

	public async decodeToUtf8(data: string): Promise<string> {
		const buffer = await this.decode(data);
		return new TextDecoder().decode(buffer);
	}
}
