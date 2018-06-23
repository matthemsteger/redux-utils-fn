import {
	curry,
	flip,
	objOf,
	compose,
	reduce,
	map,
	merge,
	append,
	toUpper,
	flatten
} from 'ramda';

const addKey = curry((obj, key) =>
	compose(
		flip(merge)(obj),
		objOf(key)
	)(key)
);

/**
 * Create a constant map from strings or arrays of strings
 * @param {...(string|string[])} constants
 * @returns {Object.<string, string>}
 */
export function createConstantMap(...constants) {
	return compose(
		reduce(addKey, {}),
		flatten
	)(constants);
}

/**
 * @type {R.CurriedFunction2<string[], string, string[]>}
 */
const addConstantSuffixes = curry((suffixes, constant) =>
	map((suffix) => `${constant}_${suffix}`, suffixes)
);

/**
 * @type {R.CurriedFunction2<string[], string, string[]>}
 */
const addConstantPrefixes = curry((prefixes, constant) =>
	map((prefix) => `${prefix}_${constant}`, prefixes)
);

/**
 * Create lifecycle constants from a constant
 * This creates _PENDING, _DONE and _PROGRESS
 * @todo extra append notation for typescript
 * @see https://github.com/Microsoft/TypeScript/issues/15680
 * @param {string} constant
 * @returns {string[]} constants
 */
export function createLifecycleConstants(constant) {
	/** @type {function(string[]): string[]} */
	const appendConstant = append(constant);

	return compose(
		map(toUpper),
		appendConstant,
		addConstantSuffixes(['PENDING', 'DONE', 'PROGRESS'])
	)(constant);
}

/**
 * Create crud constants for a resource name
 * This creates CREATE_, READ_, DELETE_, UPDATE_, LIST_
 * @param {string} resource
 * @returns {string[]} constants
 */
export function crudConstants(resource) {
	return compose(
		map(toUpper),
		addConstantPrefixes(['CREATE', 'READ', 'DELETE', 'UPDATE', 'LIST'])
	)(resource);
}
