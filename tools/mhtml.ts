import { dirname, fromFileUrl, join } from '$std/path/mod.ts';
import { MimeParser } from '../libs/multipart_reader.ts';
import { readLines } from '$std/io/mod.ts';
import { QuotedPrintable } from '../libs/quoted_printable.ts';

async function readMhtml(filename: string) {
	const file = await Deno.open(filename);
	return readLines(file);
}

const dir = dirname(fromFileUrl(import.meta.url));

const fileName = join(dir, 'sample.mhtml');
console.log(fileName);
try {
	const stream = await readMhtml(fileName);

	const mimeParser = new MimeParser().setMimeTypeFilter('text/html');
	for await (const line of stream) {
		mimeParser.next(line);
	}
	console.log(mimeParser.headers);
	console.log(mimeParser.boundary);
	console.log(mimeParser.mimeParts.length);
	console.log(await new QuotedPrintable().decodeToUtf8(mimeParser.headers.Subject));
	for (const mimePart of mimeParser.mimeParts) {
		console.log(mimePart.headers);
		if (mimePart.headers['Content-Type'] !== 'text/html') {
			continue;
		}
		const html = await new QuotedPrintable().decodeToUtf8(mimePart.lines.join('\n'));
		Deno.writeTextFile(join(dir, 'export.html'), html);
		Deno.writeTextFile(
			join(dir, 'export.txt'),
			html.replace(/>/g, '>\n').replace(/</g, '\n<').split('\n').map((line) => {
				if (line.match(/^</)) {
					return '';
				}
				return line.replace(/\s+$/, '');
			}).filter((line) => {
				return !!line;
			}).join('\n'),
		);
	}
} catch (error) {
	console.error(error);
}
