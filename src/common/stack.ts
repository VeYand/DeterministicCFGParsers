class Stack<T> {
	private storage: T[] = []

	constructor(
		private capacity: number = Infinity,
	) {
	}

	push(item: T): void {
		if (this.size() === this.capacity) {
			throw new Error('Stack has reached its maximum capacity')
		}
		this.storage.push(item)
	}

	pop(): T {
		const p = this.storage.pop()

		if (p === undefined) {
			throw new Error('Cannot pop on empty stack')
		}

		return p
	}

	peek(): T | undefined {
		return this.storage[this.size() - 1]
	}

	size(): number {
		return this.storage.length
	}
}

export {
	Stack,
}