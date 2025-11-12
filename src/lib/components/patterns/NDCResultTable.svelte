<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import type { MatchedNDC } from '$lib/types/ndc';

	interface Props {
		matchedNdcs: MatchedNDC[];
		onNdcSelect?: (ndc: MatchedNDC) => void;
	}

	let { matchedNdcs, onNdcSelect }: Props = $props();
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
							data-multipack={!!ndc.multiPack}
							role="button"
							tabindex="0"
							onclick={() => onNdcSelect?.(ndc)}
							onkeydown={(e) => {
								if (e.key === 'Enter' || e.key === ' ') {
									e.preventDefault();
									onNdcSelect?.(ndc);
								}
							}}
							title="Click to view detailed drug information"
						>
							<td class="ndc-code">
								{#if ndc.multiPack}
									<div class="multipack-indicator">Multi-pack</div>
								{:else}
									{ndc.productNdc}
								{/if}
							</td>
							<td class="product-name">
								{#if ndc.multiPack}
									<div class="multipack-combo">
										{#each ndc.multiPack as combo}
											<div class="combo-item">
												{combo.packages}× {combo.ndc.packageSize} {combo.ndc.unit}
												<span class="combo-ndc">({combo.ndc.productNdc})</span>
											</div>
										{/each}
									</div>
								{:else}
									{ndc.productName}
								{/if}
							</td>
							<td class="package-size">
								{#if ndc.multiPack}
									<div class="multipack-total">
										{ndc.multiPack.reduce((sum, c) => sum + c.ndc.packageSize * c.packages, 0)} {ndc.unit}
									</div>
								{:else}
									{ndc.packageSize} {ndc.unit}
								{/if}
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
								{#if ndc.multiPack}
									<span class="badge multipack">Multi-pack</span>
								{/if}
								{#if !ndc.isActive}
									<span class="badge inactive">Inactive</span>
								{/if}
								{#if ndc.isActive && !ndc.isOptimal && !ndc.multiPack}
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

	.table tbody tr[role='button'] {
		cursor: pointer;
		transition: background-color 0.2s;
	}

	.table tbody tr[role='button']:hover {
		background-color: #f5f5f5;
	}

	.table tbody tr[role='button']:focus {
		outline: 2px solid #2196f3;
		outline-offset: -2px;
	}

	.table tbody tr[data-optimal='true'] {
		background-color: rgba(76, 175, 80, 0.05);
		border-left: 3px solid #4caf50;
	}

	.table tbody tr[data-inactive='true'] {
		background-color: rgba(244, 67, 54, 0.05);
		opacity: 0.7;
	}

	.table tbody tr[data-multipack='true'] {
		background-color: rgba(33, 150, 243, 0.05);
		border-left: 3px solid #2196f3;
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

	.badge.multipack {
		background-color: #2196f3;
		color: white;
	}

	.multipack-indicator {
		font-weight: 600;
		color: #2196f3;
		font-size: 0.75rem;
	}

	.multipack-combo {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
	}

	.combo-item {
		font-size: 0.875rem;
		line-height: 1.4;
	}

	.combo-ndc {
		font-family: monospace;
		font-size: 0.75rem;
		color: #757575;
		margin-left: 0.5rem;
	}

	.multipack-total {
		font-weight: 600;
		color: #2196f3;
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

