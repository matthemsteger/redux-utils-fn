import {describe, it, afterEach} from 'mocha';
import {expect, use} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import * as reducerPredicates from './../src/reducerPredicates';

use(sinonChai);

describe('src/reducerPredicates', () => {
	[
		'reducerWithPredicate',
		'whenError',
		'whenNoError',
		'hasPayload',
		'composePredicates',
		'whenNoErrorAndHasPayload'
	].forEach((fn) => {
		it(`should export a function ${fn}`, () => {
			expect(reducerPredicates[fn]).to.be.a('function');
		});
	});

	const setupReducerTest = (test) => {
		const action = {};
		const state = {};

		return () => test(action, state);
	};

	describe('reducerWithPredicate', () => {
		it('should take a predicate and reducer and return a reducer function', () => {
			const pred = (action) => !!action;
			const reducer = (action, state) => state;

			const result = reducerPredicates.reducerWithPredicate(
				pred,
				reducer
			);
			expect(result)
				.to.be.a('function')
				.that.has.lengthOf(2);
		});

		it(
			'should run reducer when predicate passes',
			setupReducerTest((action, state) => {
				const pred = () => true;
				const reducer = sinon.stub().returnsArg(1);

				const result = reducerPredicates.reducerWithPredicate(
					pred,
					reducer,
					action,
					state
				);

				expect(result).to.equal(state);
				expect(reducer).to.have.been.called;
			})
		);

		it(
			'should not run reducer when predicate fails',
			setupReducerTest((action, state) => {
				const pred = () => false;
				const reducer = sinon.stub().returnsArg(1);

				const result = reducerPredicates.reducerWithPredicate(
					pred,
					reducer,
					action,
					state
				);

				expect(result).to.equal(state);
				expect(reducer).to.have.not.been.called;
			})
		);
	});

	const testStandardPredicateArity = (pred) => {
		it('should be a function with arity 2', () => {
			expect(pred).to.have.lengthOf(2);
		});
	};

	describe('whenError', () => {
		testStandardPredicateArity(reducerPredicates.whenError);

		[true, false, undefined].forEach((error) => {
			it(`should return ${!!error} when error is ${error}`, () => {
				const action = {error};
				const state = {};

				const result = reducerPredicates.whenError(action, state);
				expect(result).to.equal(!!error);
			});
		});
	});

	describe('whenNoError', () => {
		testStandardPredicateArity(reducerPredicates.whenNoError);

		[true, false, undefined].forEach((error) => {
			it(`should return ${!error} when error is ${error}`, () => {
				const action = {error};
				const state = {};

				const result = reducerPredicates.whenNoError(action, state);
				expect(result).to.equal(!error);
			});
		});
	});

	describe('hasPayload', () => {
		const payloadSelector = (payload) => payload && payload.blah;
		const state = {};

		it('should take a payloadSelector and return a predicate with arity 2', () => {
			const predicate = reducerPredicates.hasPayload(payloadSelector);
			expect(predicate).to.have.lengthOf(2);
		});

		it('should return true when it finds a truthy payload', () => {
			const action = {payload: {blah: 3}};

			const result = reducerPredicates.hasPayload(
				payloadSelector,
				action,
				state
			);
			expect(result).to.equal(true);
		});

		it('should return false when it doesnt find a payload', () => {
			const action = {payload: true};

			const result = reducerPredicates.hasPayload(
				payloadSelector,
				action,
				state
			);
			expect(result).to.equal(false);
		});
	});

	describe('composePredicates', () => {
		const action = {};
		const state = {};
		const pred1 = sinon.stub();
		const pred2 = sinon.stub();

		afterEach(() => {
			pred1.resetHistory();
			pred2.resetHistory();
		});

		it('should take an array of predicates and return a predicate', () => {
			const pred = reducerPredicates.composePredicates([pred1, pred2]);
			expect(pred).to.have.lengthOf(2);
		});

		[[false, false], [true, true], [true, false], [false, true]].forEach(
			([pred1Result, pred2Result]) => {
				it(`should return ${pred1Result &&
					pred2Result} with predicates that return ${pred1Result} and ${pred2Result}`, () => {
					pred1.returns(pred1Result);
					pred2.returns(pred2Result);
					const pred = reducerPredicates.composePredicates([
						pred1,
						pred2
					]);
					const result = pred(action, state);

					expect(result).to.equal(pred1Result && pred2Result);
					expect(pred1).to.have.been.calledOnce;
					expect(pred2).to.have.callCount(pred1Result ? 1 : 0);
				});
			}
		);
	});

	describe('whenNoErrorAndHasPayload', () => {
		const payloadSelector = (payload) => payload && payload.blah;
		const state = {};

		it('should take a payloadSelector and return a predicate with arity 2', () => {
			const predicate = reducerPredicates.whenNoErrorAndHasPayload(
				payloadSelector
			);
			expect(predicate).to.have.lengthOf(2);
		});

		it('should return false when there is an error', () => {
			const action = {error: true};
			const result = reducerPredicates.whenNoErrorAndHasPayload(
				payloadSelector
			)(action, state);
			expect(result).to.equal(false);
		});

		it('should return false when there is no payload and no error', () => {
			const action = {payload: true};
			const result = reducerPredicates.whenNoErrorAndHasPayload(
				payloadSelector
			)(action, state);
			expect(result).to.equal(false);
		});

		it('should return true if no error and a proper payload', () => {
			const action = {payload: {blah: 3}};
			const result = reducerPredicates.whenNoErrorAndHasPayload(
				payloadSelector
			)(action, state);
			expect(result).to.equal(true);
		});
	});
});
