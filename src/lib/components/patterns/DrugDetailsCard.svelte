<script lang="ts">
	import Card from '$lib/components/ui/Card.svelte';
	import type { MatchedNDC } from '$lib/types/ndc';

	interface Props {
		ndc: MatchedNDC;
	}

	let { ndc }: Props = $props();

	// Check if brand and generic names are the same (case-insensitive)
	const brandLower = ndc.brandName?.toLowerCase().trim() || '';
	const genericLower = ndc.genericName?.toLowerCase().trim() || '';
	const areSame = brandLower && genericLower && brandLower === genericLower;
</script>

<Card padding="lg">
	<div class="drug-details">
		<h3 class="title">Drug Information</h3>
		
		<div class="detail-section">
			{#if ndc.brandName && !areSame}
				<div class="detail-row">
					<span class="label">Brand Name:</span>
					<span class="value">{ndc.brandName}</span>
				</div>
			{/if}
			
			{#if ndc.genericName && !areSame}
				<div class="detail-row">
					<span class="label">Generic Name:</span>
					<span class="value">{ndc.genericName}</span>
				</div>
			{/if}
			
			{#if (!ndc.brandName && !ndc.genericName) || areSame}
				<div class="detail-row">
					<span class="label">Product Name:</span>
					<span class="value">{ndc.productName}</span>
				</div>
			{/if}
			
			<div class="detail-row">
				<span class="label">NDC Code:</span>
				<span class="value code">{ndc.productNdc}</span>
			</div>
			
			<div class="detail-row">
				<span class="label">Dosage Form:</span>
				<span class="value">{ndc.dosageForm}</span>
			</div>
			
			{#if ndc.activeIngredients && ndc.activeIngredients.length > 0}
				<div class="detail-row ingredients">
					<span class="label">Active Ingredients:</span>
					<div class="ingredients-list">
						{#each ndc.activeIngredients as ingredient}
							<div class="ingredient">
								<span class="ingredient-name">{ingredient.name}</span>
								<span class="ingredient-strength">{ingredient.strength}</span>
							</div>
						{/each}
					</div>
				</div>
			{:else if ndc.strength && ndc.strength !== 'Unknown'}
				<div class="detail-row">
					<span class="label">Strength:</span>
					<span class="value">{ndc.strength}</span>
				</div>
			{/if}
			
			<div class="detail-row">
				<span class="label">Package Size:</span>
				<span class="value">{ndc.packageSize} {ndc.unit}</span>
			</div>
			
			{#if ndc.packageDescription}
				<div class="detail-row">
					<span class="label">Package Description:</span>
					<span class="value">{ndc.packageDescription}</span>
				</div>
			{/if}
			
			<div class="detail-row">
				<span class="label">Status:</span>
				<span class="value status" data-active={ndc.isActive}>
					{ndc.isActive ? 'Active' : 'Inactive'}
				</span>
			</div>
			
			{#if ndc.listedDate}
				<div class="detail-row">
					<span class="label">Listed Date:</span>
					<span class="value">{ndc.listedDate}</span>
				</div>
			{/if}
		</div>
	</div>
</Card>

<style>
	.drug-details {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.title {
		font-size: 1.25rem;
		font-weight: 600;
		color: #212121;
		margin: 0 0 0.5rem 0;
	}

	.detail-section {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	.detail-row {
		display: flex;
		flex-direction: column;
		gap: 0.25rem;
		padding-bottom: 0.75rem;
		border-bottom: 1px solid #e0e0e0;
	}

	.detail-row:last-child {
		border-bottom: none;
		padding-bottom: 0;
	}

	.detail-row.ingredients {
		border-bottom: 1px solid #e0e0e0;
	}

	.label {
		font-size: 0.875rem;
		font-weight: 600;
		color: #757575;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}

	.value {
		font-size: 1rem;
		color: #212121;
		line-height: 1.5;
	}

	.value.code {
		font-family: monospace;
		font-weight: 500;
		background-color: #f5f5f5;
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		display: inline-block;
	}

	.value.status[data-active='true'] {
		color: #4caf50;
		font-weight: 600;
	}

	.value.status[data-active='false'] {
		color: #f44336;
		font-weight: 600;
	}

	.ingredients-list {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
		margin-top: 0.5rem;
	}

	.ingredient {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 0.5rem;
		background-color: #f5f5f5;
		border-radius: 4px;
	}

	.ingredient-name {
		font-weight: 500;
		color: #212121;
	}

	.ingredient-strength {
		font-size: 0.875rem;
		color: #757575;
	}

	@media (min-width: 768px) {
		.detail-row {
			flex-direction: row;
			align-items: flex-start;
		}

		.label {
			min-width: 140px;
			flex-shrink: 0;
		}

		.value {
			flex: 1;
		}
	}
</style>

