export = ReduxUtilsFnConstants;

declare namespace ReduxUtilsFnConstants {
	function createConstantMap(...constants: string[]): {[key: string]: string};
	function createLifecycleConstants(constant: string): string[];
	function crudConstants(resource: string): string[];
}
