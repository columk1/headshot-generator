import type { z, ZodTypeAny } from 'zod';
import type { User } from '@/lib/db/schema';
import { getUser } from '@/lib/db/queries';
import { redirect } from 'next/navigation';

export type ActionState = {
	error?: string;
	success?: string;
	[key: string]: unknown; // This allows for additional properties
};

type ValidatedActionFunction<S extends ZodTypeAny, T> = (
	data: z.infer<S>,
	formData: FormData,
) => Promise<T>;

export function validatedAction<S extends ZodTypeAny, T>(
	schema: S,
	action: ValidatedActionFunction<S, T>,
) {
	return async (prevState: ActionState, formData: FormData): Promise<T> => {
		const result = schema.safeParse(Object.fromEntries(formData));
		if (!result.success) {
			return { error: result.error.errors[0].message } as T;
		}

		return action(result.data, formData);
	};
}

type ValidatedActionWithUserFunction<S extends ZodTypeAny, T> = (
	data: z.infer<S>,
	formData: FormData,
	user: User,
) => Promise<T>;

// function wrapAction(
//   action: (state: ActionState, formData: FormData) => Promise<void | ActionState>
// ): (state: ActionState, formData: FormData) => Promise<ActionState> {
//   return async (state: ActionState, formData: FormData) => {
//     const result = await action(state, formData);
//     // If the action returns void (redirect), supply a default ActionState.
//     return result ?? { error: '' };
//   };
// }

export function validatedActionWithUser<S extends ZodTypeAny, T>(
	schema: S,
	action: ValidatedActionWithUserFunction<S, T>,
) {
	return async (prevState: ActionState, formData: FormData): Promise<T> => {
		const user = await getUser();
		if (!user) {
			throw new Error('User is not authenticated');
		}

		const result = schema.safeParse(Object.fromEntries(formData));
		console.log(result);
		if (!result.success) {
			console.log(result.error);
			return { error: result.error.errors[0].message } as T;
		}

		return action(result.data, formData, user);
	};
}

type ActionWithUserFunction<T> = (formData: FormData, user: User) => Promise<T>;

export function withUser<T>(action: ActionWithUserFunction<T>) {
	return async (formData: FormData): Promise<T> => {
		const user = await getUser();
		if (!user) {
			redirect('/sign-in');
		}

		return action(formData, user);
	};
}
