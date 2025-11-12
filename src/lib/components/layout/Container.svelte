<script lang="ts">

	interface Props {
		maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
		padding?: 'none' | 'sm' | 'md' | 'lg';
		children: any;
	}

	let {
		maxWidth = 'lg',
		padding = 'md',
		children
	}: Props = $props();

	const maxWidthMap = {
		sm: '640px',
		md: '768px',
		lg: '1024px',
		xl: '1280px',
		full: '100%'
	};
</script>

<div class="container" style="max-width: {maxWidthMap[maxWidth]};" data-padding={padding}>
	{@render children()}
</div>

<style>
	.container {
		width: 100%;
		margin: 0 auto;
	}

	.container[data-padding='none'] {
		padding: 0;
	}

	.container[data-padding='sm'] {
		padding: 0 0.5rem;
	}

	.container[data-padding='md'] {
		padding: 0 1rem;
	}

	.container[data-padding='lg'] {
		padding: 0 1.5rem;
	}

	@media (max-width: 768px) {
		.container[data-padding='md'] {
			padding: 0 0.5rem;
		}

		.container[data-padding='lg'] {
			padding: 0 1rem;
		}
	}
</style>

