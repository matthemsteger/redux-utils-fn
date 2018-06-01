import {describe, it, afterEach} from 'mocha';
import {expect, use} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import proxyquire from 'proxyquire';
import _memoize from 'memoize-immutable';
import {
	times,
	objOf,
	merge,
	converge,
	modulo,
	__ as placeholder,
	compose,
	equals
} from 'ramda';

use(sinonChai);

const sandbox = sinon.createSandbox();
const factoryFunctionSpies = [];
const memoize = (fn, options) => {
	const factoryFunctionSpy = sandbox.spy(fn);
	factoryFunctionSpies.push(factoryFunctionSpy);
	return _memoize(factoryFunctionSpy, options);
};
const isOdd = compose(equals(1), modulo(placeholder, 2));

const memoizedFactoriesModule = proxyquire('./../src/memoizedFactories', {
	'memoize-immutable': memoize
});

const {memoizedFindFactory, memoizedFilterFactory} = memoizedFactoriesModule;
const [findFactoryFunctionSpy, filterFactoryFunctionSpy] = factoryFunctionSpies;

describe('src/memoizedFactories', () => {
	['memoizedFindFactory', 'memoizedFilterFactory'].forEach((fn) => {
		it(`should export a function ${fn}`, () => {
			expect(memoizedFactoriesModule[fn])
				.to.be.a('function')
				.with.lengthOf(3);
		});
	});

	afterEach(() => {
		sandbox.reset();
	});

	const collection = times(
		converge(merge, [objOf('id'), compose(objOf('odd'), isOdd)]),
		10
	);

	describe('memoizedFindFactory', () => {
		it('should find an item in a collection', () => {
			const result = memoizedFindFactory('id', collection, 1);
			expect(result).to.deep.equal({id: 1, odd: true});
		});

		it('should be curried', () => {
			const f1 = memoizedFindFactory('id');
			const f2 = f1(collection);
			const result = f2(1);

			expect(result).to.deep.equal({id: 1, odd: true});
		});

		it('should memoize the call with the same arguments', () => {
			const result1 = memoizedFindFactory('id', collection, 3);
			const result2 = memoizedFindFactory('id', collection, 3);

			expect(result1).to.deep.equal({id: 3, odd: true});
			expect(result1).to.equal(result2);
			expect(findFactoryFunctionSpy).to.have.been.calledOnce;
		});
	});

	describe('memoizedFilterFactory', () => {
		const expectedEvens = [
			{id: 0, odd: false},
			{id: 2, odd: false},
			{id: 4, odd: false},
			{id: 6, odd: false},
			{id: 8, odd: false}
		];

		const expectedOdds = [
			{id: 1, odd: true},
			{id: 3, odd: true},
			{id: 5, odd: true},
			{id: 7, odd: true},
			{id: 9, odd: true}
		];

		it('should filter items in a collection', () => {
			const results = memoizedFilterFactory('odd', collection, false);
			expect(results).to.have.deep.members(expectedEvens);
		});

		it('should be curried', () => {
			const f1 = memoizedFilterFactory('odd');
			const f2 = f1(collection);
			const results = f2(false);
			expect(results).to.have.deep.members(expectedEvens);
		});

		it('should memoize the call with the same arguments', () => {
			const results1 = memoizedFilterFactory('odd', collection, true);
			const results2 = memoizedFilterFactory('odd', collection, true);

			expect(results1).to.have.deep.members(expectedOdds);
			expect(results1).to.equal(results2);
			expect(filterFactoryFunctionSpy).to.have.been.calledOnce;
		});
	});
});
