import 'babel-polyfill';
import {curry, propEq, unless, invoker, compose, prop, evolve} from 'ramda';

/**
 * @type {R.CurriedFunction2<string, string, boolean>}
 */
const startsWith = invoker(1, 'startsWith');

/**
 * @template Payload
 * @typedef FSA
 * @property {string} type
 * @property {Payload} payload
 * @property {boolean} [error]
 */

export const createPlainAction = curry(
	/**
	 * @param {string} type
	 * @param {Payload} payload
	 * @returns {FSA}
	 */
	(type, payload) => ({type, payload})
);

/**
 * @typedef {function(Payload, boolean): FSA} ActionCreator
 */

/**
 * Create an action creator from a type
 * @param {string} type
 * @returns {ActionCreator}
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
 * @type {R.CurriedFunction2<ActionCreator, boolean, FSA>}
 */
export const errorToAction = curry(
	/**
	 * @param {ActionCreator} actionCreator
	 * @param {boolean} error
	 * @returns {FSA}
	 */
	(actionCreator, error) => actionCreator(error, true)
);

/**
 * @type {function(FSA): boolean}
 */
export const actionIsErrored = propEq('error', true);

/**
 * Prefix an action type with a string
 * @type {R.CurriedFunction2<string, FSA, FSA>}
 */
export const prefixAction = curry(
	/**
	 * @param {string} prefix
	 * @param {FSA} action
	 * @returns {FSA}
	 */
	(prefix, action) =>
		unless(
			compose(startsWith(prefix), prop('type')),
			evolve({type: (type) => `${prefix}${type}`}),
			action
		)
);
