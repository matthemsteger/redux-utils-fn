import {curry, compose, prop, values} from 'ramda';
import createSelector from './createSelector';

export const createStandardAllSelector = curry(
	(localizedSelector, resourceName) =>
		createSelector(
			localizedSelector,
			compose(values, prop(`${resourceName}ById`))
		)
);

export const createStandardErrorSelector = curry(
	(localizedSelector, resourceName) =>
		createSelector(localizedSelector, prop(`${resourceName}Error`))
);
