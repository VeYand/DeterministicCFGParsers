import type {Config} from 'jest'

const config: Config = {
	preset: 'ts-jest',
	testEnvironment: 'node',
	roots: ['<rootDir>/src'],
	transform: {
		'^.+\\.ts$': 'ts-jest',
	},
	moduleFileExtensions: ['ts', 'js', 'json', 'node'],
	testMatch: ['**/__tests__/**/*.test.ts'],
	collectCoverage: true,
	coverageDirectory: '<rootDir>/src/__tests__/coverage',
}

export default config
