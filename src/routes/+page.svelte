<script lang="ts">
	import PageLayout from '$lib/components/layout/PageLayout.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import ResultCard from '$lib/components/patterns/ResultCard.svelte';
	import NDCResultTable from '$lib/components/patterns/NDCResultTable.svelte';
	import RelatedDrugsTable from '$lib/components/patterns/RelatedDrugsTable.svelte';
	import type { PrescriptionInput, PrescriptionResult } from '$lib/types/prescription';

	let drugName = $state('');
	let ndc = $state('');
	let sig = $state('');
	let daysSupply = $state(30);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let result = $state<PrescriptionResult | null>(null);

	async function handleSubmit() {
		error = null;
		result = null;
		loading = true;

		try {
			const input: PrescriptionInput = {
				drugName: drugName.trim() || undefined,
				ndc: ndc.trim() || undefined,
				sig: sig.trim(),
				daysSupply: Number(daysSupply)
			};

			const response = await fetch('/api/calculate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(input)
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.message || 'An error occurred while calculating';
				return;
			}

			result = data as PrescriptionResult;
		} catch (err) {
			error = err instanceof Error ? err.message : 'An unexpected error occurred';
		} finally {
			loading = false;
		}
	}

	function handleInputChange(event: Event) {
		const target = event.target as HTMLInputElement;
		if (target.name === 'drugName') {
			drugName = target.value;
		} else if (target.name === 'ndc') {
			ndc = target.value;
		} else if (target.name === 'sig') {
			sig = target.value;
		} else if (target.name === 'daysSupply') {
			daysSupply = Number(target.value);
		}
	}

	async function handleRelatedDrugSelect(selectedDrugName: string) {
		drugName = selectedDrugName;
		ndc = '';
		error = null;
		result = null;
		loading = true;

		try {
			const input: PrescriptionInput = {
				drugName: drugName.trim() || undefined,
				ndc: ndc.trim() || undefined,
				sig: sig.trim(),
				daysSupply: Number(daysSupply)
			};

			const response = await fetch('/api/calculate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(input)
			});

			const data = await response.json();

			if (!response.ok) {
				error = data.message || 'An error occurred while calculating';
				return;
			}

			result = data as PrescriptionResult;
		} catch (err) {
			error = err instanceof Error ? err.message : 'An unexpected error occurred';
		} finally {
			loading = false;
		}
	}
</script>

<PageLayout title="NDC Calculator">
	<div class="page-content">
		<div class="form-section">
			<Card padding="lg">
				<form onsubmit={(e) => { e.preventDefault(); handleSubmit(); }} class="form">
					<h2 class="form-title">Prescription Information</h2>

					<div class="form-group">
						<Input
							id="drugName"
							name="drugName"
							type="text"
							label="Drug Name"
							placeholder="e.g., Lisinopril"
							value={drugName}
							oninput={handleInputChange}
							disabled={loading || !!ndc}
						/>
						<div class="or-divider" role="separator" aria-label="or">OR</div>
						<Input
							id="ndc"
							name="ndc"
							type="text"
							label="NDC Code"
							placeholder="e.g., 12345-678-90"
							value={ndc}
							oninput={handleInputChange}
							disabled={loading || !!drugName}
						/>
					</div>

					<div class="form-group">
						<Input
							id="sig"
							name="sig"
							type="text"
							label="SIG (Prescription Instructions)"
							placeholder="e.g., Take 1 tablet by mouth twice daily"
							value={sig}
							required={true}
							oninput={handleInputChange}
							disabled={loading}
						/>
					</div>

					<div class="form-group">
						<Input
							id="daysSupply"
							name="daysSupply"
							type="number"
							label="Days Supply"
							value={daysSupply}
							required={true}
							min="1"
							max="365"
							oninput={handleInputChange}
							disabled={loading}
						/>
					</div>

					<div class="form-actions">
						<Button
							type="submit"
							variant="primary"
							loading={loading}
							disabled={loading}
							aria-label={loading ? 'Calculating...' : 'Calculate prescription quantity'}
						>
							Calculate
						</Button>
					</div>
				</form>
			</Card>
		</div>

		{#if error}
			<div class="error-section">
				<Alert variant="error" title="Error">
					{error}
				</Alert>
			</div>
		{/if}

		{#if result}
			<div class="results-section">
				<ResultCard
					drugName={result.drugName}
					totalQuantity={result.totalQuantity}
					unit={result.unit}
				/>

				{#if result.warnings && result.warnings.length > 0}
					<div class="warnings-section">
						{#each result.warnings as warning}
							<Alert variant="warning">
								{warning}
							</Alert>
						{/each}
					</div>
				{/if}

				<div class="tables-container">
					<div class="main-table-section">
						<NDCResultTable matchedNdcs={result.matchedNdcs} />
					</div>
					{#if result.relatedDrugs && result.relatedDrugs.length > 0}
						<div class="related-drugs-section">
							<RelatedDrugsTable
								relatedDrugs={result.relatedDrugs}
								onDrugSelect={handleRelatedDrugSelect}
							/>
						</div>
					{/if}
				</div>
			</div>
		{/if}
	</div>
</PageLayout>

<style>
	.page-content {
		display: flex;
		flex-direction: column;
		gap: 2rem;
		width: 100%;
		margin: 0 auto;
		padding: 0 1rem;
	}

	.form-section {
		width: 100%;
	}

	.form {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.form-title {
		font-size: 1.5rem;
		font-weight: 600;
		margin-bottom: 1rem;
		color: #212121;
	}

	.form-group {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.or-divider {
		text-align: center;
		font-weight: 500;
		color: #757575;
		margin: -0.5rem 0;
	}

	.form-actions {
		display: flex;
		justify-content: flex-end;
		margin-top: 1rem;
	}

	.error-section,
	.results-section {
		width: 100%;
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
	}

	.warnings-section {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	.tables-container {
		display: grid;
		grid-template-columns: 1fr 350px;
		gap: 1.5rem;
		width: 100%;
	}

	.main-table-section {
		min-width: 0;
	}

	.related-drugs-section {
		min-width: 0;
	}

	@media (max-width: 1024px) {
		.tables-container {
			grid-template-columns: 1fr;
		}
	}

	@media (max-width: 768px) {
		.page-content {
			gap: 1.5rem;
		}

		.form {
			gap: 1rem;
		}

		.form-title {
			font-size: 1.25rem;
		}
	}
</style>
