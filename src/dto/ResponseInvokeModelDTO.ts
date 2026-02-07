export default interface ResponseInvokeModelDTO {
  output: {
    message: {
      content: [
        {
          text: string;
        },
      ];
      role: string;
    };
  };
  stopReason: string;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cacheReadInputTokenCount: number;
    cacheWriteInputTokenCount: number;
  };
}
