<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';

	interface Props {
		drugName: string;
		totalQuantity: number;
		unit: string;
	}

	let { drugName, totalQuantity, unit }: Props = $props();
</script>

<Card padding="lg">
	<div class="result-card">
		<div class="header">
			<h3 class="drug-name">{drugName}</h3>
		</div>
		<div class="quantity-section">
			<div class="label">Total Quantity Needed:</div>
			<div class="quantity">
				<span class="value">{totalQuantity}</span>
				<span class="unit">{unit}</span>
			</div>
		</div>
	</div>
</Card>

<style>
	.result-card {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.header {
		border-bottom: 1px solid #e0e0e0;
		padding-bottom: 1rem;
	}

	.drug-name {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		font-size: 1.25rem;
		font-weight: 600;
		color: #212121;
		margin: 0;
	}

	.quantity-section {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.label {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		font-size: 0.875rem;
		color: #757575;
	}

	.quantity {
		display: flex;
		align-items: baseline;
		gap: 0.25rem;
	}

	.value {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		font-size: 1.5rem;
		font-weight: 700;
		color: #1976d2;
	}

	.unit {
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		font-size: 1.125rem;
		color: #757575;
	}
</style>

