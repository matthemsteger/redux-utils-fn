import {describe, it} from 'mocha';
import {expect, use} from 'chai';
import sinon from 'sinon';
import sinonChai from 'sinon-chai';
import bindSelectors from './../src/bindSelectors';

use(sinonChai);

describe('src/bindSelectors', () => {
	it('should export a function as default', () => {
		expect(bindSelectors)
			.to.be.a('function')
			.with.lengthOf(2);
	});

	describe('bindSelectors', () => {
		it('should bind a map of keys to selectors with state applied', () => {
			const state = {blah: 'what'};
			const selector1 = sinon.stub().returns(3);
			const selector2 = sinon.stub().returns(5);
			const selectorMap = {val1: selector1, val2: selector2};

			const result = bindSelectors(selectorMap, state);

			expect(result).to.deep.equal({
				val1: 3,
				val2: 5
			});

			[selector1, selector2].forEach((selector) =>
				expect(selector).to.have.been.calledWithExactly(state)
			);
		});
	});
});
