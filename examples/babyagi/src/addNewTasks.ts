import * as $ from "@gptagent/agent";

export async function addNewTasks({
  objective,
  completedTask,
  completedTaskResult,
  existingTasks,
  generateText,
}: {
  objective: string;
  completedTask: string;
  completedTaskResult: string;
  existingTasks: string[];
  generateText: $.text.GenerateChatTextFunction;
}) {
  const generatedNewTasksText = await generateText({
    messages: [
      {
        role: "system",
        content: `You are an task creation AI that uses the result of an execution agent to create new tasks with the following objective: ${objective}.
The last completed task has the result: ${completedTaskResult}.
This result was based on this task description: ${completedTask}.
These are the incomplete tasks: ${existingTasks.join(", ")}. 
Based on the result, create new tasks to be completed by the AI system that do not overlap with incomplete tasks.
Return the tasks as an array.`,
      },
    ],
  });

  return existingTasks.concat(generatedNewTasksText.trim().split("\n"));
}
