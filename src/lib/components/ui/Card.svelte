<script lang="ts">

	interface Props {
		padding?: 'none' | 'sm' | 'md' | 'lg';
		children: any;
	}

	let { padding = 'md', children }: Props = $props();
</script>

<div class="card" data-padding={padding}>
	{@render children()}
</div>

<style>
	.card {
		background-color: #ffffff;
		border-radius: 8px;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
		transition: box-shadow 0.2s ease;
	}

	.card[data-padding='none'] {
		padding: 0;
	}

	.card[data-padding='sm'] {
		padding: 0.5rem;
	}

	.card[data-padding='md'] {
		padding: 1rem;
	}

	.card[data-padding='lg'] {
		padding: 1.5rem;
	}

	.card:hover {
		box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
	}
</style>

