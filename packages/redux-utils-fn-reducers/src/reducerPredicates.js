import {
	curry,
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

export const reducerWithPredicate = curry((pred, reducer, action, state) =>
	cond([[pred, reducer], [T, nthArg(1)]])(action, state)
);

const actionError = prop('error');

export const whenError = compose(equals(true), binary(actionError));
export const whenNoError = complement(whenError);
export const hasPayload = curry((payloadSelector, action, state) =>
	compose(complement(isNil), payloadSelector, prop('payload'))(action, state)
);

export const composePredicates = curry((predicates, action, state) =>
	allPass(predicates)(action, state)
);

export const whenNoErrorAndHasPayload = curry(
	(payloadSelector, action, state) =>
		composePredicates([whenNoError, hasPayload(payloadSelector)])(
			action,
			state
		)
);
