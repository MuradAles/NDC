<script lang="ts">
	interface Props {
		variant?: 'success' | 'warning' | 'error' | 'info';
		title?: string;
		children: any;
	}

	let { variant = 'info', title, children }: Props = $props();
</script>

<div class="alert" data-variant={variant} role="alert">
	<div class="icon" aria-hidden="true">
		{#if variant === 'success'}
			✓
		{:else if variant === 'warning'}
			⚠
		{:else if variant === 'error'}
			✕
		{:else}
			ℹ
		{/if}
	</div>
	<div class="content">
		{#if title}
			<div class="title">{title}</div>
		{/if}
		<div class="message">{@render children()}</div>
	</div>
</div>

<style>
	.alert {
		display: flex;
		gap: 1rem;
		padding: 1rem;
		border-radius: 4px;
		border-left: 4px solid;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		font-size: 1rem;
	}

	.alert[data-variant='success'] {
		background-color: var(--bg-success);
		border-left-color: #4caf50;
		color: #4caf50;
	}

	.alert[data-variant='warning'] {
		background-color: var(--bg-warning);
		border-left-color: #ff9800;
		color: #ff9800;
	}

	.alert[data-variant='error'] {
		background-color: var(--bg-error);
		border-left-color: #f44336;
		color: #f44336;
	}

	.alert[data-variant='info'] {
		background-color: var(--bg-info);
		border-left-color: #2196f3;
		color: #2196f3;
	}

	.icon {
		flex-shrink: 0;
		font-size: 1.25rem;
		font-weight: 700;
		line-height: 1;
	}

	.content {
		flex: 1;
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.title {
		font-weight: 600;
		margin-bottom: 0.25rem;
	}

	.message {
		line-height: 1.5;
	}

	:global {
		:root {
			--bg-success: rgba(76, 175, 80, 0.1);
			--bg-warning: rgba(255, 152, 0, 0.1);
			--bg-error: rgba(244, 67, 54, 0.1);
			--bg-info: rgba(33, 150, 243, 0.1);
		}
	}
</style>

