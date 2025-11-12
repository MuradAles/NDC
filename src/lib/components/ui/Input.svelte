<script lang="ts">

	interface Props {
		id?: string;
		name?: string;
		type?: string;
		value?: string | number;
		placeholder?: string;
		label?: string;
		error?: string;
		required?: boolean;
		disabled?: boolean;
		oninput?: (event: Event) => void;
		onblur?: (event: Event) => void;
	}

	let {
		id,
		name,
		type = 'text',
		value = '',
		placeholder,
		label,
		error,
		required = false,
		disabled = false,
		oninput,
		onblur
	}: Props = $props();

	let inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;
</script>

<div class="input-wrapper">
	{#if label}
		<label for={inputId} class="label">
			{label}
			{#if required}
				<span class="required" aria-label="required">*</span>
			{/if}
		</label>
	{/if}
	<input
		id={inputId}
		name={name}
		type={type}
		value={value}
		placeholder={placeholder}
		required={required}
		disabled={disabled}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${inputId}-error` : undefined}
		oninput={oninput}
		onblur={onblur}
		class="input"
		data-error={!!error}
	/>
	{#if error}
		<div id="{inputId}-error" class="error-message" role="alert">
			{error}
		</div>
	{/if}
</div>

<style>
	.input-wrapper {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		width: 100%;
	}

	.label {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		font-size: 0.875rem;
		font-weight: 500;
		color: #212121;
	}

	.required {
		color: #f44336;
		margin-left: 2px;
	}

	.input {
		width: 100%;
		padding: 0.5rem 1rem;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		font-size: 1rem;
		color: #212121;
		background-color: #ffffff;
		border: 1px solid #e0e0e0;
		border-radius: 4px;
		transition: all 0.2s ease;
		box-sizing: border-box;
	}

	.input::placeholder {
		color: #757575;
	}

	.input:hover:not(:disabled) {
		border-color: #1976d2;
	}

	.input:focus {
		outline: none;
		border-color: #1976d2;
		box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
	}

	.input:disabled {
		background-color: #f5f5f5;
		color: #bdbdbd;
		cursor: not-allowed;
	}

	.input[data-error='true'] {
		border-color: #f44336;
	}

	.input[data-error='true']:focus {
		border-color: #f44336;
		box-shadow: 0 0 0 3px rgba(244, 67, 54, 0.1);
	}

	.error-message {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		font-size: 0.875rem;
		color: #f44336;
		margin-top: -0.25rem;
	}
</style>

