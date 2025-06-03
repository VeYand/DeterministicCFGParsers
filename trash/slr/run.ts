import {exec} from 'node:child_process'

const run = (input: string, output: string) => {
	exec(`python3 trash/slr/src/main.py ${input} ${output}`, (error, _, stderr) => {
		if (error) {
			console.error(`Неважно`)
			return
		}
		if (stderr) {
			console.error(`Неважно2`)
		}
	})
}

export {
	run,
}