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

const fnReducer = curry((action, state, fn) => fn(action)(state));
export const createPayloadReducer = curry((fn, action, state) => {
	const fns = unless(Array.isArray, arrayOf)(fn);
	return reduce(fnReducer(action), state, fns);
});

export default curry((initialState, spec, state, action) => {
	const stateToPass = when(isNil, always(initialState))(state);
	const actionToPass = when(equals(undefined), always({}))(action);
	return compose(
		cond,
		append([T, always(identity)]),
		map(
			compose(
				adjust(unless(is(Function), propEq('type')), 0),
				adjust(createPayloadReducer, 1)
			)
		)
	)(spec)(actionToPass)(stateToPass);
});
