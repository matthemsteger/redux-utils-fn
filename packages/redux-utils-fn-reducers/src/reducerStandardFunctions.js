import {
	curry,
	prop,
	identity,
	evolve,
	merge,
	// @ts-ignore
	__ as placeholder,
	objOf,
	compose,
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

/**
 * @template Payload
 * @typedef {import('./../types').FSA<Payload>} FSA
 */

/**
 * @typedef {import('./../types').State} State
 */

/**
 * @template Payload, Resource
 * @typedef {import('./../types').PayloadSelector<Payload, Resource>} PayloadSelector
 */

/**
 * @template Resource
 * @typedef {import('./../types').IdSelector<Resource>} IdSelector
 */

/**
 * @template Payload, Resource
 */
const selectPayload = curry(
	/**
	 * @param {import('./../types').PayloadSelector<Payload, Resource>} payloadSelector
	 * @param {FSA<Payload>} action
	 * @returns {Resource}
	 */
	(payloadSelector, action) =>
		compose(
			payloadSelector,
			/** @type {function(FSA<Payload>): Payload} */ (prop('payload'))
		)(action)
);

const binaryWhen = curry((pred, fn) =>
	cond([[pred, binary(fn)], [T, nthArg(1)]])
);

/**
 * @type {IdSelector<*>}
 */
const defaultIdSelector = prop('id');

/**
 * @template Payload, Resource
 */
export const addResourceToMap = curry(
	/**
	 * @param {import('./../types').AddResourceOptions<Payload, Resource>} options
	 * @param {FSA<Payload>} action
	 * @param {State} state
	 */
	(
		{
			mapKey,
			idSelector = defaultIdSelector,
			payloadSelector = /** @type {PayloadSelector<Payload, Resource>} */ (identity)
		},
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

/**
 * @template Payload, Resource
 */
export const addResourceToArray = curry(
	/**
	 * @param {import('./../types').AddResourceOptions<Payload, Resource>} options
	 * @param {FSA<Payload>} action
	 * @param {State} state
	 */
	(
		{
			mapKey,
			idSelector = defaultIdSelector,
			payloadSelector = /** @type {PayloadSelector<Payload, Resource>} */ (identity)
		},
		action,
		state
	) => {
		const id = compose(
			idSelector,
			selectPayload(payloadSelector)
		)(action);
		return evolve({
			[mapKey]: compose(
				uniq,
				append(id)
			)
		})(state);
	}
);

/**
 * @template ErrorPayload
 */
const setResourceError = curry(
	/**
	 * @param {string} resourceName
	 * @param {ErrorPayload | null} error
	 * @param {FSA<ErrorPayload>} action
	 * @param {State} state
	 */
	(resourceName, error, action, state) =>
		evolve({[`${resourceName}Error`]: always(error)})(state)
);

const makeErrorSerializable = pick([
	'message',
	'name',
	'stack',
	'code',
	'signal'
]);

/**
 * @template Payload, Resource
 */
export const handleStandardError = curry(
	/**
	 * @param {import('./../types').StandardErrorOptions<Payload, Resource>} options
	 * @param {FSA<Payload>} action
	 * @param {State} state
	 */
	(
		{
			resourceName,
			payloadSelector = /** @type {PayloadSelector<Payload, Resource>} */ (identity),
			clearOnSuccess = true
		},
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
					// @ts-ignore
					makeErrorSerializable(
						selectPayload(payloadSelector, action)
					)
				)
			)
		])(action, state)
);

const resourceNameById = /** @param {string} resourceName */ (resourceName) =>
	`${resourceName}ById`;

/**
 * @template Payload, Resource
 */
export const handleStandardAdd = curry(
	/**
	 * @param {import('./../types').StandardAddOptions<Payload, Resource>} options
	 * @param {FSA<Payload>} action
	 * @param {State} state
	 */
	(
		{
			resourceName,
			idSelector = defaultIdSelector,
			payloadSelector = /** @type {PayloadSelector<Payload, Resource>} */ (identity)
		},
		action,
		state
	) =>
		reducerWithPredicate(
			whenNoErrorAndHasPayload(payloadSelector),
			// @ts-ignore
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

const removeResource = curry(
	/**
	 * @param {string} resourceName
	 * @param {string} id
	 * @param {FSA<Payload>} action
	 * @param {State} state
	 */
	(resourceName, id, action, state) =>
		evolve({
			[resourceNameById(resourceName)]: omit([id]),
			[resourceName]: without([id])
		})(state)
);

/**
 * @template Payload, Resource
 */
export const handleStandardRemove = curry(
	/**
	 * @param {import('./../types').StandardRemoveOptions<Payload, Resource>} options
	 * @param {FSA<Payload>} action
	 * @param {State} state
	 */
	({resourceName, payloadSelector = prop('id')}, action, state) =>
		reducerWithPredicate(
			whenNoErrorAndHasPayload(payloadSelector),
			// @ts-ignore
			removeResource(
				resourceName,
				compose(
					// @ts-ignore
					payloadSelector,
					prop('payload')
				)(action)
			),
			action,
			state
		)
);

/**
 * @template Payload, Resource
 */
const whenNoErrorAndHasArrayPayload =
	/**
	 * @param {PayloadSelector<Payload, Resource>} payloadSelector
	 */
	(payloadSelector) =>
		// @ts-ignore
		composePredicates([
			whenNoErrorAndHasPayload(payloadSelector),
			// @ts-ignore
			(action) =>
				compose(
					Array.isArray,
					// @ts-ignore
					selectPayload(payloadSelector)
				)(action)
		]);

/**
 * @template Payload, Resource
 */
const addResources = curry(
	/**
	 * @param {import('./../types').IdSelector<Resource>} idSelector
	 * @param {string} resourceName
	 * @param {Resource[]} resources
	 * @param {FSA<Payload>} action
	 * @param {State} state
	 */
	(idSelector, resourceName, resources, action, state) =>
		evolve({
			[resourceNameById(resourceName)]: flip(merge)(
				indexBy(idSelector, resources)
			),
			[resourceName]: union(map(idSelector, resources))
		})(state)
);

export const handleStandardReceive = curry(
	/**
	 * @param {import('./../types').StandardAddOptions<Payload, Resource>} options
	 * @param {FSA<Payload>} action
	 * @param {State} state
	 */
	(
		{
			resourceName,
			idSelector = defaultIdSelector,
			payloadSelector = identity
		},
		action,
		state
	) =>
		reducerWithPredicate(
			whenNoErrorAndHasArrayPayload(payloadSelector),
			// @ts-ignore
			addResources(
				idSelector,
				resourceName,
				// @ts-ignore
				selectPayload(payloadSelector, action)
			),
			action,
			state
		)
);
