<script lang="ts">

	interface Props {
		variant?: 'primary' | 'secondary' | 'outlined';
		type?: 'button' | 'submit' | 'reset';
		disabled?: boolean;
		loading?: boolean;
		onclick?: () => void;
		children: any;
	}

	let {
		variant = 'primary',
		type = 'button',
		disabled = false,
		loading = false,
		onclick,
		children
	}: Props = $props();
</script>

<button
	type={type}
	disabled={disabled || loading}
	onclick={onclick}
	class="button"
	data-variant={variant}
	data-loading={loading}
>
	{#if loading}
		<span class="spinner" aria-hidden="true"></span>
		<span class="sr-only">Loading...</span>
	{/if}
	<span class="content" data-loading={loading}>{@render children()}</span>
</button>

<style>
	.button {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		font-size: 1rem;
		font-weight: 500;
		border: 2px solid transparent;
		border-radius: 4px;
		cursor: pointer;
		transition: all 0.2s ease;
		min-height: 40px;
	}

	.button:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}

	.button[data-variant='primary'] {
		background-color: #1976d2;
		color: white;
	}

	.button[data-variant='primary']:hover:not(:disabled) {
		background-color: #1565c0;
	}

	.button[data-variant='secondary'] {
		background-color: #dc004e;
		color: white;
	}

	.button[data-variant='secondary']:hover:not(:disabled) {
		background-color: #9a0036;
	}

	.button[data-variant='outlined'] {
		background-color: transparent;
		color: #1976d2;
		border-color: #1976d2;
	}

	.button[data-variant='outlined']:hover:not(:disabled) {
		background-color: #42a5f5;
		color: white;
	}

	.button:focus-visible {
		outline: 2px solid #1976d2;
		outline-offset: 2px;
	}

	.spinner {
		width: 16px;
		height: 16px;
		border: 2px solid rgba(255, 255, 255, 0.3);
		border-top-color: white;
		border-radius: 50%;
		animation: spin 0.6s linear infinite;
	}

	.button[data-variant='outlined'] .spinner {
		border-color: rgba(25, 118, 210, 0.3);
		border-top-color: #1976d2;
	}

	@keyframes spin {
		to {
			transform: rotate(360deg);
		}
	}

	.content[data-loading='true'] {
		opacity: 0.7;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		padding: 0;
		margin: -1px;
		overflow: hidden;
		clip: rect(0, 0, 0, 0);
		white-space: nowrap;
		border-width: 0;
	}
</style>

