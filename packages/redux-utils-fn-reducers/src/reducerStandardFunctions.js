import {
	curry,
	prop,
	identity,
	evolve,
	merge,
	__ as placeholder,
	objOf,
	compose,
	when,
	always,
	pick,
	uniq,
	append,
	omit,
	without,
	flip,
	map,
	indexBy,
	union,
	cond,
	T,
	nthArg,
	binary
} from 'ramda';
import {
	whenError,
	whenNoError,
	reducerWithPredicate,
	composePredicates,
	whenNoErrorAndHasPayload
} from './reducerPredicates';
import {createPayloadReducer} from './createReducer';

const selectPayload = curry((payloadSelector, action) =>
	compose(payloadSelector, prop('payload'))(action)
);

const binaryWhen = curry((pred, fn) =>
	cond([[pred, binary(fn)], [T, nthArg(1)]])
);

export const addResourceToMap = curry(
	(
		{mapKey, idSelector = prop('id'), payloadSelector = identity},
		action,
		state
	) => {
		const resource = selectPayload(payloadSelector, action);
		const id = idSelector(resource);
		return evolve({
			[mapKey]: merge(placeholder, objOf(id, resource))
		})(state);
	}
);

export const addResourceToArray = curry(
	(
		{mapKey, idSelector = prop('id'), payloadSelector = identity},
		action,
		state
	) => {
		const id = compose(idSelector, selectPayload(payloadSelector))(action);
		return evolve({
			[mapKey]: compose(uniq, append(id))
		})(state);
	}
);

const setResourceError = curry((resourceName, error, action, state) =>
	evolve({[`${resourceName}Error`]: always(error)})(state)
);

const makeErrorSerializable = pick([
	'message',
	'name',
	'stack',
	'code',
	'signal'
]);

export const handleStandardError = curry(
	(
		{resourceName, payloadSelector = identity, clearOnSuccess = true},
		action,
		state
	) =>
		createPayloadReducer([
			reducerWithPredicate(
				whenNoError,
				binaryWhen(
					always(clearOnSuccess),
					setResourceError(resourceName, null)
				)
			),
			reducerWithPredicate(
				whenError,
				setResourceError(
					resourceName,
					makeErrorSerializable(
						selectPayload(payloadSelector, action)
					)
				)
			)
		])(action, state)
);

const resourceNameById = (resourceName) => `${resourceName}ById`;

export const handleStandardAdd = curry(
	(
		{resourceName, idSelector = prop('id'), payloadSelector = identity},
		action,
		state
	) =>
		reducerWithPredicate(
			whenNoErrorAndHasPayload(payloadSelector),
			createPayloadReducer([
				addResourceToMap({
					mapKey: resourceNameById(resourceName),
					idSelector,
					payloadSelector
				}),
				addResourceToArray({
					mapKey: resourceName,
					idSelector,
					payloadSelector
				})
			]),
			action,
			state
		)
);

const removeResource = curry((resourceName, id, action, state) =>
	evolve({
		[resourceNameById(resourceName)]: omit([id]),
		[resourceName]: without([id])
	})(state)
);

export const handleStandardRemove = curry(
	({resourceName, payloadSelector = prop('id')}, action, state) =>
		reducerWithPredicate(
			whenNoErrorAndHasPayload(payloadSelector),
			removeResource(
				resourceName,
				compose(payloadSelector, prop('payload'))(action)
			),
			action,
			state
		)
);

const whenNoErrorAndHasArrayPayload = (payloadSelector) =>
	composePredicates([
		whenNoErrorAndHasPayload(payloadSelector),
		(action) =>
			compose(Array.isArray, selectPayload(payloadSelector))(action)
	]);

const addResources = curry(
	(idSelector, resourceName, resources, action, state) =>
		evolve({
			[resourceNameById(resourceName)]: flip(merge)(
				indexBy(idSelector, resources)
			),
			[resourceName]: union(map(idSelector, resources))
		})(state)
);

export const handleStandardReceive = curry(
	(
		{resourceName, idSelector = prop('id'), payloadSelector = identity},
		action,
		state
	) =>
		reducerWithPredicate(
			whenNoErrorAndHasArrayPayload(payloadSelector),
			addResources(
				idSelector,
				resourceName,
				selectPayload(payloadSelector, action)
			),
			action,
			state
		)
);
