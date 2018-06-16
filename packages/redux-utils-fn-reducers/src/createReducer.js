import {
	curry,
	unless,
	reduce,
	when,
	always,
	compose,
	cond,
	append,
	map,
	adjust,
	propEq,
	of as arrayOf,
	isNil,
	T,
	identity,
	is,
	equals
} from 'ramda';

/**
 * @template Payload
 * @typedef {import('./../types').FSA<Payload>} FSA
 */

/**
 * @typedef {import('./../types').ReduxAction} ReduxAction
 */

/**
 * @typedef {import('./../types').State} State
 */

/**
 * @template Payload
 * @typedef {import('./../types').PayloadReducer<Payload>} PayloadReducer
 */

/**
 * @template Payload
 * @type {R.CurriedFunction3<FSA<Payload>, State, PayloadReducer<Payload>, State>}
 */
const fnReducer = curry(
	/**
	 * @param {FSA<Payload>} action
	 * @param {State} state
	 * @param {PayloadReducer<Payload>} fn
	 * @returns {State}
	 */
	(action, state, fn) => fn(action)(state)
);

/**
 * @typedef {PayloadReducer<*> | PayloadReducer<*>[]} PayloadReducerOneOrMany
 */

/**
 * @type {R.CurriedFunction3<PayloadReducerOneOrMany, FSA<*>, State, State>}
 */
export const createPayloadReducer = curry(
	/**
	 * @param {PayloadReducerOneOrMany} fn
	 * @param {FSA<*>} action
	 * @param {State} state
	 * @returns {State}
	 */
	(fn, action, state) => {
		const fns = unless(Array.isArray, arrayOf)(fn);
		return reduce(fnReducer(action), state, fns);
	}
);

/**
 * @template Payload
 * @typedef {import('./../types').ReducerSpec<Payload>} ReducerSpec
 */

/**
 * Create a reducer
 * @type {R.CurriedFunction4<State, ReducerSpec<*>, State, ReduxAction, State>}
 */
export default curry(
	/**
	 * @param {State} initialState
	 * @param {ReducerSpec<*>} spec
	 * @param {State} [state]
	 * @param {ReduxAction} [action]
	 * @returns {State}
	 */
	(initialState, spec, state, action) => {
		const stateToPass = when(isNil, always(initialState))(state);
		const actionToPass = when(equals(undefined), always({}))(action);
		return compose(
			// @ts-ignore
			cond,
			append([T, always(identity)]),
			map(
				compose(
					// @ts-ignore
					adjust(unless(is(Function), propEq('type')), 0),
					adjust(createPayloadReducer, 1)
				)
			)
		)(spec)(actionToPass)(stateToPass);
	}
);
