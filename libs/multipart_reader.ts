type MhtmlHeader = { From: string; 'Snapshot-Content-Location': string; Subject: string; 'Content-Type': string } & { [keys: string]: string };

export class MimeParser {
	protected header = new MimeHeader();
	public mimeParts: MimePart[] = [];
	protected readLine: (line: string) => boolean;
	public boundary = '';
	protected filter: RegExp;

	constructor() {
		this.readLine = this.header.getNext();
		this.filter = new RegExp('.*');
	}

	public setMimeTypeFilter(filter: RegExp | string) {
		this.filter = typeof filter === 'string' ? new RegExp(filter) : filter;

		return this;
	}

	get headers() {
		return this.header.headers;
	}

	public next(line: string) {
		if (!this.readLine(line)) {
			return false;
		}

		if (!this.boundary) {
			this.boundary = this.header.boundary || '';
		}

		// Contents.
		if (1 < this.mimeParts.length && this.mimeParts[this.mimeParts.length - 1].isLast) {
			this.readLine = () => {
				return true;
			};
			return true;
		}

		const mimePart = new MimePart();
		this.mimeParts.push(mimePart);
		this.readLine = mimePart.getNext(this.boundary, this.filter);

		return false;
	}
}

class MimeHeader {
	public headers: MhtmlHeader;
	public boundary?: string;
	protected prev = '';

	constructor() {
		this.headers = {
			From: '',
			'Snapshot-Content-Location': '',
			Subject: '',
			'Content-Type': '',
		};
	}

	public getNext() {
		return (line: string) => {
			if (this.boundary === undefined) {
				// Header.
				return this.nextHeader(line);
			}
			// Skip next boundary.
			return this.skipBoundary(line);
		};
	}

	public nextHeader(line: string) {
		if (line.match(/^\s+/)) {
			/*if (line.match(/;\s*$/)) {
				console.log('test', line);
				this.prev += line.trim();
			} else {
				this.prev = `${this.prev}\n${line.trim()}`;
			}*/
			if (this.prev.match(/;$/)) {
				this.prev += line.trim();
			} else {
				this.prev += `\n${line.trim()}`;
			}
			return false;
		}

		if (this.prev) {
			const [key, ...value] = this.prev.split(':');
			this.headers[key.trim()] = value.join(':').trim();
			this.prev = '';
		}

		if (line) {
			this.prev = line;
			return false;
		}

		const contentTypeParams = (this.headers['Content-Type'] || '').split(/;\s*/);
		for (const params of contentTypeParams) {
			const [key, value] = params.split(/=/);
			if (key === 'boundary') {
				this.boundary = value.replace(/"/g, '');
			}
		}

		if (!this.boundary) {
			throw new Error('Invalid file format.');
		}
		this.boundary = '--' + this.boundary;

		return false;
	}

	public skipBoundary(line: string) {
		if (line === this.boundary) {
			return true;
		}
		return false;
	}
}

class MimePart {
	public headers: { [keys: string]: string } = {};
	public isLast = false;
	public lines: string[] = [];
	protected endHeader = false;
	public isEnd = false;
	protected skipContents = false;

	public getNext(boundary: string, filter: RegExp) {
		const lastBoundary = boundary + '--';
		return (line: string) => {
			if (this.endHeader) {
				return this.nextBody(line, boundary, lastBoundary);
			}
			return this.nextHeader(line, filter);
		};
	}

	public nextHeader(line: string, filter: RegExp) {
		if (!line) {
			this.endHeader = true;
			this.skipContents = !filter.test(this.headers['Content-Type']||'');
		} else {
			const [key, ...value] = line.split(':');
			this.headers[key] = value.join(':').trim();
		}
		return false;
	}

	public nextBody(line: string, boundary: string, lastBoundary: string) {
		if (line === boundary) {
			this.isEnd = true;
			return true;
		} else if (line === lastBoundary) {
			this.isEnd = true;
			this.isLast = true;
			return true;
		}
		if (!this.skipContents) {
			this.lines.push(line);
		}
		return false;
	}
}
