export = ReduxUtilsFnSelectors;

/**
 * @todo these are not functional currently
 */

declare namespace ReduxUtilsFnSelectors {
	export type State = object;
	export type Selector = (state: State, props: object) => any;
	export type Reducer = (state: State, action: any) => State;
	export type MapEnhanceReducer = (reducer: Reducer) => Reducer;

	let bindSelectors: R.CurriedFunction2<any, State, object>;
	function createSelector(...fns: Function[]): Selector;
	function mapEnhanceReducer(reducerMap: any): MapEnhanceReducer;
	function mapEnhanceStoreEnhancer(): any;
	let createStandardAllSelector: R.CurriedFunction2<Selector, string, Selector>;
	let createStandardErrorSelector: R.CurriedFunction2<Selector, string, Selector>;
	let memoizedFindFactory: R.CurriedFunction3<string, any, any, any>;
	let memoizedFilterFactory: R.CurriedFunction3<string, any, any, any>;
}
