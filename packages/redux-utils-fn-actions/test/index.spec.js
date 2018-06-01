import {describe, it} from 'mocha';
import {expect} from 'chai';
import * as actionUtils from './../src';

describe('index', () => {
	[
		'createPlainAction',
		'createActionCreator',
		'errorToAction',
		'actionIsErrored',
		'prefixAction'
	].forEach((fn) => {
		it(`should export a function ${fn}`, () => {
			expect(actionUtils[fn]).to.be.a('function');
		});
	});

	const type = 'BLAH_ACTION';
	const payload = {what: true};

	describe('createPlainAction', () => {
		it('should allow for a curried creation of a plain action', () => {
			const withPayload = actionUtils.createPlainAction(type);
			const action = withPayload(payload);

			expect(action).to.deep.equal({
				type,
				payload
			});
		});
	});

	describe('createActionCreator', () => {
		it('should return an action creator function', () => {
			const actionCreator = actionUtils.createActionCreator(type);
			expect(actionCreator).to.be.a('function');
		});

		describe('actionCreator', () => {
			[true, false, undefined, null].forEach((error) => {
				it(`it will create a flux standard action with error ${error}`, () => {
					const actionCreator = actionUtils.createActionCreator(type);
					const action = actionCreator(payload, error);

					expect(action).to.deep.equal({
						type,
						payload,
						error: !!error
					});
				});
			});
		});
	});

	describe('errorToAction', () => {
		it('should allow for curried error to action', () => {
			const actionCreator = actionUtils.createActionCreator(type);
			const errorMyAction = actionUtils.errorToAction(actionCreator);
			const error = new Error('Oh no!');
			const erroredAction = errorMyAction(error);

			expect(erroredAction).to.deep.equal({
				type,
				payload: error,
				error: true
			});
		});
	});

	describe('actionIsErrored', () => {
		[true, false, undefined].forEach((error) => {
			it(`should test whether FSA is errored when error is ${error}`, () => {
				const action = {type, payload, error};
				const isErrored = actionUtils.actionIsErrored(action);

				expect(isErrored).to.equal(!!error);
			});
		});
	});

	describe('prefixAction', () => {
		[['BLAH_', type], ['WHAT_', `WHAT_${type}`]].forEach(
			([prefix, expectedType]) => {
				it(`should ${
					expectedType === type ? 'not' : ''
				} modify type to add prefix ${prefix}`, () => {
					const doPrefix = actionUtils.prefixAction(prefix);
					const action = {type, payload, error: false};
					const result = doPrefix(action);

					expect(result).to.deep.equal({
						type: expectedType,
						payload,
						error: false
					});
				});
			}
		);
	});
});
