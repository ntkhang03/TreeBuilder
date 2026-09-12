/**
 * Abstraction for cancellation tokens, compatible with both VS Code and Node environments.
 */
export interface ICancellationToken {
	isCancellationRequested: boolean;
	onCancellationRequested?: (listener: () => void) => { dispose(): void };
}

export class SimpleCancellationToken implements ICancellationToken {
	private _isCancelled = false;
	private readonly listeners: Array<() => void> = [];

	public get isCancellationRequested(): boolean {
		return this._isCancelled;
	}

	public cancel(): void {
		if (!this._isCancelled) {
			this._isCancelled = true;
			for (const listener of this.listeners) {
				try {
					listener();
				} catch {
					// ignore
				}
			}
		}
	}

	public onCancellationRequested(listener: () => void): { dispose(): void } {
		this.listeners.push(listener);
		return {
			dispose: () => {
				const idx = this.listeners.indexOf(listener);
				if (idx !== -1) {
					this.listeners.splice(idx, 1);
				}
			},
		};
	}
}
