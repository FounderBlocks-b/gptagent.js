import {
  OpenAIChatCompletionModel,
  OpenAIChatMessage,
  createChatCompletion,
} from ".";
import { retryWithExponentialBackoff } from "../../util/retryWithExponentialBackoff";

export type TextGenerationResult =
  | {
      success: true;
      generatedText: string;
      metadata: {
        model: string;
        startEpochSeconds: number;
        durationInMs: number;
        tries: number;
        costInMilliCent: number;
      };
    }
  | {
      success: false;
      error: unknown;
      metadata: {
        model: string;
        startEpochSeconds: number;
        durationInMs: number;
        tries: number;
      };
    };

export const generateChatText =
  ({
    apiKey,
    model,
    temperature = 0,
    maxTokens,
  }: {
    apiKey: string;
    model: OpenAIChatCompletionModel;
    temperature?: number;
    maxTokens?: number;
  }) =>
  async ({ messages }: { messages: OpenAIChatMessage[] }): Promise<string> => {
    const startTime = performance.now();
    const startEpochSeconds = Math.floor(
      (performance.timeOrigin + startTime) / 1000
    );

    const response = await retryWithExponentialBackoff(() =>
      createChatCompletion({
        apiKey,
        messages,
        model,
        temperature,
        maxTokens,
      })
    );

    const textGenerationDurationInMs = Math.ceil(performance.now() - startTime);

    if (!response.success) {
      // this.recordTextGeneration?.({
      //   result: {
      //     success: false,
      //     error: response.error,
      //     metadata: {
      //       model,
      //       startEpochSeconds,
      //       durationInMs: textGenerationDurationInMs,
      //       tries: response.tries,
      //     },
      //   },
      // });

      throw response.error; // TODO wrap error
    }

    const generatedText = response.result.choices[0].message.content;

    // this.recordTextGeneration?.({
    //   result: {
    //     success: true,
    //     generatedText,
    //     metadata: {
    //       model,
    //       startEpochSeconds,
    //       durationInMs: textGenerationDurationInMs,
    //       tries: response.tries,
    //       costInMilliCent: calculateCallCostInMillicent({
    //         model,
    //         usage: response.result.usage,
    //       }),
    //     },
    //   },
    // });

    return generatedText;
  };
