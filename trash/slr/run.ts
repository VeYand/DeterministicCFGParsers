import {exec} from 'node:child_process'

const run = (input: string, output: string) => {
	exec(`python3 trash/slr/src/main.py ${input} ${output}`, (error, stdout, stderr) => {
		if (error) {
			console.error(error)
			console.error(`Неважно`)
		}
		if (stderr) {
			console.error(`Неважно2`)
		}
		console.log(stdout)
	})
}

export {
	run,
}