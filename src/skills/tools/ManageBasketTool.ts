import { LuaTool } from "lua-cli";
import { z } from "zod";

/**
 * Tool to manage grocery basket - add or remove items
 */
export default class ManageBasketTool implements LuaTool {
    name = "manage_basket";
    description = "Add items to or remove items from the grocery basket. Returns updated basket with item count and total.";
    
    inputSchema = z.object({
        currentItems: z.array(z.string()).describe("Current list of items in the basket"),
        action: z.enum(["add", "remove"]).describe("Whether to add or remove items"),
        items: z.array(z.string()).describe("Items to add or remove from the basket")
    });

    async execute(input: z.infer<typeof this.inputSchema>) {
        const { currentItems, action, items } = input;
        
        let updatedItems: string[];
        
        if (action === "add") {
            // Add items, avoiding duplicates (case-insensitive)
            const existingLower = currentItems.map(i => i.toLowerCase());
            const newItems = items.filter(item => !existingLower.includes(item.toLowerCase()));
            updatedItems = [...currentItems, ...newItems];
        } else {
            // Remove items (case-insensitive matching)
            const toRemoveLower = items.map(i => i.toLowerCase());
            updatedItems = currentItems.filter(item => !toRemoveLower.includes(item.toLowerCase()));
        }

        const addedCount = action === "add" ? items.length : 0;
        const removedCount = action === "remove" ? currentItems.length - updatedItems.length : 0;

        return {
            items: updatedItems,
            itemCount: updatedItems.length,
            action: action,
            itemsChanged: action === "add" ? addedCount : removedCount,
            message: action === "add" 
                ? `Added ${addedCount} item(s). Basket now has ${updatedItems.length} item(s).`
                : `Removed ${removedCount} item(s). Basket now has ${updatedItems.length} item(s).`
        };
    }
}
