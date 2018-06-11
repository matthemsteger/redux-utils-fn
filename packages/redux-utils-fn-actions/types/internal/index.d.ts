declare namespace Internal {
	export interface FSA<Payload> {
		type: string;
		payload: Payload;
		error?: boolean;
	}

	export interface PlainActionCreator<Payload> extends R.CurriedFunction2<string, Payload, FSA<Payload>> {}
	export interface ActionCreator<Payload> { (payload: Payload, error?: boolean): FSA<Payload> }
	export interface ErrorToAction<Payload extends Error> extends R.CurriedFunction2<ActionCreator<Payload>, Payload, FSA<Payload>> {}
}
