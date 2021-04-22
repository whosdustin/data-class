// https://github.com/sveltejs/svelte/blob/master/src/compiler/compile/utils/hash.ts
export default function hash(str: string): string {
	str = str.replace(/\r/g, '');
	let hash = 5381;
	let i = str.length;

	while (i--) hash = ((hash << 5) - hash) ^ str.charCodeAt(i);
	return (hash >>> 0).toString(36);
}