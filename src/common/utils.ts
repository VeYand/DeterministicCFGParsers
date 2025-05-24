const intersection = (a: Set<string>, b: Set<string>): Set<string> => new Set([...a].filter(x => b.has(x)))

export {
	intersection,
}