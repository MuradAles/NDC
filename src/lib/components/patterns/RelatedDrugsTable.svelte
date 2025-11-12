<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import type { RelatedDrug } from '$lib/types/prescription';

	interface Props {
		relatedDrugs: RelatedDrug[];
		onDrugSelect?: (drugName: string) => void;
	}

	let { relatedDrugs, onDrugSelect }: Props = $props();

	function handleDrugClick(drugName: string) {
		if (onDrugSelect) {
			onDrugSelect(drugName);
		}
	}
</script>

{#if relatedDrugs && relatedDrugs.length > 0}
	<Card padding="none">
		<div class="table-container">
			<div class="table-header">
				<h3 class="table-title">Related Drugs</h3>
			</div>
			<div class="table-scroll">
				<table class="table" role="table">
					<thead>
						<tr>
							<th>Drug Name</th>
						</tr>
					</thead>
					<tbody>
						{#each relatedDrugs as drug}
							<tr class="row" on:click={() => handleDrugClick(drug.name)} role="button" tabindex="0" on:keydown={(e) => e.key === 'Enter' && handleDrugClick(drug.name)}>
								<td class="drug-name">{drug.name}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	</Card>
{:else}
	<Card padding="lg">
		<div class="empty-state">
			<p>No related drugs found.</p>
		</div>
	</Card>
{/if}

<style>
	.table-container {
		display: flex;
		flex-direction: column;
		height: 100%;
	}

	.table-header {
		padding: 1rem;
		background-color: #f5f5f5;
		border-bottom: 2px solid #e0e0e0;
	}

	.table-title {
		font-size: 1rem;
		font-weight: 600;
		color: #212121;
		margin: 0;
	}

	.table-scroll {
		overflow-y: auto;
		overflow-x: auto;
		flex: 1;
		max-height: 600px;
	}

	.table {
		width: 100%;
		border-collapse: collapse;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		font-size: 0.875rem;
	}

	.table thead {
		background-color: #f5f5f5;
		border-bottom: 2px solid #e0e0e0;
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.table th {
		padding: 0.75rem 1rem;
		text-align: left;
		font-weight: 600;
		color: #212121;
		font-size: 0.875rem;
	}

	.table td {
		padding: 0.75rem 1rem;
		border-bottom: 1px solid #e0e0e0;
		color: #212121;
	}

	.table tbody tr {
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.table tbody tr:hover {
		background-color: #f5f5f5;
	}

	.table tbody tr:focus {
		outline: 2px solid #1976d2;
		outline-offset: -2px;
	}

	.drug-name {
		font-weight: 500;
	}

	.empty-state {
		text-align: center;
		padding: 2rem;
		color: #757575;
	}

	@media (max-width: 768px) {
		.table th,
		.table td {
			padding: 0.5rem;
			font-size: 0.75rem;
		}
	}
</style>

