import { Injectable } from '@nestjs/common';
import ResponseInvokeModelDTO from './dto/ResponseInvokeModelDTO';
import {
  BedrockRuntimeClient,
  InvokeModelCommand,
} from '@aws-sdk/client-bedrock-runtime';

@Injectable()
export class BedRockService {
  private readonly MAX_TOKEN = 512;

  private readonly TEMPERATURE = 0.1;

  private readonly client = new BedrockRuntimeClient({
    region: process.env.BEDROCK_REGION ?? 'us-east-2',
  });

  async invokeModel(content: string): Promise<Record<string, unknown>> {
    const resolvedModelId =
      process.env.BEDROCK_MODEL_ID ?? 'us.amazon.nova-2-lite-v1:0';

    const body = this.getBodyInvokeModelCommand(content);

    const command = new InvokeModelCommand({
      modelId: resolvedModelId,
      contentType: 'application/json',
      accept: 'application/json',
      body,
    });

    try {
      const response = await this.client.send(command);
      const text = new TextDecoder().decode(response.body);

      const responseFormat = JSON.parse(text) as ResponseInvokeModelDTO;
      const rawText = responseFormat.output.message.content[0].text ?? '{}';

      return this.parseJsonResponse(rawText);
    } catch (error) {
      console.error('Error invoking model:', error);
      return { data: { error: 'Error al invocar el modelo' } };
    }
  }

  private parseJsonResponse(raw: string): Record<string, unknown> {
    // Eliminar bloques ```json ... ``` o ``` ... ```
    const jsonBlockRegex = /```(?:json)?\s*([\s\S]*?)```/;
    const match = raw.match(jsonBlockRegex);
    const cleanText = match ? match[1].trim() : raw.trim();

    try {
      return JSON.parse(cleanText) as Record<string, unknown>;
    } catch {
      return { data: { respuesta: cleanText } };
    }
  }

  private getSystemPrompt(): string {
    return [
      'Eres un asistente que SOLO responde en formato JSON válido.',
      'NUNCA uses Markdown, bloques de código, ni texto adicional fuera del JSON.',
      'Tu respuesta debe ser ÚNICAMENTE un objeto JSON con la siguiente estructura:',
      '{"data": {"respuesta": "tu respuesta aquí"}}',
      'No incluyas ```json ni ``` ni ningún otro delimitador.',
      'Responde directamente con el objeto JSON.',
    ].join('\n');
  }

  private getBodyInvokeModelCommand(prompt: string) {
    return JSON.stringify({
      system: [{ text: this.getSystemPrompt() }],
      messages: [
        {
          role: 'user',
          content: [{ text: prompt }],
        },
      ],
      inferenceConfig: {
        maxTokens: this.MAX_TOKEN,
        temperature: this.TEMPERATURE,
      },
    });
  }
}
