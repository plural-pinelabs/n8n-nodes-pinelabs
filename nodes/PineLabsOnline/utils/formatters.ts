export function formatAmountINR(paisa: number): string {
	return `Rs ${(paisa / 100).toLocaleString('en-IN', { minimumFractionDigits: 2 })}`;
}

export function getCurrentTimestamp(): string {
	return new Date().toISOString();
}
