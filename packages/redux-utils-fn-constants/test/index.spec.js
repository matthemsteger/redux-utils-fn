import {describe, it} from 'mocha';
import {expect} from 'chai';
import * as constantUtils from './../src';

describe('index', () => {
	['createConstantMap', 'createLifecycleConstants', 'crudConstants'].forEach(
		(fn) => {
			it(`should export a function ${fn}`, () => {
				expect(constantUtils[fn]).to.be.a('function');
			});
		}
	);

	describe('createConstantMap', () => {
		it('should create map based on mixed arrays and values', () => {
			const params = ['BARE', ['NESTED1', 'NESTED2'], 'BARE2'];
			const result = constantUtils.createConstantMap(...params);

			expect(result).to.deep.equal({
				BARE: 'BARE',
				NESTED1: 'NESTED1',
				NESTED2: 'NESTED2',
				BARE2: 'BARE2'
			});
		});
	});

	describe('createLifecycleConstants', () => {
		it('should take a constant and return lifecycles and itself', () => {
			const constant = 'BLAH';
			const result = constantUtils.createLifecycleConstants(constant);

			expect(result).to.have.members([
				`${constant}_PENDING`,
				`${constant}_DONE`,
				`${constant}_PROGRESS`,
				constant
			]);
		});
	});

	describe('crudConstants', () => {
		it('should take a resource and return crud constants', () => {
			const resource = 'blah';
			const result = constantUtils.crudConstants(resource);

			expect(result).to.have.members([
				'CREATE_BLAH',
				'READ_BLAH',
				'UPDATE_BLAH',
				'DELETE_BLAH',
				'LIST_BLAH'
			]);
		});
	});
});
