import {describe, it} from 'mocha';
import {expect, use} from 'chai';
import sinonChai from 'sinon-chai';
import {path, assocPath} from 'ramda';
import * as standardSelectorCreators from './../src/standardSelectorCreators';

use(sinonChai);

const {
	createStandardAllSelector,
	createStandardErrorSelector
} = standardSelectorCreators;

describe('src/standardSelectorCreators', () => {
	['createStandardAllSelector', 'createStandardErrorSelector'].forEach(
		(fn) => {
			it(`should export a function ${fn}`, () => {
				expect(standardSelectorCreators[fn])
					.to.be.a('function')
					.with.lengthOf(2);
			});
		}
	);

	const state = {some: {place: {stuffById: {1: {id: 1}}}}};
	const localizedSelector = path(['some', 'place']);
	const resourceName = 'stuff';

	describe('createStandardAllSelector', () => {
		it('should use a localizedSelector to get the values of a map of resources', () => {
			const selector = createStandardAllSelector(
				localizedSelector,
				resourceName
			);

			const result = selector(state);
			expect(selector)
				.to.be.a('function')
				.with.lengthOf(2);
			expect(result).to.deep.equal([{id: 1}]);
		});
	});

	describe('createStandardErrorSelector', () => {
		[new Error('what'), undefined].forEach((error) => {
			it(`should create a selector to give the value of the error resource ${error}`, () => {
				const selector = createStandardErrorSelector(
					localizedSelector,
					resourceName
				);
				const erroredState = assocPath(
					['some', 'place', 'stuffError'],
					error
				)(state);

				const result = selector(erroredState);
				expect(selector)
					.to.be.a('function')
					.with.lengthOf(2);
				expect(result).to.equal(error);
			});
		});
	});
});
