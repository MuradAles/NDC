<script lang="ts">
	import Input from '$lib/components/ui/Input.svelte';
	import Select from '$lib/components/ui/Select.svelte';
	import type { Option } from '$lib/components/ui/Select.svelte';

	interface Props {
		label: string;
		error?: string;
		required?: boolean;
		children: any;
	}

	let { label, error, required = false, children }: Props = $props();
</script>

<div class="form-field">
	<label class="label">
		{label}
		{#if required}
			<span class="required" aria-label="required">*</span>
		{/if}
	</label>
	<div class="input-container">
		{@render children()}
	</div>
	{#if error}
		<div class="error-message" role="alert">
			{error}
		</div>
	{/if}
</div>

<style>
	.form-field {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		width: 100%;
	}

	.label {
		font-size: 0.875rem;
		font-weight: 500;
		color: #212121;
	}

	.required {
		color: #f44336;
		margin-left: 2px;
	}

	.input-container {
		width: 100%;
	}

	.error-message {
		font-size: 0.875rem;
		color: #f44336;
		margin-top: -0.25rem;
	}
</style>

