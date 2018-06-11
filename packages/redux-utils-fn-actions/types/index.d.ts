/// <reference path="internal/index.d.ts" />

export = ReduxUtilsFnActions;

declare namespace ReduxUtilsFnActions {
	export interface createPlainAction<Payload> extends Internal.PlainActionCreator<Payload> {}
	function createActionCreator<Payload>(type: string): Internal.ActionCreator<Payload>;
	export interface errorToAction<Payload extends Error> extends Internal.ErrorToAction<Payload> {}
	function actionIsErrored(action: Internal.FSA<any>): boolean;
	export interface prefixAction<Payload> extends R.CurriedFunction2<string, Internal.FSA<Payload>, Internal.FSA<Payload>> {}
}
