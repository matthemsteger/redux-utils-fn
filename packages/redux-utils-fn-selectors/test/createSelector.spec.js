import {describe, it} from 'mocha';
import {expect, use} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import {prop} from 'ramda';
import createSelector from './../src/createSelector';

use(sinonChai);

describe('src/createSelector', () => {
	it('should export a function as default', () => {
		expect(createSelector).to.be.a('function');
	});

	describe('createSelector', () => {
		const state = {blah: 3, what: 2};
		const selectBlah = prop('blah');
		const selectWhat = prop('what');

		it('should throw when an input selector is not a function', () => {
			const test = () => createSelector({}, {});
			expect(test).to.throw();
		});

		it('should throw when no input selector', () => {
			const test = () => createSelector(() => undefined);
			expect(test).to.throw();
		});

		it('should return a selector that composes multiple selectors', () => {
			const resultFn = sinon.stub().returns(5);

			const selector = createSelector(selectBlah, selectWhat, resultFn);
			const result = selector(state);

			expect(result).to.equal(5);
			expect(resultFn).to.have.been.calledWithMatch(3, 2);
		});

		it('should memoize when values are the same to the result function', () => {
			const resultFn = sinon.stub().returns(5);

			const selector = createSelector(selectBlah, selectWhat, resultFn);
			const result = selector(state);
			const result2 = selector(state);

			expect(result).to.equal(result2);
			expect(resultFn).to.have.been.calledOnce;
		});

		it('should accept props optionally', () => {
			const propsSelector = (s, props) => prop('yeah', props);
			const resultFn = sinon.stub().returns(5);
			const props = {yeah: false};

			const selector = createSelector(
				selectBlah,
				selectWhat,
				propsSelector,
				resultFn
			);
			const result = selector(state, props);

			expect(result).to.equal(5);
			expect(resultFn).to.have.been.calledWithMatch(3, 2, false);
		});
	});
});
