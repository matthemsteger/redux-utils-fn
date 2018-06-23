import {
	curry,
	curryN,
	equals,
	prop,
	compose,
	allPass,
	binary,
	complement,
	isNil,
	cond,
	T,
	nthArg
} from 'ramda';

/**
 * @template Payload
 * @typedef {import('./../types').ReducerPredicate<Payload>} ReducerPredicate
 */

/**
 * @typedef {import('./../types').ReduxReducer} Reducer
 */

/**
 * @template Payload
 * @typedef {import('./../types').FSA<Payload>} FSA
 */

/**
 * @typedef {import('./../types').State} State
 */

/**
 * @type {R.CurriedFunction4<ReducerPredicate<*>, Reducer, FSA<*>, State, Reducer>}
 */
export const reducerWithPredicate = curry(
	/**
	 * @param {ReducerPredicate<*>} pred
	 * @param {Reducer} reducer
	 * @param {FSA<*>} action
	 * @param {State} state
	 * @returns {Reducer}
	 */
	(pred, reducer, action, state) =>
		cond([[pred, reducer], [T, nthArg(1)]])(action, state)
);

const actionError = prop('error');

/**
 * @template Payload
 * @type {import('./../types').ReducerPredicate<Payload>}
 */
export const whenError = curryN(
	2,
	compose(
		equals(true),
		binary(actionError)
	)
);

/**
 * @template Payload
 * @type {import('./../types').ReducerPredicate<Payload>}
 */
export const whenNoError = curryN(2, complement(whenError));

/**
 * @template Payload
 */
export const hasPayload = curry(
	/**
	 * @param {import('./../types').PayloadSelector<Payload>} payloadSelector
	 * @param {FSA<Payload>} action
	 * @param {State} state
	 * @returns {boolean}
	 */
	(
		payloadSelector,
		action,
		state // eslint-disable-line no-unused-vars
	) =>
		compose(
			complement(isNil),
			payloadSelector,
			/** @type {function(FSA<Payload>): Payload} */ (prop('payload'))
		)(action)
);

/**
 * @template Payload
 */
export const composePredicates = curry(
	/**
	 * @param {import('./../types').ReducerPredicate<Payload>[]} predicates
	 * @param {FSA<Payload>} action
	 * @param {State} state
	 * @returns {boolean}
	 */
	(predicates, action, state) => allPass(predicates)(action, state)
);

/**
 * @template Payload
 */
export const whenNoErrorAndHasPayload = curry(
	/**
	 * @param {import('./../types').PayloadSelector<Payload>} payloadSelector
	 * @param {FSA<Payload>} action
	 * @param {State} state
	 * @returns {boolean}
	 */
	(payloadSelector, action, state) =>
		composePredicates([whenNoError, hasPayload(payloadSelector)])(
			action,
			state
		)
);
