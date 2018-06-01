import {describe, it} from 'mocha';
import {expect, use} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import createMapEnhanceReducer from './../src/mapEnhanceReducer';
import {MAP_KEY} from './../src/constants';

use(sinonChai);

describe('src/mapEnhanceReducer', () => {
	it('should export a function as default', () => {
		expect(createMapEnhanceReducer)
			.to.be.a('function')
			.with.lengthOf(1);
	});

	describe('createMapEnhanceReducer', () => {
		const reducer1 = sinon.stub();
		const reducer2 = sinon.stub();
		const rootReducer = () => undefined;
		const reducerMap = {first: reducer1, second: reducer2};

		it('should accept a reducer map and return a mapEnhanceReducer function', () => {
			const mapEnhanceReducer = createMapEnhanceReducer(reducerMap);
			expect(mapEnhanceReducer)
				.to.be.a('function')
				.with.lengthOf(1);
		});

		describe('mapEnhanceReducer', () => {
			it('should define a property on the passed in reducer with the internal Map', () => {
				const mapEnhanceReducer = createMapEnhanceReducer(reducerMap);
				const enhancedRootReducer = mapEnhanceReducer(rootReducer);

				expect(enhancedRootReducer)
					.to.have.property(MAP_KEY)
					.that.is.a('map');
				const map = enhancedRootReducer[MAP_KEY];
				expect(map.get(reducer1)).to.deep.equal({path: 'first'});
				expect(map.get(reducer2)).to.deep.equal({path: 'second'});
			});
		});
	});
});
