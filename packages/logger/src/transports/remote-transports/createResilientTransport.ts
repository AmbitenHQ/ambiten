import { RemoteTransporter } from "../../types";
import { createCircuitBreaker, retryWithBackoff } from "../../utils";
import { ResilientTransportOptions } from "./remote-transport";

export function createResilientTransporter(
	baseTransporter: RemoteTransporter,
	options: ResilientTransportOptions = {}
): RemoteTransporter {
	const breakerWrapped = createCircuitBreaker(baseTransporter, {
		failureThreshold: options.failureThreshold ?? 3,
		cooldownPeriod: options.cooldownPeriod ?? 10_000,
		successThreshold: options.successThreshold ?? 1,
	});

	return async (formattedMessage, entry) => {
		await retryWithBackoff(
			() => breakerWrapped(formattedMessage, entry),
			{
				attempts: options.retryAttempts ?? 3,
				delay: options.retryDelay ?? 500,
				jitter: true,
			}
		);
	};
}