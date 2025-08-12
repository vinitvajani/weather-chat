const API_URL = "https://sparse-mango-iron.mastra.cloud/api/agents/weatherAgent/stream";
const THREAD_ID = "6000223"; // Replace with your actual roll number

export async function* sendMessageStream(userMessage) {
  console.log("Sending to API:", userMessage);

  const response = await fetch(API_URL, {
    method: "POST",
    headers: {
      "x-mastra-dev-playground": "true",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messages: [{ role: "user", content: userMessage }],
      runId: "weatherAgent",
      maxRetries: 2,
      maxSteps: 5,
      temperature: 0.5,
      topP: 1,
      runtimeContext: {},
      threadId: THREAD_ID,
      resourceId: "weatherAgent",
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("API error:", response.status, errorText);
    throw new Error(`API error ${response.status}: ${errorText}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value, { stream: true });
    const matches = [...chunk.matchAll(/0:"([^"]+)"/g)];
    for (const match of matches) {
      yield match[1];
    }
  }
}
