<script lang="ts">
	import PageLayout from '$lib/components/layout/PageLayout.svelte';
	import Card from '$lib/components/ui/Card.svelte';
	import Input from '$lib/components/ui/Input.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import ResultCard from '$lib/components/patterns/ResultCard.svelte';
	import NDCResultTable from '$lib/components/patterns/NDCResultTable.svelte';
	import RelatedDrugsTable from '$lib/components/patterns/RelatedDrugsTable.svelte';
	import DrugDetailsCard from '$lib/components/patterns/DrugDetailsCard.svelte';
	import type { PrescriptionInput, PrescriptionResult } from '$lib/types/prescription';
	import type { MatchedNDC } from '$lib/types/ndc';

	let drugName = $state('');
	let ndc = $state('');
	let sig = $state('');
	let daysSupply = $state(30);
	let loading = $state(false);
	let error = $state<string | null>(null);
	let errorType = $state<'error' | 'warning' | 'info'>('error');
	let errorTitle = $state<string>('Error');
	let result = $state<PrescriptionResult | null>(null);
	let selectedNdc = $state<MatchedNDC | null>(null);

	async function handleSubmit() {
		error = null;
		errorType = 'error';
		errorTitle = 'Error';
		result = null;
		selectedNdc = null;
		loading = true;

		try {
			const input: PrescriptionInput = {
				drugName: drugName.trim() || undefined,
				ndc: ndc.trim() || undefined,
				sig: sig.trim(),
				daysSupply: Number(daysSupply)
			};

			// Note: Browser console may show 404 errors - this is expected browser behavior
			// We handle these gracefully in the UI below
			const response = await fetch('/api/calculate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(input)
			});

			const data = await response.json();

			if (!response.ok) {
				// Handle different error types - 404s are expected when drugs aren't found
				if (response.status === 404) {
					errorType = 'warning';
					errorTitle = 'Not Found';
				} else if (response.status === 400) {
					errorType = 'warning';
					errorTitle = 'Invalid Input';
				} else {
					errorType = 'error';
					errorTitle = 'Error';
				}
				error = data.message || 'An error occurred while calculating';
				return;
			}

			result = data as PrescriptionResult;
		} catch (err) {
			errorType = 'error';
			errorTitle = 'Error';
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
		errorType = 'error';
		errorTitle = 'Error';
		result = null;
		loading = true;

		try {
			const input: PrescriptionInput = {
				drugName: drugName.trim() || undefined,
				ndc: ndc.trim() || undefined,
				sig: sig.trim(),
				daysSupply: Number(daysSupply)
			};

			// Note: Browser console may show 404 errors - this is expected browser behavior
			// We handle these gracefully in the UI below
			const response = await fetch('/api/calculate', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify(input)
			});

			const data = await response.json();

			if (!response.ok) {
				// Handle different error types - 404s are expected when drugs aren't found
				if (response.status === 404) {
					errorType = 'warning';
					errorTitle = 'Not Found';
				} else if (response.status === 400) {
					errorType = 'warning';
					errorTitle = 'Invalid Input';
				} else {
					errorType = 'error';
					errorTitle = 'Error';
				}
				error = data.message || 'An error occurred while calculating';
				return;
			}

			result = data as PrescriptionResult;
		} catch (err) {
			errorType = 'error';
			errorTitle = 'Error';
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
				<Alert variant={errorType} title={errorTitle}>
					{error}
				</Alert>
			</div>
		{/if}

		{#if result}
			<div class="results-section">
				<div class="results-layout">
					<!-- Left Side: Prescription Information -->
					<div class="prescription-info">
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

						<div class="table-section">
							<NDCResultTable 
								matchedNdcs={result.matchedNdcs}
								onNdcSelect={(ndc) => selectedNdc = ndc}
							/>
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

					<!-- Right Side: Detailed Drug Information -->
					{#if selectedNdc}
						<div class="drug-details-sidebar">
							<DrugDetailsCard ndc={selectedNdc} />
						</div>
					{:else if result.matchedNdcs.length > 0}
						<div class="drug-details-sidebar">
							<div class="select-hint">
								<Card padding="lg">
									<p>Select an NDC from the table to view detailed drug information.</p>
								</Card>
							</div>
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

	.results-layout {
		display: grid;
		grid-template-columns: 1fr 400px;
		gap: 2rem;
		width: 100%;
		align-items: start;
	}

	.prescription-info {
		display: flex;
		flex-direction: column;
		gap: 1.5rem;
		min-width: 0;
	}

	.table-section {
		min-width: 0;
	}

	.related-drugs-section {
		min-width: 0;
	}

	.drug-details-sidebar {
		position: sticky;
		top: 2rem;
		max-height: calc(100vh - 4rem);
		overflow-y: auto;
	}

	.select-hint {
		width: 100%;
	}

	.select-hint p {
		margin: 0;
		color: #757575;
		text-align: center;
		line-height: 1.5;
	}

	@media (max-width: 1200px) {
		.results-layout {
			grid-template-columns: 1fr;
		}

		.drug-details-sidebar {
			position: static;
			max-height: none;
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
