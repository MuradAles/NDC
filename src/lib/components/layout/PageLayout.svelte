<script lang="ts">
	import Container from '$lib/components/layout/Container.svelte';

	interface Props {
		title?: string;
		children: any;
	}

	let { title = 'NDC Calculator', children }: Props = $props();
</script>

<div class="page-layout">
	<header class="header">
		<Container>
			<div class="header-content">
				<h1 class="title">{title}</h1>
			</div>
		</Container>
	</header>
	<main class="main">
		<Container maxWidth="full">
			{@render children()}
		</Container>
	</main>
</div>

<style>
	.page-layout {
		min-height: 100vh;
		display: flex;
		flex-direction: column;
		background-color: #f5f5f5;
	}

	.header {
		background-color: #ffffff;
		border-bottom: 1px solid #e0e0e0;
		padding: 1rem 0;
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
	}

	.header-content {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.title {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		font-size: 1.5rem;
		font-weight: 700;
		color: #212121;
		margin: 0;
	}

	.main {
		flex: 1;
		padding: 2rem 0;
	}

	@media (max-width: 768px) {
		.title {
			font-size: 1.25rem;
		}

		.main {
			padding: 1.5rem 0;
		}
	}
</style>

