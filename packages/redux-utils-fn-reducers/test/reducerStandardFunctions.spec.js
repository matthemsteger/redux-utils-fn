import {describe, it} from 'mocha';
import {expect, use} from 'chai';
import sinonChai from 'sinon-chai';
import {prop, identity} from 'ramda';
import * as reducerStandardFns from './../src/reducerStandardFunctions';

use(sinonChai);

describe('src/reducerStandardFunctions', () => {
	[
		'addResourceToMap',
		'addResourceToArray',
		'handleStandardError',
		'handleStandardAdd',
		'handleStandardRemove',
		'handleStandardReceive'
	].forEach((fn) => {
		it(`should export a function ${fn}`, () => {
			expect(reducerStandardFns[fn]).to.be.a('function');
		});
	});

	describe('addResourceToMap', () => {
		const mapKey = 'test';
		const action = {payload: {id: 1, blah: 'resourceInfo'}};
		const state = {[mapKey]: {3: {id: 3, blah: 'existing'}}};

		it('after taking options object, should return payload reducer with arity 2', () => {
			const payloadReducer = reducerStandardFns.addResourceToMap({
				mapKey
			});
			expect(payloadReducer)
				.to.be.a('function')
				.with.lengthOf(2);
		});

		it('should add a resource to a map with defaults', () => {
			const payloadReducer = reducerStandardFns.addResourceToMap({
				mapKey
			});
			const result = payloadReducer(action, state);

			expect(result).to.deep.equal({
				test: {
					1: {id: 1, blah: 'resourceInfo'},
					3: {id: 3, blah: 'existing'}
				}
			});
		});

		it('should add a resource with custom payload and id selectors', () => {
			const payloadSelector = prop('nested');
			const idSelector = prop('alternateId');
			const customAction = {
				payload: {nested: {alternateId: 1, blah: 'a'}}
			};
			const customState = {test: {}};
			const payloadReducer = reducerStandardFns.addResourceToMap({
				mapKey,
				payloadSelector,
				idSelector
			});

			const result = payloadReducer(customAction, customState);

			expect(result).to.deep.equal({
				test: {
					1: {alternateId: 1, blah: 'a'}
				}
			});
		});
	});

	describe('addResourceToArray', () => {
		const mapKey = 'test';

		it('after taking options object, should return payload reducer with arity 2', () => {
			const payloadReducer = reducerStandardFns.addResourceToArray({
				mapKey
			});

			expect(payloadReducer)
				.to.be.a('function')
				.with.lengthOf(2);
		});

		it('should add a resource to an array uniquely with defaults', () => {
			const action = {payload: {id: 3}};
			const state = {test: [3, 4]};
			const payloadReducer = reducerStandardFns.addResourceToArray({
				mapKey
			});

			const result = payloadReducer(action, state);
			expect(result).to.deep.equal({
				test: [3, 4]
			});
		});

		it('should add a resource with custom payload and id selectors', () => {
			const payloadSelector = prop('nested');
			const idSelector = prop('alternateId');
			const action = {payload: {nested: {alternateId: 3}}};
			const state = {test: [1, 2]};
			const payloadReducer = reducerStandardFns.addResourceToArray({
				mapKey,
				payloadSelector,
				idSelector
			});

			const result = payloadReducer(action, state);
			expect(result).to.deep.equal({
				test: [1, 2, 3]
			});
		});
	});

	describe('handleStandardError', () => {
		const resourceName = 'test';
		const errorToAdd = new Error('added');
		[true, false, undefined].forEach((clearOnSuccess) => {
			[undefined, prop('nested')].forEach((payloadSelector) => {
				[true, false, undefined].forEach((error) => {
					[new Error('existing'), undefined].forEach(
						(existingError) => {
							it(`should${
								clearOnSuccess ? '' : 'not'
							} clear existing error that ${
								existingError ? '' : 'does not'
							} exist with a ${
								payloadSelector ? 'custom' : 'default'
							} payloadSelector given an error of ${error}`, () => {
								const payload = payloadSelector
									? {nested: errorToAdd}
									: errorToAdd;
								const action = {error, payload};
								const state = {
									[`${resourceName}Error`]: existingError
								};
								const payloadReducer = reducerStandardFns.handleStandardError(
									{
										resourceName,
										payloadSelector,
										clearOnSuccess
									}
								);

								const result = payloadReducer(action, state);
								expect(result).to.have.property(
									`${resourceName}Error`
								);
								if (clearOnSuccess && existingError && !error) {
									expect(result).to.have.property(
										`${resourceName}Error`
									).that.is.null;
								}
							});
						}
					);
				});
			});
		});
	});

	describe('handleStandardAdd', () => {
		const resourceName = 'things';
		const initialState = {thingsById: {}, things: []};

		it('should return a payload reducer of arity 2 after options', () => {
			const payloadReducer = reducerStandardFns.handleStandardAdd({
				resourceName
			});

			expect(payloadReducer)
				.to.be.a('function')
				.with.lengthOf(2);
		});

		it('should not do anything if there is an error', () => {
			const action = {error: true};
			const state = initialState;
			const payloadReducer = reducerStandardFns.handleStandardAdd({
				resourceName
			});

			const result = payloadReducer(action, state);
			expect(result).to.equal(state);
		});

		it('should not do anything if there is no payload', () => {
			const action = {};
			const state = initialState;
			const payloadReducer = reducerStandardFns.handleStandardAdd({
				resourceName
			});

			const result = payloadReducer(action, state);
			expect(result).to.equal(state);
		});

		it('should add a resource with default options', () => {
			const action = {payload: {id: 3, blah: 3}};
			const state = initialState;
			const payloadReducer = reducerStandardFns.handleStandardAdd({
				resourceName
			});

			const result = payloadReducer(action, state);
			expect(result).to.deep.equal({
				thingsById: {3: {id: 3, blah: 3}},
				things: [3]
			});
		});

		it('should add a resource with custom idSelector and payloadSelector', () => {
			const action = {payload: {nested: {a: 3, blah: 3}}};
			const state = initialState;
			const idSelector = prop('a');
			const payloadSelector = prop('nested');
			const payloadReducer = reducerStandardFns.handleStandardAdd({
				resourceName,
				idSelector,
				payloadSelector
			});

			const result = payloadReducer(action, state);
			expect(result).to.deep.equal({
				thingsById: {3: {a: 3, blah: 3}},
				things: [3]
			});
		});
	});

	describe('handleStandardRemove', () => {
		const resourceName = 'things';
		const initialState = {thingsById: {1: {id: 1}}, things: [1]};

		it('should return a payload reducer of arity 2 after options', () => {
			const payloadReducer = reducerStandardFns.handleStandardRemove({
				resourceName
			});

			expect(payloadReducer)
				.to.be.a('function')
				.with.lengthOf(2);
		});

		it('should not do anything if there is an error', () => {
			const action = {error: true};
			const state = initialState;
			const payloadReducer = reducerStandardFns.handleStandardRemove({
				resourceName
			});

			const result = payloadReducer(action, state);
			expect(result).to.equal(state);
		});

		it('should not do anything if there is no payload', () => {
			const action = {};
			const state = initialState;
			const payloadReducer = reducerStandardFns.handleStandardRemove({
				resourceName
			});

			const result = payloadReducer(action, state);
			expect(result).to.equal(state);
		});

		it('should remove a resource with default options', () => {
			const action = {payload: {id: 1}};
			const state = initialState;
			const payloadReducer = reducerStandardFns.handleStandardRemove({
				resourceName
			});

			const result = payloadReducer(action, state);
			expect(result).to.deep.equal({thingsById: {}, things: []});
		});

		it('should remove a resource with custom payloadSelector', () => {
			const action = {payload: 1};
			const state = initialState;
			const payloadSelector = identity;
			const payloadReducer = reducerStandardFns.handleStandardRemove({
				resourceName,
				payloadSelector
			});

			const result = payloadReducer(action, state);
			expect(result).to.deep.equal({thingsById: {}, things: []});
		});
	});

	describe('handleStandardReceive', () => {
		const resourceName = 'things';
		const initialState = {thingsById: {}, things: []};

		it('should return a payload reducer of arity 2 after options', () => {
			const payloadReducer = reducerStandardFns.handleStandardReceive({
				resourceName
			});

			expect(payloadReducer)
				.to.be.a('function')
				.with.lengthOf(2);
		});

		it('should not do anything if there is an error', () => {
			const action = {error: true};
			const state = initialState;
			const payloadReducer = reducerStandardFns.handleStandardReceive({
				resourceName
			});

			const result = payloadReducer(action, state);
			expect(result).to.equal(state);
		});

		it('should not do anything if there is no array payload', () => {
			const action = {payload: {}};
			const state = initialState;
			const payloadReducer = reducerStandardFns.handleStandardReceive({
				resourceName
			});

			const result = payloadReducer(action, state);
			expect(result).to.equal(state);
		});

		it('should receive resources with default options', () => {
			const action = {payload: [{id: 2}, {id: 3}]};
			const state = initialState;
			const payloadReducer = reducerStandardFns.handleStandardReceive({
				resourceName
			});

			const result = payloadReducer(action, state);
			expect(result).to.deep.equal({
				thingsById: {2: {id: 2}, 3: {id: 3}},
				things: [2, 3]
			});
		});

		it('should receive resources with custom idSelector and payloadSelector', () => {
			const action = {payload: {nested: [{a: 2}, {a: 3}]}};
			const state = initialState;
			const idSelector = prop('a');
			const payloadSelector = prop('nested');
			const payloadReducer = reducerStandardFns.handleStandardReceive({
				resourceName,
				idSelector,
				payloadSelector
			});

			const result = payloadReducer(action, state);
			expect(result).to.deep.equal({
				thingsById: {2: {a: 2}, 3: {a: 3}},
				things: [2, 3]
			});
		});
	});
});
