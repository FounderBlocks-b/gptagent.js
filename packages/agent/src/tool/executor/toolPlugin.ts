import { FastifyInstance } from "fastify";
import { ToolRegistry } from "./ToolRegistry";

export function createToolPlugin({
  toolRegistry,
}: {
  toolRegistry: ToolRegistry;
}) {
  return async function toolPlugin(fastify: FastifyInstance) {
    fastify.post<{ Params: { toolType: string } }>("/tool/:toolType", {
      async handler(request, reply) {
        try {
          const toolType = request.params.toolType;
          const tool = toolRegistry.getTool(toolType);

          const input = tool.inputSchema.parse(request.body);

          console.log(tool);

          const output = await tool.execute({
            input,
            action: tool,
          });

          const textOutput = JSON.stringify(output);

          reply.status(200).send(textOutput);
        } catch (error: any) {
          reply.status(500).send({
            message: "An error occurred while processing the command.",
            error: error.message,
          });
        }
      },
    });
  };
}
