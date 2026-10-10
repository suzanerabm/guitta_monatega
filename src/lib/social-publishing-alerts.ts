import { SendEmailCommand, SESv2Client } from "@aws-sdk/client-sesv2";
import { awsCredentialsProvider } from "@vercel/oidc-aws-credentials-provider";

export type PublishingBrand = "Kammara" | "Bichittos" | "Guitta Monatega Studio" | "Monitor geral";

function required(name: string): string {
  const value = process.env[name]?.trim();
  if (!value) throw new Error(`${name} is not configured.`);
  return value;
}

function errorText(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

export async function sendPublishingAlert(input: {
  brand: PublishingBrand;
  summary: string;
  error?: unknown;
  details?: string[];
}): Promise<void> {
  const region = process.env.SOCIAL_ALERT_AWS_REGION?.trim() || "us-east-1";
  const client = new SESv2Client({
    region,
    credentials: awsCredentialsProvider({ roleArn: required("SOCIAL_ALERT_AWS_ROLE_ARN") }),
    maxAttempts: 4,
  });
  const details = [
    `Mundo: ${input.brand}`,
    `Resumo: ${input.summary}`,
    `Horário UTC: ${new Date().toISOString()}`,
    ...(input.error ? [`Erro: ${errorText(input.error)}`] : []),
    ...(input.details ?? []),
    "",
    "A publicação não será repetida automaticamente se houver risco de duplicidade. Revise o estado antes de reenviar.",
  ];
  await client.send(new SendEmailCommand({
    FromEmailAddress: required("SOCIAL_ALERT_FROM"),
    Destination: { ToAddresses: [required("SOCIAL_ALERT_EMAIL")] },
    Content: {
      Simple: {
        Subject: { Data: `[Publicação] Falha em ${input.brand}`, Charset: "UTF-8" },
        Body: { Text: { Data: details.join("\n"), Charset: "UTF-8" } },
      },
    },
  }));
}

export async function reportPublishingFailure(input: Parameters<typeof sendPublishingAlert>[0]): Promise<void> {
  try {
    await sendPublishingAlert(input);
  } catch (alertError) {
    console.error("Could not send publishing alert", alertError);
  }
}
