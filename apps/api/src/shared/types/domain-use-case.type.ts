/**
 * One use-case, one file, one public method. The interface is what keeps that
 * shape honest: a class implementing it cannot grow a second entry point
 * without saying so in its type.
 *
 * `TInput` is `void` for a use-case that takes nothing.
 */
export interface IDomainUseCase<TInput, TOutput> {
	execute(input: TInput): Promise<TOutput>
}
