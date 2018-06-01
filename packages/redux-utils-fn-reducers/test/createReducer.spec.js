import {describe, it, afterEach} from 'mocha';
import {expect, use} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import createReducer, {createPayloadReducer} from './../src/createReducer';

use(sinonChai);

describe('src/createReducer', () => {
	it('should export a function as default', () => {
		expect(createReducer).to.be.a('function');
	});

	it('should export a function createPayloadReducer', () => {
		expect(createPayloadReducer).to.be.a('function');
	});

	describe('createReducer', () => {
		const initialState = {};
		const case1Result = {};
		const case2Result = {};
		const case1Handler = sinon.stub().returns(() => case1Result);
		const case2Handler = sinon.stub().returns(() => case2Result);
		const case1 = ['TYPE1', case1Handler];
		const case2 = ['TYPE2', case2Handler];
		const spec = [case1, case2];

		afterEach(() => {
			case1Handler.resetHistory();
			case2Handler.resetHistory();
		});

		it('will create a reducer with arity 2', () => {
			const reducer = createReducer(initialState, spec);
			expect(reducer).to.have.lengthOf(2);
		});

		it('should return exactly state when no types match', () => {
			const state = {};
			const action = {type: 'OTHER1'};
			const reducer = createReducer(initialState, spec);

			const result = reducer(state, action);

			expect(result).to.equal(state);
		});

		spec.forEach(([type, handler]) => {
			it(`should run the proper handler given a distinct type ${type}`, () => {
				const state = {};
				const action = {type};
				const reducer = createReducer(initialState, spec);

				const result = reducer(state, action);
				expect(result).to.not.equal(state);
				expect(handler).to.have.been.calledOnce;
				spec
					.filter(([, specHandler]) => specHandler !== handler)
					.forEach(
						([, specHandler]) =>
							expect(specHandler).to.not.have.been.called
					);
			});
		});

		[null, undefined].forEach((state) => {
			it(`should return initialState when state is ${state}`, () => {
				const action = {type: 'WHATEVER'};
				const reducer = createReducer(initialState, spec);

				const result = reducer(state, action);
				expect(result).to.equal(initialState);
				spec.map(([, handler]) => handler).forEach((handler) => {
					expect(handler).to.not.have.been.called;
				});
			});
		});
	});

	describe('createPayloadReducer', () => {
		it('can take a payload reducer function and return a payload reducer', () => {
			const fn = sinon.stub();
			const result = createPayloadReducer(fn);

			expect(result)
				.to.be.a('function')
				.with.lengthOf(2);
		});

		it('can take an array of payload reducers and return a payload reducer', () => {
			const fns = [sinon.stub(), sinon.stub()];
			const result = createPayloadReducer(fns);

			expect(result)
				.to.be.a('function')
				.with.lengthOf(2);
		});

		it('should run the single payload reducer and return the result', () => {
			const fnResult = {};
			const fn = sinon.stub().returns(() => fnResult);
			const action = {};
			const state = {};
			const result = createPayloadReducer(fn, action, state);

			expect(result).to.equal(fnResult);
			expect(fn).to.have.been.calledOnce;
		});

		it('should aggregate payload reducers and return the result', () => {
			const fn1Result = {};
			const fn2Result = {};
			const fn1 = sinon.stub().returns(() => fn1Result);
			const fn2 = sinon.stub().returns(() => fn2Result);
			const action = {};
			const state = {};
			const result = createPayloadReducer([fn1, fn2], action, state);

			expect(result).to.equal(fn2Result);
			expect(fn1).to.have.been.calledOnce;
			expect(fn2).to.have.been.calledOnce;
		});
	});
});
