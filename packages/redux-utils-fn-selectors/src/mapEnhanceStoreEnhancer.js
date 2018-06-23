// @ts-nocheck
import {has, prop, when, always} from 'ramda';
import {MAP_KEY} from './constants';

export default function createMapEnhanceStoreEnhancer() {
	return (next) => (reducer, initialState, enhancer) => {
		const enhancedInitialState = when(always(has(MAP_KEY, reducer)), () =>
			Object.defineProperty(initialState, MAP_KEY, {
				value: prop(MAP_KEY, reducer),
				enumerable: true
			})
		)(initialState);

		next(reducer, enhancedInitialState, enhancer);
	};
}
