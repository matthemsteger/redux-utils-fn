// @ts-nocheck
import {curry, find, propEq, filter, compose, curryN} from 'ramda';
import MixedTupleMap from 'mixedtuplemap';
import memoize from 'memoize-immutable';

const factoryFunction = curry((operation, prop, collection, searchValue) =>
	operation(propEq(prop, searchValue), collection)
);

function createMemoizedCollectionOperationFactory(operation) {
	const cache = new MixedTupleMap();
	return compose(
		curryN(3),
		(fn) => memoize(fn, {cache})
	)(factoryFunction(operation));
}

export const memoizedFindFactory = createMemoizedCollectionOperationFactory(
	find
);

export const memoizedFilterFactory = createMemoizedCollectionOperationFactory(
	filter
);
