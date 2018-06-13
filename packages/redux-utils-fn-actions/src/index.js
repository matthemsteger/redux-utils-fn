import 'babel-polyfill';
import {curry, propEq, unless, invoker, compose, prop, evolve} from 'ramda';

/**
 * @template Payload
 * @typedef {object} FSA
 * @property {string} type
 * @property {Payload} [payload]
 * @property {boolean} [error]
 */

/**
 * @type {R.CurriedFunction2<string, string, boolean>}
 */
const startsWith = invoker(1, 'startsWith');

/**
 * @template Payload
 * @type {import('./../types').PlainActionCreator<Payload>}
 */
export const createPlainAction = curry((type, payload) => ({type, payload}));

/**
 * @template Payload
 * @typedef {import('./../types').ActionCreator<Payload>} ActionCreator
 */

/**
 * Create an action creator from a type
 * @template Payload
 * @param {string} type
 * @returns {ActionCreator<Payload>}
 */
export function createActionCreator(type) {
	return function actionCreator(payload, error) {
		return {
			type,
			payload,
			error: !!error
		};
	};
}

/**
 * Using an action creator, create an errored action
 * @type {import('./../types').ErrorToAction<Error>}
 */
export const errorToAction = curry(
	/**
	 * @param {ActionCreator<Error>} actionCreator
	 * @param {Error} error
	 * @returns {FSA<Error>}
	 */
	(actionCreator, error) => actionCreator(error, true)
);

/**
 * @type {function(FSA<*>): boolean}
 */
export const actionIsErrored = propEq('error', true);

/**
 * @type {R.CurriedFunction2<string, string, string>}
 */
const prefixType = curry((prefix, type) => `${prefix}${type}`);

/**
 * @template Payload
 * @type {function(FSA<Payload>): string}
 * @todo This type is extraneous, but makes typescript happy
 */
const getActionType = prop('type');

/**
 * Prefix an action type with a string
 * @template Payload
 * @type {R.CurriedFunction2<string, FSA<Payload>, FSA<Payload>>}
 */
export const prefixAction = curry((prefix, action) =>
	unless(
		compose(
			startsWith(prefix),
			getActionType
		),
		evolve({type: prefixType(prefix), payload: (x) => x, error: (x) => x}),
		action
	)
);
