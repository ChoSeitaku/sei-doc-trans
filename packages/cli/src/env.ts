export function validateEnv(envVarName: string): void {
  const value = process.env[envVarName];
  if (!value) {
    throw new Error(
      `API key not found. Set the ${envVarName} environment variable.\n` +
        `  Example: export ${envVarName}=your-api-key`,
    );
  }
}
