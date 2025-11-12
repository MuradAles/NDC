<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import type { MatchedNDC } from '$lib/types/ndc';

	interface Props {
		matchedNdcs: MatchedNDC[];
	}

	let { matchedNdcs }: Props = $props();
</script>

{#if matchedNdcs.length > 0}
	<Card padding="none">
		<div class="table-container">
			<div class="table-header">
				<h3 class="table-title">NDC Results</h3>
			</div>
			<div class="table-scroll">
				<table class="table" role="table">
				<thead>
					<tr>
						<th>NDC</th>
						<th>Product Name</th>
						<th>Package Size</th>
						<th>Packages Needed</th>
						<th>Overfill/Underfill</th>
						<th>Status</th>
					</tr>
				</thead>
				<tbody>
					{#each matchedNdcs as ndc}
						<tr
							class="row"
							data-optimal={ndc.isOptimal}
							data-inactive={!ndc.isActive}
						>
							<td class="ndc-code">{ndc.productNdc}</td>
							<td class="product-name">{ndc.productName}</td>
							<td class="package-size">
								{ndc.packageSize} {ndc.unit}
							</td>
							<td class="packages-needed">{ndc.packagesNeeded}</td>
							<td class="overfill-underfill">
								{#if ndc.overfill !== undefined && ndc.overfill > 0}
									<span class="overfill">+{ndc.overfill} {ndc.unit}</span>
								{:else if ndc.underfill !== undefined && ndc.underfill > 0}
									<span class="underfill">-{ndc.underfill} {ndc.unit}</span>
								{:else}
									<span class="exact">Exact match</span>
								{/if}
							</td>
							<td class="status">
								{#if ndc.isOptimal}
									<span class="badge optimal">Optimal</span>
								{/if}
								{#if !ndc.isActive}
									<span class="badge inactive">Inactive</span>
								{/if}
								{#if ndc.isActive && !ndc.isOptimal}
									<span class="badge">Available</span>
								{/if}
							</td>
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
			<p>No matching NDCs found.</p>
		</div>
	</Card>
{/if}

<style>
	.table-container {
		display: flex;
		flex-direction: column;
		height: 100%;
		width: 100%;
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
		overflow-x: hidden;
		flex: 1;
		max-height: 600px;
	}

	.table {
		width: 100%;
		border-collapse: collapse;
		font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
		font-size: 0.875rem;
		table-layout: auto;
	}

	.table thead {
		background-color: #f5f5f5;
		border-bottom: 2px solid #e0e0e0;
		position: sticky;
		top: 0;
		z-index: 1;
	}

	.table th {
		padding: 0.75rem;
		text-align: left;
		font-weight: 600;
		color: #212121;
		font-size: 0.875rem;
	}

	.table td {
		padding: 0.75rem;
		border-bottom: 1px solid #e0e0e0;
		color: #212121;
	}

	.table tbody tr:hover {
		background-color: #f5f5f5;
	}

	.table tbody tr[data-optimal='true'] {
		background-color: rgba(76, 175, 80, 0.05);
		border-left: 3px solid #4caf50;
	}

	.table tbody tr[data-inactive='true'] {
		background-color: rgba(244, 67, 54, 0.05);
		opacity: 0.7;
	}

	.ndc-code {
		font-family: monospace;
		font-weight: 500;
		min-width: 120px;
	}

	.product-name {
		max-width: 400px;
		word-wrap: break-word;
		word-break: break-word;
	}

	.package-size {
		text-align: right;
		min-width: 100px;
	}

	.packages-needed {
		text-align: center;
		font-weight: 500;
		min-width: 120px;
	}

	.overfill-underfill {
		text-align: center;
		min-width: 150px;
	}

	.status {
		text-align: center;
		min-width: 100px;
	}

	.overfill {
		color: #ff9800;
		font-weight: 500;
	}

	.underfill {
		color: #f44336;
		font-weight: 500;
	}

	.exact {
		color: #4caf50;
		font-weight: 500;
	}

	.badge {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 500;
		background-color: #f5f5f5;
		color: #757575;
	}

	.badge.optimal {
		background-color: #4caf50;
		color: white;
	}

	.badge.inactive {
		background-color: #f44336;
		color: white;
	}

	.empty-state {
		text-align: center;
		padding: 2rem;
		color: #757575;
	}

	@media (max-width: 768px) {
		.table-container {
			overflow-x: scroll;
		}

		.table th,
		.table td {
			padding: 0.5rem;
			font-size: 0.75rem;
		}

		.product-name {
			max-width: 200px;
		}
	}
</style>

