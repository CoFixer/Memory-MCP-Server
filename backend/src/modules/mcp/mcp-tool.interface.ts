export interface McpTool {
  getDescription(): string;
  getInputSchema(): object;
  execute(user: any, args: any): Promise<any>;
}
