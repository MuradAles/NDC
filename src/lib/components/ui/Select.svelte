<script lang="ts">

	interface Option {
		value: string | number;
		label: string;
	}

	interface Props {
		id?: string;
		name?: string;
		value?: string | number;
		options: Option[];
		label?: string;
		placeholder?: string;
		error?: string;
		required?: boolean;
		disabled?: boolean;
		onchange?: (event: Event) => void;
	}

	let {
		id,
		name,
		value,
		options,
		label,
		placeholder,
		error,
		required = false,
		disabled = false,
		onchange
	}: Props = $props();

	let selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;
</script>

<div class="select-wrapper">
	{#if label}
		<label for={selectId} class="label">
			{label}
			{#if required}
				<span class="required" aria-label="required">*</span>
			{/if}
		</label>
	{/if}
	<select
		id={selectId}
		name={name}
		value={value}
		required={required}
		disabled={disabled}
		aria-invalid={error ? 'true' : undefined}
		aria-describedby={error ? `${selectId}-error` : undefined}
		onchange={onchange}
		class="select"
		data-error={!!error}
	>
		{#if placeholder}
			<option value="" disabled>{placeholder}</option>
		{/if}
		{#each options as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
	{#if error}
		<div id="{selectId}-error" class="error-message" role="alert">
			{error}
		</div>
	{/if}
</div>

<style>
	.select-wrapper {
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

	.select {
		width: 100%;
		padding: 0.5rem 1rem;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		font-size: 1rem;
		color: #212121;
		background-color: #ffffff;
		border: 1px solid #e0e0e0;
		border-radius: 4px;
		transition: all 0.2s ease;
		cursor: pointer;
		box-sizing: border-box;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23212121' d='M6 9L1 4h10z'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 1rem center;
		padding-right: 3rem;
	}

	.select:hover:not(:disabled) {
		border-color: #1976d2;
	}

	.select:focus {
		outline: none;
		border-color: #1976d2;
		box-shadow: 0 0 0 3px rgba(25, 118, 210, 0.1);
	}

	.select:disabled {
		background-color: #f5f5f5;
		color: #bdbdbd;
		cursor: not-allowed;
		opacity: 0.6;
	}

	.select[data-error='true'] {
		border-color: #f44336;
	}

	.select[data-error='true']:focus {
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

