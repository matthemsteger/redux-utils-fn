import {
	ifElse,
	head,
	compose,
	slice,
	map,
	complement,
	any,
	anyPass,
	last,
	pipe,
	of as arrayOf,
	ap,
	apply,
	gt,
	length,
	unary
} from 'ramda';
import _memoize from 'memoize-immutable';
import {OBJ_STRING} from './constants';

const memoize = unary(_memoize);
const firstElementIsArray = compose(Array.isArray, head);
const funcsOrArray = (funcs) =>
	ifElse(firstElementIsArray, head, slice(0, -1))(funcs);
const isFunction = (value) =>
	Object.prototype.toString.call(value) === OBJ_STRING;

const anyNotFunctionOrLessThan2 = anyPass([
	any(complement(isFunction)),
	compose(gt(2), length)
]);

export default function createSelector(...funcs) {
	if (anyNotFunctionOrLessThan2(funcs)) {
		throw new Error(
			'input selectors must be functions and there must be more than 1'
		);
	}

	const inputSelectors = compose(
		map((fn) => (stateAndProps) => fn(...stateAndProps)),
		funcsOrArray
	)(funcs);

	const lastFunc = compose(memoize, last)(funcs);

	return function selector(state, props) {
		return pipe(arrayOf, ap(inputSelectors), apply(lastFunc))([
			state,
			props
		]);
	};
}
