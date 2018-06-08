import {describe, it} from 'mocha';
import {expect, use} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import createMapEnhanceStoreEnhancer from './../src/mapEnhanceStoreEnhancer';
import {MAP_KEY} from './../src/constants';

use(sinonChai);

function testDoesntHaveMapKey(stateObj) {
	return !stateObj[MAP_KEY];
}

describe('src/mapEnhanceStoreEnhancer', () => {
	it('should export a store enhancer function as default', () => {
		expect(createMapEnhanceStoreEnhancer)
			.to.be.a('function')
			.with.lengthOf(0);
		const creator = createMapEnhanceStoreEnhancer();
		expect(creator)
			.to.be.a('function')
			.with.lengthOf(1);
		const next = sinon.stub();
		const enhancer = creator(next);
		expect(enhancer)
			.to.be.a('function')
			.with.lengthOf(3);
	});

	describe('mapEnhanceStoreEnhancer', () => {
		it(`it should set the ${MAP_KEY} property with map on the initialState object`, () => {
			const next = sinon.stub();
			const reducer = () => undefined;
			const reducerMap = new Map();
			Object.defineProperty(reducer, MAP_KEY, {value: reducerMap});
			const initialState = {something: 3};
			const otherEnhancer = sinon.stub();

			const enhancer = createMapEnhanceStoreEnhancer()(next);
			enhancer(reducer, initialState, otherEnhancer);

			expect(next).to.have.been.calledWithMatch(
				sinon.match.same(reducer),
				{[MAP_KEY]: sinon.match.map, something: 3},
				sinon.match.same(otherEnhancer)
			);
		});

		it(`should not add ${MAP_KEY} if reducer doesnt have map`, () => {
			const next = sinon.stub();
			const reducer = () => undefined;
			const initialState = {something: 3};
			const otherEnhancer = sinon.stub();

			const enhancer = createMapEnhanceStoreEnhancer()(next);
			enhancer(reducer, initialState, otherEnhancer);

			expect(next).to.have.been.calledWithMatch(
				sinon.match.same(reducer),
				sinon.match(testDoesntHaveMapKey, `No prop ${MAP_KEY}`),
				sinon.match.same(otherEnhancer)
			);
		});
	});
});
