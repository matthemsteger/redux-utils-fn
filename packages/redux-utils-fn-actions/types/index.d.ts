import * as R from 'ramda';

export = ReduxUtilsFnActions;

declare namespace ReduxUtilsFnActions {
	type FSA<Payload> = import('./../src').FSA<Payload>;
	interface PlainActionCreator<Payload> extends R.CurriedFunction2<string, Payload, FSA<Payload>> {}
	interface ActionCreator<Payload> { (payload: Payload, error?: boolean): FSA<Payload> }
	interface ErrorToAction<Payload extends Error> extends R.CurriedFunction2<ActionCreator<Payload>, Payload, FSA<Payload>> {}

	export interface createPlainAction<Payload> extends PlainActionCreator<Payload> {}
	function createActionCreator<Payload>(type: string): ActionCreator<Payload>;
	export interface errorToAction<Payload extends Error> extends ErrorToAction<Payload> {}
	function actionIsErrored(action: FSA<any>): boolean;
	export interface prefixAction<Payload> extends R.CurriedFunction2<string, FSA<Payload>, FSA<Payload>> {}
}
