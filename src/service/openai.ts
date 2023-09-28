import { appStore } from "@/store/app";

export class OpenaiPrompt {
  messages: OpenaiMessage[];
  model: OpenaiModel;

  constructor(messages: OpenaiMessage[],
              model: OpenaiModel = OpenaiModel.gpt_3_5_turbo) {
    this.messages = messages;
    this.model = model;
  }
}

export class OpenaiMessage {
  role: OpenaiRole;
  content: string;

  constructor(role: OpenaiRole, content: string) {
    this.role = role;
    this.content = content;
  }
}

export enum OpenaiRole {
  SYSTEM = "system",
  USER = "user",
  ASSISTANT = "assistant",
  FUNCTION = "function"
}

export enum OpenaiModel {
  gpt_4 = "gpt-4",
  gpt_4_0613 = "gpt-4-0613",
  gpt_4_32k = "gpt-4-32k",
  gpt_4_32k_0613 = "gpt-4-32k-0613",
  gpt_3_5_turbo = "gpt-3.5-turbo",
  gpt_3_5_turbo_0613 = "gpt-3.5-turbo-0613",
  gpt_3_5_turbo_16k = "gpt-3.5-turbo-16k",
  gpt_3_5_turbo_16k_0613 = "gpt-3.5-turbo-16k-0613"
}

async function streamOpenAiResponse(prompt: OpenaiPrompt,
                                    consumer: (message: string) => void,
                                    endOfStreamListener: () => void = () => {},
                                    onError: (error: any) => void = () => {}
): Promise<void> {
  try {
    if (!appStore().openai) {
      throw new Error("OpenAI is not initialized");
    }

    const stream = await appStore().openai!.chat.completions.create({
      messages: prompt.messages.map(message => ({
        role: message.role,
        content: message.content
      })),
      model: prompt.model,
      stream: true
    });

    for await (const part of stream) {
      consumer(part.choices[0]?.delta?.content || "");
    }

    endOfStreamListener();
  } catch (e) {
    onError(e);
  }
}

export {
  streamOpenAiResponse
};

