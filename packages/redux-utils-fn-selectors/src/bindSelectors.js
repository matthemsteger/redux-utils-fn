import {
	curry,
	compose,
	fromPairs,
	map,
	over,
	lensIndex,
	applyTo,
	toPairs
} from 'ramda';

export default curry((selectorsMap, state) =>
	compose(
		fromPairs,
		map(over(lensIndex(1), applyTo(state))),
		toPairs
	)(selectorsMap)
);
