/**
 * Functional Result pattern for robust, predictable error handling without uncaught exceptions.
 */
export type Result<T, E = Error> =
	| { readonly success: true; readonly value: T }
	| { readonly success: false; readonly error: E };

export const Result = {
	ok<T>(value: T): Result<T, never> {
		return { success: true, value };
	},

	err<E>(error: E): Result<never, E> {
		return { success: false, error };
	},
};
