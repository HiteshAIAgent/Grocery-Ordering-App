import { LuaTool } from "lua-cli";
import { z } from "zod";

/**
 * Tool to parse grocery items from user input
 * Handles multiple separators: comma, space, period
 */
export default class ParseItemsTool implements LuaTool {
    name = "parse_grocery_items";
    description = "Parse a list of grocery items from user input. Items can be separated by commas, spaces, or periods.";
    
    inputSchema = z.object({
        userInput: z.string().describe("The user's input containing grocery items separated by commas, spaces, or periods")
    });

    async execute(input: z.infer<typeof this.inputSchema>) {
        const { userInput } = input;
        
        // Split by comma, space, or period, then clean up
        const items = userInput
            .split(/[,.\s]+/)
            .map(item => item.trim())
            .filter(item => item.length > 0);
        
        return {
            items: items,
            itemCount: items.length,
            message: `Found ${items.length} item(s): ${items.join(", ")}`
        };
    }
}
