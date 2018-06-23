export = ReduxUtilsFnReducers;

declare namespace ReduxUtilsFnReducers {
	export interface ReduxAction {
		type: string;
	}

	export type Meta = null | {[key: string]: any};

	export interface FSA<Payload = void> extends ReduxAction {
		type: string;
		payload: Payload;
		error?: boolean;
		meta?: Meta;
	}

	export type State = object;
	export type PayloadReducer<Payload> = R.CurriedFunction2<FSA<Payload>, State, State>;
	export type ReducerSpec<Payload> = [string, PayloadReducer<Payload> | PayloadReducer<Payload>[]];
	export type ReduxReducer = (state: State, action: ReduxAction) => State;
	export type ReducerPredicate<Payload> = R.CurriedFunction2<FSA<Payload>, State, boolean>;
	export type PayloadSelector<Payload, Resource> = (payload: Payload) => Resource;
	export type IdSelector<Resource> = (resource: Resource) => string;

	interface PayloadOptions<Payload, Resource> {
		payloadSelector?: PayloadSelector<Payload, Resource>;
	}

	interface IdentifierOptions<Resource> {
		idSelector?: IdSelector<Resource>;
	}

	interface StandardOptions {
		resourceName: string;
	}

	export interface AddResourceOptions<Payload, Resource> extends PayloadOptions<Payload, Resource>, IdentifierOptions<Resource> {
		mapKey: string;
	}

	export interface StandardErrorOptions<Payload, Resource> extends StandardOptions, PayloadOptions<Payload, Resource> {
		clearOnSuccess?: boolean;
	}

	export interface StandardAddOptions<Payload, Resource> extends StandardOptions, PayloadOptions<Payload, Resource>, IdentifierOptions<Resource> {}

	export interface StandardRemoveOptions<Payload, Resource> extends StandardOptions, PayloadOptions<Payload, Resource> {}

	let createReducer: R.CurriedFunction4<State, ReducerSpec<any>, State, ReduxAction, ReduxReducer>;
	let reducerWithPredicate: R.CurriedFunction4<ReducerPredicate<any>, ReduxReducer, FSA<any>, State, ReduxReducer>;
	let whenError: ReducerPredicate<any>;
	let whenNoError: ReducerPredicate<any>;
	let hasPayload: R.CurriedFunction3<PayloadSelector<any, any>, FSA<any>, State, boolean>;
	let composePredicates: R.CurriedFunction3<ReducerPredicate<any>[], FSA<any>, State, boolean>;
	let whenNoErrorAndHasPayload: R.CurriedFunction3<PayloadSelector<any, any>, FSA<any>, State, boolean>;
	let addResourceToMap: R.CurriedFunction3<AddResourceOptions<any, any>, FSA<any>, State, State>;
	let addResourceToArray: R.CurriedFunction3<AddResourceOptions<any, any>, FSA<any>, State, State>;
	let handleStandardError: R.CurriedFunction3<StandardErrorOptions<any, any>, FSA<any>, State, State>;
	let handleStandardAdd: R.CurriedFunction3<StandardAddOptions<any, any>, FSA<any>, State, State>;
	let handleStandardRemove: R.CurriedFunction3<StandardRemoveOptions<any, any>, FSA<any>, State, State>;
	let handleStandardReceive: R.CurriedFunction3<StandardAddOptions<any, any>, FSA<any>, State, State>;
}
