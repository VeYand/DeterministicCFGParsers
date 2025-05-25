import {TOKEN_TYPES, TokenType} from './token'

/**
 * Токен, который видит LL(1)-парсер.
 */
type Token = {
	/** Имя токена, соответствует терминалам грамматики */
	type: string,
	/** Сырой текст токена */
	text: string,
}

/**
 * Разбирает входную строку в последовательность токенов.
 * Пропускает пробелы и комментарии; при BAD-лексеме бросает ошибку.
 * Всегда добавляет в конец маркер конца ввода {type:'$', text:''}.
 */
const tokenize = (input: string): Token[] => {
	const tokens: Token[] = []
	let pos = 0

	while (pos < input.length) {
		const rest = input.slice(pos)

		// На каждом шаге ищем самый длинный матч среди всех TOKEN_TYPES
		let bestMatch: {tt: TokenType, text: string} | null = null
		for (const tt of TOKEN_TYPES) {
			// Пропускаем «плохие» токены при поиске bestMatch
			if (tt.name === 'BAD' || tt.name.startsWith('BAD_')) {
				continue
			}

			const regex = new RegExp('^' + tt.regex)
			const m = regex.exec(rest)
			if (m && m.index === 0) {
				const text = m[0]
				if (!bestMatch || text.length > bestMatch.text.length) {
					bestMatch = {tt, text}
				}
			}
		}

		if (!bestMatch) {
			// Если без «плохишей» ничего не нашлось — пытаемся найти BAD, чтобы выбросить нужную ошибку
			let badMatch: {tt: TokenType, text: string} | null = null
			for (const tt of TOKEN_TYPES) {
				if (tt.name !== 'BAD' && !tt.name.startsWith('BAD_')) {
					continue
				}
				const regex = new RegExp('^' + tt.regex)
				const m = regex.exec(rest)
				if (m && m.index === 0) {
					badMatch = {tt, text: m[0]}
					break
				}
			}
			if (badMatch) {
				const {text} = badMatch
				throw new Error(`Lexical error at pos ${pos}: bad token ${JSON.stringify(text)}`)
			}
			else {
				throw new Error(`Lexical error at pos ${pos}: unexpected character "${input[pos]}"`)
			}
		}

		const {tt, text} = bestMatch
		pos += text.length

		// Пропускаем пробелы и комментарии
		if (tt.name === 'SPACE' || tt.name === 'LINE_COMMENT' || tt.name === 'BLOCK_COMMENT') {
			continue
		}

		// Плохие строки/комментарии
		if (tt.name === 'BAD' || tt.name.startsWith('BAD_')) {
			throw new Error(`Lexical error at pos ${pos - text.length}: bad token ${JSON.stringify(text)}`)
		}

		tokens.push({type: tt.name, text})
	}

	// Маркер конца ввода
	tokens.push({type: '$', text: ''})
	return tokens
}

export type {
	Token,
}

export {
	tokenize,
}