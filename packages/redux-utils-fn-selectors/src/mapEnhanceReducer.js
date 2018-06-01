import {forEachObjIndexed} from 'ramda';
import {MAP_KEY} from './constants';

export default function createMapEnhanceReducer(reducerMap) {
	const reducerToModelMap = new Map();
	forEachObjIndexed(
		(reducer, key) => reducerToModelMap.set(reducer, {path: key}),
		reducerMap
	);

	return function mapEnhanceReducer(reducer) {
		return Object.defineProperty(reducer, MAP_KEY, {
			value: reducerToModelMap
		});
	};
}
